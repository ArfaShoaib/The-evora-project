'use server';

import { createClient } from '@/lib/supabase/server';
import type { Json } from '@/types/supabase';
import { revalidatePath } from 'next/cache';

// ─── Products (for client components) ───────────────────────────────────────

export async function getProductsByIdsAction(ids: string[]) {
  if (!ids.length) return [];

  const { getProductsByIds } = await import('@/lib/queries');
  return getProductsByIds(ids);
}

export async function searchProductsAction(query: string) {
  if (!query.trim()) return [];

  const { getProducts } = await import('@/lib/queries');
  const allProducts = await getProducts();
  const q = query.toLowerCase();

  return allProducts
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    )
    .slice(0, 8);
}

// ─── Wishlist ────────────────────────────────────────────────────────────────

export async function getWishlist(): Promise<string[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('wishlists')
    .select('product_id')
    .eq('user_id', user.id);

  return data?.map((w) => w.product_id) || [];
}

export async function toggleWishlist(productId: string): Promise<{ added: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: existing } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single();

  if (existing) {
    await supabase.from('wishlists').delete().eq('id', existing.id);
    return { added: false };
  } else {
    await supabase.from('wishlists').insert({ user_id: user.id, product_id: productId });
    return { added: true };
  }
}

export async function isInWishlist(productId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single();

  return !!data;
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export async function getProductReviews(productId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(name, avatar_url)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function addReview(productId: string, rating: number, review: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user has a profile record
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!profile) {
    // Create profile if missing
    const { error: profileError } = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    });
    if (profileError) throw 'Please log in to submit a review';
  }

  const { error } = await supabase.from('reviews').insert({
    user_id: user.id,
    product_id: productId,
    rating,
    review,
  });

  if (error) {
    if (error.message.includes('row-level security') || error.message.includes('violates')) {
      throw 'Not authenticated';
    }
    throw error.message;
  }
  return { success: true };
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function getUserOrders() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, images))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function getUserOrder(orderId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, thumbnail, price))')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (error) return null;
  return data;
}

export async function createOrder(orderData: {
  items: Array<{ product_id: string; variant_id?: string; quantity: number; price: number }>;
  shipping_address: Record<string, unknown>;
  billing_address: Record<string, unknown>;
  payment_method: string;
  customer_email?: string;
  coupon_id?: string;
  coupon_code?: string;
  discount_amount?: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const total_price = orderData.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user?.id || null,
      customer_email: orderData.customer_email || null,
      total_price,
      shipping_address: orderData.shipping_address as Json,
      billing_address: orderData.billing_address as Json,
      payment_method: orderData.payment_method,
      coupon_id: orderData.coupon_id || null,
      coupon_code: orderData.coupon_code || null,
      discount_amount: orderData.discount_amount || 0,
    })
    .select()
    .single();

  if (orderError) throw orderError.message;

  const orderItems = orderData.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    variant_id: item.variant_id || null,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw itemsError.message;

  return { orderId: order.id, orderNumber: order.order_number as string };
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return data;
}

export async function updateProfile(updates: {
  name?: string;
  avatar_url?: string;
  phone?: string;
  address_line1?: string;
  city?: string;
  postal_code?: string;
  alternate_email?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) throw error.message;
  return { success: true };
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function trackOrder(orderNumber: string, email: string) {
  const supabase = await createClient();
  const cleanOrderNumber = orderNumber.replace(/^#+/, '').toUpperCase();

  const { data: order, error } = await supabase
    .from('orders')
    .select('id, order_number, status, total_price, created_at, shipping_address, customer_email, courier_name, tracking_number, order_items(quantity, price, products(name, images))')
    .eq('order_number', cleanOrderNumber)
    .single();

  if (error || !order) return null;

  if (order.customer_email && order.customer_email.toLowerCase() !== email.toLowerCase()) {
    return null;
  }

  return order;
}

// ─── Coupons ────────────────────────────────────────────────────────────────

export async function validateCoupon(code: string, subtotal: number) {
  const supabase = await createClient();

  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .ilike('code', code)
    .eq('is_active', true)
    .single();

  if (error || !coupon) return { valid: false, error: 'Invalid coupon code' };

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { valid: false, error: 'This coupon has expired' };
  }

  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    return { valid: false, error: 'This coupon has reached its usage limit' };
  }

  if (coupon.min_order_value && subtotal < coupon.min_order_value) {
    return {
      valid: false,
      error: `Minimum order value of $${coupon.min_order_value} required`,
    };
  }

  // Per-user check: has this user already used this coupon?
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user.id)
      .eq('coupon_code', coupon.code)
      .neq('status', 'Cancelled')
      .limit(1)
      .maybeSingle();

    if (existingOrder) {
      return { valid: false, error: 'You have already used this coupon' };
    }
  }

  const discount =
    coupon.discount_type === 'percentage'
      ? subtotal * (coupon.discount_value / 100)
      : coupon.discount_value;

  return {
    valid: true,
    couponId: coupon.id,
    discountType: coupon.discount_type,
    discountValue: coupon.discount_value,
    discount,
  };
}

// ─── Collections ────────────────────────────────────────────────────────────

export async function getCollections() {
  const { getCategories } = await import('@/lib/queries');
  return getCategories();
}

// ─── Refunds ─────────────────────────────────────────────────────────────────

export async function requestRefund(orderId: string, reason: string, amount: number) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: 'Not authenticated' };

    const { data: existing } = await supabase
      .from('refunds')
      .select('id')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .single();

    if (existing) return { success: false, error: 'Refund already requested for this order' };

    const { error: insertError } = await supabase.from('refunds').insert({
      order_id: orderId,
      user_id: user.id,
      amount,
      reason,
    });

    if (insertError) return { success: false, error: insertError.message };

    await supabase
      .from('orders')
      .update({ refund_status: 'refund_requested' })
      .eq('id', orderId);

    revalidatePath('/account/orders');
    revalidatePath(`/account/orders/${orderId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'An error occurred' };
  }
}

export async function getUserRefunds() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('refunds')
      .select('*, orders:order_id(total_price, status)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'An error occurred' };
  }
}

// ─── Newsletter ─────────────────────────────────────────────────────────────

export async function subscribeToNewsletter(email: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email: email.toLowerCase().trim() });

  if (error) {
    if (error.message.includes('unique') || error.message.includes('duplicate')) {
      return { success: false, error: 'This email is already subscribed' };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
}
