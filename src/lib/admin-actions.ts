'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin-server';
import type { Database } from '@/types/supabase';

// ─── Dashboard ──────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  avgOrderValue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
}

export interface RecentOrder {
  id: string;
  customer: string;
  total: number;
  status: string;
  date: string;
}

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  image: string;
}

export interface SalesData {
  month: string;
  revenue: number;
}

export interface OrderStatusBreakdown {
  status: string;
  count: number;
}

export interface TopCustomer {
  name: string;
  email: string;
  totalSpent: number;
  orders: number;
}

export interface CategorySales {
  name: string;
  value: number;
}

export interface ActivityItem {
  id: string;
  type: 'order' | 'customer' | 'stock' | 'review';
  message: string;
  time: string;
}

export interface AnalyticsRevenue {
  month: string;
  revenue: number;
}

export interface AnalyticsOrders {
  week: string;
  orders: number;
}

export interface TopProductSales {
  name: string;
  sales: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createAdminClient();

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [ordersResult, customersResult, productsResult, thisMonthResult, lastMonthResult, pendingResult] = await Promise.all([
    supabase.from('orders').select('total_price'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('total_price').gte('created_at', thisMonthStart),
    supabase.from('orders').select('total_price').gte('created_at', lastMonthStart).lt('created_at', lastMonthEnd),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'Pending'),
  ]);

  const totalRevenue = ordersResult.data?.reduce((sum, o) => sum + (o.total_price || 0), 0) ?? 0;
  const totalOrders = ordersResult.data?.length ?? 0;
  const totalCustomers = customersResult.count ?? 0;
  const totalProducts = productsResult.count ?? 0;
  const pendingOrders = pendingResult.count ?? 0;
  const thisMonthRevenue = thisMonthResult.data?.reduce((sum, o) => sum + (o.total_price || 0), 0) ?? 0;
  const lastMonthRevenue = lastMonthResult.data?.reduce((sum, o) => sum + (o.total_price || 0), 0) ?? 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return { totalRevenue, totalOrders, totalCustomers, totalProducts, pendingOrders, avgOrderValue, thisMonthRevenue, lastMonthRevenue };
}

export async function getRecentOrders(): Promise<RecentOrder[]> {
  const supabase = await createAdminClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('id, total_price, status, created_at, user_id, profiles(name)')
    .order('created_at', { ascending: false })
    .limit(8);

  if (!orders) return [];

  return orders.map((o) => ({
    id: o.id.slice(0, 8).toUpperCase(),
    customer: (o.profiles as Record<string, unknown>)?.name as string || 'Unknown',
    total: o.total_price,
    status: o.status,
    date: new Date(o.created_at).toISOString().split('T')[0],
  }));
}

export async function getLowStockProducts(): Promise<LowStockProduct[]> {
  const supabase = await createAdminClient();
  const { data } = await supabase
    .from('products')
    .select('id, name, stock, images')
    .lte('stock', 5)
    .order('stock', { ascending: true })
    .limit(5);

  if (!data) return [];
  return data.map((p) => ({
    id: p.id,
    name: p.name,
    stock: p.stock,
    image: p.images?.[0] || '',
  }));
}

export async function getSalesData(): Promise<SalesData[]> {
  const supabase = await createAdminClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('total_price, created_at');

  if (!orders) return [];

  const monthly: Record<string, number> = {};
  orders.forEach((o) => {
    const d = new Date(o.created_at);
    const key = d.toLocaleString('default', { month: 'short' });
    monthly[key] = (monthly[key] || 0) + o.total_price;
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.slice(0, 6).map((m) => ({ month: m, revenue: monthly[m] || 0 }));
}

export async function getOrderStatusBreakdown(): Promise<OrderStatusBreakdown[]> {
  const supabase = await createAdminClient();
  const { data } = await supabase.from('orders').select('status');
  if (!data) return [];

  const counts: Record<string, number> = {};
  data.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });

  return Object.entries(counts).map(([status, count]) => ({ status, count }));
}

export async function getTopCustomers(): Promise<TopCustomer[]> {
  const supabase = await createAdminClient();
  const { data: profiles } = await supabase.from('profiles').select('id, name, email');
  if (!profiles) return [];

  const customers = await Promise.all(
    profiles.slice(0, 10).map(async (p) => {
      const { data: orders } = await supabase
        .from('orders')
        .select('total_price')
        .eq('user_id', p.id);
      const totalSpent = orders?.reduce((sum, o) => sum + (o.total_price || 0), 0) ?? 0;
      return { name: p.name || 'Unknown', email: p.email || '', totalSpent, orders: orders?.length || 0 };
    })
  );

  return customers.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
}

export async function getCategorySales(): Promise<CategorySales[]> {
  const supabase = await createAdminClient();
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('products(category_id, categories(name))');

  if (!orderItems) return [];

  const catMap: Record<string, number> = {};
  orderItems.forEach((item) => {
    const cat = (item.products as Record<string, unknown>)?.categories as Record<string, unknown> | null;
    const name = (cat?.name as string) || 'Uncategorized';
    catMap[name] = (catMap[name] || 0) + 1;
  });

  return Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export async function getActivityFeed(): Promise<ActivityItem[]> {
  const supabase = await createAdminClient();
  const items: ActivityItem[] = [];

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, profiles(name), created_at')
    .order('created_at', { ascending: false })
    .limit(3);

  recentOrders?.forEach((o) => {
    const name = (o.profiles as Record<string, unknown>)?.name as string || 'Customer';
    items.push({ id: `o-${o.id}`, type: 'order', message: `New order from ${name}`, time: formatTimeAgo(o.created_at) });
  });

  const { data: recentCustomers } = await supabase
    .from('profiles')
    .select('id, name, created_at')
    .order('created_at', { ascending: false })
    .limit(2);

  recentCustomers?.forEach((c) => {
    items.push({ id: `c-${c.id}`, type: 'customer', message: `New customer: ${c.name}`, time: formatTimeAgo(c.created_at) });
  });

  const { data: lowStock } = await supabase
    .from('products')
    .select('id, name, stock')
    .lte('stock', 3)
    .gt('stock', 0)
    .limit(2);

  lowStock?.forEach((p) => {
    items.push({ id: `s-${p.id}`, type: 'stock', message: `Low stock: ${p.name} (${p.stock} left)`, time: 'Today' });
  });

  return items.slice(0, 6);
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? 's' : ''} ago`;
}

// ─── Analytics Actions ─────────────────────────────────────────────────────

export async function getAnalyticsRevenue(): Promise<AnalyticsRevenue[]> {
  const supabase = await createAdminClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('total_price, created_at');

  if (!orders) return [];

  const monthly: Record<string, number> = {};
  orders.forEach((o) => {
    const d = new Date(o.created_at);
    const key = d.toLocaleString('default', { month: 'short' });
    monthly[key] = (monthly[key] || 0) + (o.total_price || 0);
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((m) => ({ month: m, revenue: monthly[m] || 0 }));
}

export async function getAnalyticsOrdersByWeek(): Promise<AnalyticsOrders[]> {
  const supabase = await createAdminClient();
  const now = new Date();
  const eightWeeksAgo = new Date(now.getTime() - 8 * 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: orders } = await supabase
    .from('orders')
    .select('created_at')
    .gte('created_at', eightWeeksAgo)
    .order('created_at', { ascending: true });

  if (!orders) return [];

  const weekMap: Record<number, number> = {};
  orders.forEach((o) => {
    const d = new Date(o.created_at);
    const diffWeeks = Math.floor((d.getTime() - new Date(eightWeeksAgo).getTime()) / (7 * 24 * 60 * 60 * 1000));
    weekMap[diffWeeks] = (weekMap[diffWeeks] || 0) + 1;
  });

  return Array.from({ length: 8 }, (_, i) => ({
    week: `W${i + 1}`,
    orders: weekMap[i] || 0,
  }));
}

export async function getAnalyticsTopProducts(): Promise<TopProductSales[]> {
  const supabase = await createAdminClient();
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('product_id, quantity, products(name)');

  if (!orderItems) return [];

  const productSales: Record<string, { name: string; sales: number }> = {};
  orderItems.forEach((item) => {
    if (!item.product_id) return;
    const productName = (item.products as Record<string, unknown>)?.name as string || 'Unknown';
    if (!productSales[item.product_id]) {
      productSales[item.product_id] = { name: productName, sales: 0 };
    }
    productSales[item.product_id].sales += item.quantity || 0;
  });

  return Object.values(productSales)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);
}

// ─── Products CRUD ──────────────────────────────────────────────────────────

export type ProductRow = Database['public']['Tables']['products']['Row'];
export type CategoryRow = Database['public']['Tables']['categories']['Row'];

export interface AdminProduct extends ProductRow {
  categories: Pick<CategoryRow, 'name' | 'slug'> | null;
}

export interface CategoryWithParent extends CategoryRow {
  parent_name?: string | null;
}

export async function getAdminProducts(opts?: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ products: AdminProduct[]; total: number }> {
  const supabase = await createAdminClient();
  const page = opts?.page ?? 1;
  const pageSize = opts?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('products')
    .select('*, categories(name, slug)', { count: 'exact' });

  if (opts?.search) {
    query = query.ilike('name', `%${opts.search}%`);
  }
  if (opts?.status && opts.status !== 'all') {
    query = query.eq('status', opts.status as never);
  }

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, count } = await query;
  const products = (data as AdminProduct[]) ?? [];

  return { products, total: count ?? 0 };
}

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  const supabase = await createAdminClient();
  const { data } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('id', id)
    .single();
  return (data as AdminProduct) ?? null;
}

export async function getAdminCategories(): Promise<CategoryWithParent[]> {
  const supabase = await createAdminClient();
  const { data } = await supabase.from('categories').select('*, categories!parent_id(name)').order('name');
  if (!data) return [];
  return data.map((c) => ({
    ...c,
    parent_name: (c.categories as { name: string } | null)?.name ?? null,
  })) as CategoryWithParent[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function createProduct(formData: {
  name: string;
  description?: string;
  price: number;
  sale_price?: number | null;
  stock: number;
  sku: string;
  category_id?: string | null;
  category?: string | null;
  subcategory?: string | null;
  collection_id?: string | null;
  status?: string;
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  images?: string[];
  thumbnail?: string | null;
  is_new?: boolean;
  is_best_seller?: boolean;
  is_trending?: boolean;
  collection?: string | null;
  variations?: Record<string, string[] | Record<string, string> | undefined> | null;
}) {
  const supabase = await createAdminClient();
  const slug = slugify(formData.name) + '-' + Date.now().toString(36);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertData: any = {
    name: formData.name,
    slug,
    description: formData.description || null,
    price: formData.price,
    sale_price: formData.sale_price || null,
    stock: formData.stock,
    sku: formData.sku,
    category_id: formData.category_id || null,
    category: formData.category || null,
    subcategory: formData.subcategory || null,
    collection_id: formData.collection_id || null,
    status: (formData.status as 'draft' | 'published' | 'archived') || 'draft',
    sizes: formData.sizes || [],
    colors: formData.colors || [],
    images: formData.images || [],
    thumbnail: formData.thumbnail || null,
    is_new: formData.is_new ?? false,
    is_best_seller: formData.is_best_seller ?? false,
    is_trending: formData.is_trending ?? false,
    collection: formData.collection || null,
    variations: formData.variations || null,
  };
  const { data, error } = await supabase.from('products').insert(insertData).select('id')
    .single();

  if (error) throw new Error(error.message);
  return { success: true, productId: data?.id as string | undefined };
}

export async function updateProduct(
  id: string,
  formData: {
    name?: string;
    description?: string;
    price?: number;
    sale_price?: number | null;
    stock?: number;
    sku?: string;
    category_id?: string | null;
    category?: string | null;
    subcategory?: string | null;
    collection_id?: string | null;
    status?: string;
    sizes?: string[];
    colors?: { name: string; hex: string }[];
    images?: string[];
    thumbnail?: string | null;
    is_new?: boolean;
    is_best_seller?: boolean;
    is_trending?: boolean;
    collection?: string | null;
    variations?: Record<string, string[] | Record<string, string> | undefined> | null;
  }
) {
  const supabase = await createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {};
  // Only include defined fields to avoid overwriting with null/undefined
  for (const [key, value] of Object.entries(formData)) {
    if (value !== undefined) {
      updateData[key] = value;
    }
  }

  const { error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function uploadProductImage(formData: FormData) {
  const supabase = await createAdminClient();
  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(error.message);

  const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
  return { url: urlData.publicUrl };
}

export interface MediaFile {
  id: string;
  name: string;
  size: string;
  url: string;
  bucket: string;
  createdAt: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export async function getMediaFiles(): Promise<MediaFile[]> {
  const supabase = await createAdminClient();
  const buckets = ['product-images', 'banners'];
  const files: MediaFile[] = [];

  for (const bucket of buckets) {
    const { data, error } = await supabase.storage.from(bucket).list('', {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    });
    if (error || !data) continue;
    for (const file of data) {
      if (!file.name || file.name.endsWith('/')) continue;
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(file.name);
      files.push({
        id: `${bucket}/${file.name}`,
        name: file.name,
        size: formatFileSize(file.metadata?.size ?? 0),
        url: urlData.publicUrl,
        bucket,
        createdAt: file.created_at || '',
      });
    }
  }

  return files.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
}

export async function uploadMediaFile(formData: FormData) {
  const supabase = await createAdminClient();
  const file = formData.get('file') as File;
  const bucket = (formData.get('bucket') as string) || 'product-images';
  if (!file) throw new Error('No file provided');

  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(error.message);

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return {
    id: `${bucket}/${fileName}`,
    name: file.name,
    size: formatFileSize(file.size),
    url: urlData.publicUrl,
    bucket,
  };
}

export async function deleteMediaFile(bucket: string, path: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(error.message);
  return { success: true };
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export type OrderRow = Database['public']['Tables']['orders']['Row'];
export type OrderItemRow = Database['public']['Tables']['order_items']['Row'];

export interface AdminOrder extends OrderRow {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'name' | 'email'> | null;
  order_items: (OrderItemRow & {
    products: Pick<Database['public']['Tables']['products']['Row'], 'name' | 'thumbnail' | 'price'> | null;
  })[];
}

export async function getAdminOrders(opts?: {
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ orders: AdminOrder[]; total: number }> {
  const supabase = await createAdminClient();
  const page = opts?.page ?? 1;
  const pageSize = opts?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('orders')
    .select('*, profiles(name, email), order_items(*, products(name, thumbnail))', { count: 'exact' });

  if (opts?.status && opts.status !== 'all') {
    const capitalized = (opts.status.charAt(0).toUpperCase() + opts.status.slice(1)) as 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    query = query.eq('status', capitalized);
  }

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, count } = await query;
  return { orders: (data as AdminOrder[]) ?? [], total: count ?? 0 };
}

export async function getAdminOrder(id: string): Promise<AdminOrder | null> {
  const supabase = await createAdminClient();
  const { data } = await supabase
    .from('orders')
    .select('*, profiles(name, email, phone), order_items(*, products(name, thumbnail, price))')
    .eq('id', id)
    .single();
  return (data as AdminOrder) ?? null;
}

export async function updateOrderStatus(
  id: string,
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
) {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function updateOrderWithTracking(
  id: string,
  data: {
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    courier_name?: string | null;
    tracking_number?: string | null;
  }
) {
  const supabase = await createAdminClient();
  const update: Record<string, unknown> = { status: data.status };
  if (data.courier_name !== undefined) update.courier_name = data.courier_name;
  if (data.tracking_number !== undefined) update.tracking_number = data.tracking_number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from('orders').update(update as any).eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
}

// ─── Categories CRUD ────────────────────────────────────────────────────────

export async function createCategory(data: { name: string; slug: string; description?: string }) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from('categories').insert({
    name: data.name,
    slug: data.slug,
    description: data.description || null,
  });
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function updateCategory(
  id: string,
  data: { name?: string; slug?: string; description?: string }
) {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from('categories')
    .update({ ...data, description: data.description ?? null })
    .eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
}

// ─── Subcategories CRUD ───────────────────────────────────────────────────

export async function createSubcategory(data: {
  name: string;
  slug: string;
  parent_id: string;
  description?: string;
  variation_fields?: string[];
}) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from('categories').insert({
    name: data.name,
    slug: data.slug,
    parent_id: data.parent_id,
    description: data.description || null,
    variation_fields: data.variation_fields || null,
  });
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function updateSubcategory(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    variation_fields?: string[];
  }
) {
  const supabase = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: any = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.slug !== undefined) update.slug = data.slug;
  if (data.description !== undefined) update.description = data.description ?? null;
  if (data.variation_fields !== undefined) update.variation_fields = data.variation_fields || null;
  const { error } = await supabase.from('categories').update(update).eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function deleteSubcategory(id: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function getSubcategories(parentId: string) {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', parentId)
    .order('name');
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ─── Inventory ──────────────────────────────────────────────────────────────

export interface InventoryProduct {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  status: string;
  categories: Pick<CategoryRow, 'name'> | null;
}

export async function getInventoryProducts(opts?: {
  search?: string;
  filter?: string;
}): Promise<InventoryProduct[]> {
  const supabase = await createAdminClient();

  let query = supabase
    .from('products')
    .select('id, name, sku, stock, price, status, categories(name)');

  if (opts?.search) {
    query = query.ilike('name', `%${opts.search}%`);
  }

  if (opts?.filter === 'out') {
    query = query.eq('stock', 0);
  } else if (opts?.filter === 'low') {
    query = query.gt('stock', 0).lte('stock', 10);
  } else if (opts?.filter === 'in') {
    query = query.gt('stock', 10);
  }

  query = query.order('stock', { ascending: true });

  const { data } = await query;
  return (data as InventoryProduct[]) ?? [];
}

export async function updateStock(id: string, stock: number) {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from('products')
    .update({ stock })
    .eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
}

// ─── Coupons CRUD ───────────────────────────────────────────────────────────

export type CouponRow = Database['public']['Tables']['coupons']['Row'];

export async function getCoupons(): Promise<CouponRow[]> {
  const supabase = await createAdminClient();
  const { data } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function createCoupon(data: {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value?: number | null;
  usage_limit?: number | null;
  expires_at?: string | null;
  is_active?: boolean;
}) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from('coupons').insert({
    code: data.code.toUpperCase(),
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    min_order_value: data.min_order_value || null,
    usage_limit: data.usage_limit || null,
    expires_at: data.expires_at || null,
    is_active: data.is_active ?? true,
  });
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function updateCoupon(
  id: string,
  data: {
    code?: string;
    discount_type?: 'percentage' | 'fixed';
    discount_value?: number;
    min_order_value?: number | null;
    usage_limit?: number | null;
    expires_at?: string | null;
    is_active?: boolean;
  }
) {
  const supabase = await createAdminClient();
  const updateData: Record<string, unknown> = { ...data };
  if (data.code) updateData.code = data.code.toUpperCase();
  const { error } = await supabase
    .from('coupons')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(updateData as any)
    .eq('id', id);
  if (error) throw new Error(error.message);

  return { success: true };
}

export async function toggleCouponActive(id: string, isActive: boolean) {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from('coupons')
    .update({ is_active: isActive })
    .eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function deleteCoupon(id: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
}

// ========================
// CUSTOMERS
// ========================

export async function getAdminCustomers() {
  const supabase = await createAdminClient();

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const customersWithStats = await Promise.all(
    (profiles || []).map(async (profile) => {
      const { data: orders } = await supabase
        .from('orders')
    .select('id, total_price, status, created_at')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      return {
        id: profile.id,
        name: profile.name || profile.email?.split('@')[0] || 'Unknown',
        email: profile.email,
        phone: profile.phone || '',
        orders_count: orders?.length || 0,
        total_spent: orders?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0,
        joined: profile.created_at,
        last_order: orders?.[0] || null,
      };
    })
  );

  return customersWithStats;
}

export async function getAdminCustomer(id: string) {
  const supabase = await createAdminClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, total_price, status, created_at')
    .eq('user_id', id)
    .order('created_at', { ascending: false });

  return {
    id: profile.id,
    name: profile.name || profile.email?.split('@')[0] || 'Unknown',
    email: profile.email,
    phone: profile.phone || '',
    address: profile.address_line1 || '',
    joined: profile.created_at,
    orders: orders || [],
  };
}

// ========================
// SITE CONTENT
// ========================

export async function getSiteContent() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .order('section_key');

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getSiteSection(sectionKey: string) {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .eq('section_key', sectionKey)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateSiteSection(sectionKey: string, content: Record<string, unknown>) {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from('site_content')
    .upsert(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { section_key: sectionKey, content: content as any, updated_at: new Date().toISOString() },
      { onConflict: 'section_key' }
    );

  if (error) throw new Error(error.message);
  revalidatePath('/');
  return { success: true };
}

// ─── Site Settings ─────────────────────────────────────────────────────────

export async function getSiteSettings(key: string): Promise<Record<string, unknown> | null> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error || !data) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any).value as Record<string, unknown>;
}

export async function updateSiteSettings(key: string, value: Record<string, unknown>) {
  const supabase = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

  if (error) throw new Error(error.message);
  return { success: true };
}

// ─── Collections CRUD ──────────────────────────────────────────────────────

export type CollectionRow = Database['public']['Tables']['collections']['Row'];

export async function getAdminCollections(): Promise<CollectionRow[]> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('sort_order');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAdminCollection(id: string): Promise<CollectionRow | null> {
  const supabase = await createAdminClient();
  const { data } = await supabase
    .from('collections')
    .select('*')
    .eq('id', id)
    .single();
  return data ?? null;
}

export async function createCollection(data: {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
}) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from('collections').insert({
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    image_url: data.image_url || null,
    sort_order: data.sort_order ?? 0,
    is_active: data.is_active ?? true,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/collections');
  revalidatePath('/collections');
  return { success: true };
}

export async function updateCollection(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    image_url?: string;
    sort_order?: number;
    is_active?: boolean;
  }
) {
  const supabase = await createAdminClient();
  const updateData = { ...data, updated_at: new Date().toISOString() };
  const { error } = await supabase
    .from('collections')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(updateData as any)
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/collections');
  revalidatePath('/collections');
  return { success: true };
}

export async function deleteCollection(id: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from('collections').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/collections');
  revalidatePath('/collections');
  return { success: true };
}

// ─── Reviews ───────────────────────────────────────────────────────────────

export interface AdminReview {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  review: string | null;
  created_at: string;
  profiles: { name: string | null; email: string | null } | null;
  products: { name: string; slug: string } | null;
}

export async function getAdminReviews(opts?: {
  search?: string;
  rating?: number;
  page?: number;
  pageSize?: number;
}): Promise<{ reviews: AdminReview[]; total: number }> {
  const supabase = await createAdminClient();
  const page = opts?.page ?? 1;
  const pageSize = opts?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('reviews')
    .select('*, profiles(name, email), products(name, slug)', { count: 'exact' });

  if (opts?.rating && opts.rating > 0) {
    query = query.eq('rating', opts.rating);
  }

  if (opts?.search) {
    query = query.ilike('review', `%${opts.search}%`);
  }

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, count } = await query;
  return { reviews: (data as AdminReview[]) ?? [], total: count ?? 0 };
}

export async function deleteReview(id: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/reviews');
  return { success: true };
}

// ─── Refunds ─────────────────────────────────────────────────────────────────

export interface RefundRow {
  id: string;
  order_id: string;
  order_number: string | null;
  user_id: string;
  amount: number;
  reason: string;
  status: string;
  admin_notes: string | null;
  rejection_reason: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
  order_total: number | null;
  order_status: string | null;
  order_shipping_address: Record<string, string> | null;
  order_payment_method: string | null;
}

export async function getAdminRefunds(opts?: {
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ refunds: RefundRow[]; total: number }> {
  const supabase = await createAdminClient();
  const page = opts?.page ?? 1;
  const pageSize = opts?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('refunds')
    .select('*, profiles:user_id(name, email), orders:order_id(total_price, status, order_number)', { count: 'exact' });

  if (opts?.status && opts.status !== 'all') {
    query = query.eq('status', opts.status as never);
  }

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, count } = await query;

  const refunds: RefundRow[] = (data ?? []).map((row: Record<string, unknown>) => {
    const profiles = row.profiles as { name: string | null; email: string | null } | null;
    const orders = row.orders as { total_price: number; status: string; order_number: string } | null;
    return {
      id: row.id as string,
      order_id: row.order_id as string,
      order_number: orders?.order_number ?? null,
      user_id: row.user_id as string,
      amount: row.amount as number,
      reason: row.reason as string,
      status: row.status as string,
      admin_notes: (row.admin_notes as string) ?? null,
      rejection_reason: (row.rejection_reason as string) ?? null,
      resolved_at: (row.resolved_at as string) ?? null,
      resolved_by: (row.resolved_by as string) ?? null,
      created_at: row.created_at as string,
      customer_name: profiles?.name ?? null,
      customer_email: profiles?.email ?? null,
      order_total: orders?.total_price ?? null,
      order_status: orders?.status ?? null,
      order_shipping_address: null,
      order_payment_method: null,
    };
  });

  return { refunds, total: count ?? 0 };
}

export async function getAdminRefund(id: string): Promise<RefundRow | null> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('refunds')
    .select('*, profiles:user_id(name, email), orders:order_id(total_price, status, order_number, shipping_address, payment_method)')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  const row = data as Record<string, unknown>;
  const profiles = row.profiles as { name: string | null; email: string | null } | null;
  const orders = row.orders as { total_price: number; status: string; order_number: string; shipping_address: Record<string, string>; payment_method: string } | null;

  return {
    id: row.id as string,
    order_id: row.order_id as string,
    order_number: orders?.order_number ?? null,
    user_id: row.user_id as string,
    amount: row.amount as number,
    reason: row.reason as string,
    status: row.status as string,
    admin_notes: (row.admin_notes as string) ?? null,
    rejection_reason: (row.rejection_reason as string) ?? null,
    resolved_at: (row.resolved_at as string) ?? null,
    resolved_by: (row.resolved_by as string) ?? null,
    created_at: row.created_at as string,
    customer_name: profiles?.name ?? null,
    customer_email: profiles?.email ?? null,
    order_total: orders?.total_price ?? null,
    order_status: orders?.status ?? null,
    order_shipping_address: orders?.shipping_address ?? null,
    order_payment_method: orders?.payment_method ?? null,
  } as RefundRow;
}

export async function getRefundStats(): Promise<{
  total: number;
  pending: number;
  approvedThisMonth: number;
  totalRefunded: number;
}> {
  const supabase = await createAdminClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [totalResult, pendingResult, approvedResult, refundedResult] = await Promise.all([
    supabase.from('refunds').select('id', { count: 'exact', head: true }),
    supabase.from('refunds').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('refunds').select('id', { count: 'exact', head: true }).eq('status', 'approved').gte('resolved_at', monthStart),
    supabase.from('refunds').select('amount').in('status', ['approved', 'processed']),
  ]);

  const totalRefunded = (refundedResult.data as { amount: number }[] | null)?.reduce((sum, r) => sum + (r.amount || 0), 0) ?? 0;

  return {
    total: totalResult.count ?? 0,
    pending: pendingResult.count ?? 0,
    approvedThisMonth: approvedResult.count ?? 0,
    totalRefunded,
  };
}

export async function approveRefund(id: string, adminNotes?: string) {
  const supabase = await createAdminClient();

  const { data: refund, error: fetchError } = await supabase
    .from('refunds')
    .select('order_id')
    .eq('id', id)
    .single();

  if (fetchError || !refund) return { success: false, error: 'Refund not found' };

  const { error } = await supabase
    .from('refunds')
    .update({
      status: 'approved',
      admin_notes: adminNotes || null,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  await supabase
    .from('orders')
    .update({ refund_status: 'refund_approved' })
    .eq('id', refund.order_id);

  revalidatePath('/admin/refunds');
  revalidatePath(`/admin/refunds/${id}`);
  return { success: true };
}

export async function rejectRefund(id: string, rejectionReason: string) {
  const supabase = await createAdminClient();

  const { data: refund, error: fetchError } = await supabase
    .from('refunds')
    .select('order_id')
    .eq('id', id)
    .single();

  if (fetchError || !refund) return { success: false, error: 'Refund not found' };

  const { error } = await supabase
    .from('refunds')
    .update({
      status: 'rejected',
      rejection_reason: rejectionReason,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  await supabase
    .from('orders')
    .update({ refund_status: 'refund_rejected' })
    .eq('id', refund.order_id);

  revalidatePath('/admin/refunds');
  revalidatePath(`/admin/refunds/${id}`);
  return { success: true };
}

export async function markRefundProcessed(id: string) {
  const supabase = await createAdminClient();

  const { data: refund, error: fetchError } = await supabase
    .from('refunds')
    .select('order_id')
    .eq('id', id)
    .single();

  if (fetchError || !refund) return { success: false, error: 'Refund not found' };

  const { error } = await supabase
    .from('refunds')
    .update({ status: 'processed' })
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  await supabase
    .from('orders')
    .update({ refund_status: 'refund_processed' })
    .eq('id', refund.order_id);

  revalidatePath('/admin/refunds');
  revalidatePath(`/admin/refunds/${id}`);
  return { success: true };
}

// ─── Newsletter Subscribers ─────────────────────────────────────────────────

export interface NewsletterSubscriber {
  id: string;
  email: string;
  created_at: string;
}

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const supabase = await createAdminClient();
  const { data } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function deleteNewsletterSubscriber(id: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
}

// ─── Hero Banners CRUD ─────────────────────────────────────────────────────

export type HeroBannerRow = Database['public']['Tables']['hero_banners']['Row'];

export async function getAdminHeroBanners(): Promise<HeroBannerRow[]> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('hero_banners')
    .select('*, collections(name)')
    .order('display_order');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAdminHeroBanner(id: string): Promise<HeroBannerRow | null> {
  const supabase = await createAdminClient();
  const { data } = await supabase
    .from('hero_banners')
    .select('*')
    .eq('id', id)
    .single();
  return data ?? null;
}

export async function createHeroBanner(data: {
  image_url: string;
  heading: string;
  subheading?: string;
  cta_text?: string;
  collection_id: string;
  display_order?: number;
  is_active?: boolean;
}) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from('hero_banners').insert({
    image_url: data.image_url,
    heading: data.heading,
    subheading: data.subheading || null,
    cta_text: data.cta_text || 'Shop Now',
    collection_id: data.collection_id,
    display_order: data.display_order ?? 0,
    is_active: data.is_active ?? true,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/hero-banners');
  revalidatePath('/');
  return { success: true };
}

export async function updateHeroBanner(
  id: string,
  data: {
    image_url?: string;
    heading?: string;
    subheading?: string;
    cta_text?: string;
    collection_id?: string;
    display_order?: number;
    is_active?: boolean;
  }
) {
  const supabase = await createAdminClient();
  const updateData = { ...data, updated_at: new Date().toISOString() };
  const { error } = await supabase
    .from('hero_banners')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(updateData as any)
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/hero-banners');
  revalidatePath('/');
  return { success: true };
}

export async function deleteHeroBanner(id: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from('hero_banners').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/hero-banners');
  revalidatePath('/');
  return { success: true };
}
