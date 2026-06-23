import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { code, cart_total, customer_email } = await request.json();

    if (!code || typeof cart_total !== 'number') {
      return NextResponse.json(
        { valid: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', code.trim())
      .eq('is_active', true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ valid: false, error: 'Invalid coupon code' });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'This coupon has expired' });
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json({ valid: false, error: 'This coupon has reached its usage limit' });
    }

    if (coupon.min_order_value && cart_total < coupon.min_order_value) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order value of $${coupon.min_order_value} required`,
      });
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
        return NextResponse.json({ valid: false, error: 'You have already used this coupon' });
      }
    } else if (customer_email) {
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('customer_email', customer_email)
        .eq('coupon_code', coupon.code)
        .neq('status', 'Cancelled')
        .limit(1)
        .maybeSingle();

      if (existingOrder) {
        return NextResponse.json({ valid: false, error: 'This coupon has already been used with this email' });
      }
    }

    const discount_amount =
      coupon.discount_type === 'percentage'
        ? cart_total * (coupon.discount_value / 100)
        : Math.min(coupon.discount_value, cart_total);

    return NextResponse.json({
      valid: true,
      coupon_id: coupon.id,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount_amount,
    });
  } catch {
    return NextResponse.json(
      { valid: false, error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
