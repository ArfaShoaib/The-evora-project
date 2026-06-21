-- =============================================================
-- Phase 3 continued: add missing columns, storage, indexes
-- =============================================================

-- ── 1. Products table: add missing columns ────────────────────
alter table public.products
  add column if not exists stock integer not null default 0,
  add column if not exists rating numeric(3,2) default 0,
  add column if not exists review_count integer not null default 0,
  add column if not exists is_new boolean not null default false,
  add column if not exists is_best_seller boolean not null default false,
  add column if not exists is_trending boolean not null default false,
  add column if not exists colors jsonb not null default '[]'::jsonb,
  add column if not exists sizes text[] not null default '{}',
  add column if not exists collection text;

-- ── 2. Categories: add missing description ────────────────────
alter table public.categories
  add column if not exists description text;

-- ── 3. Coupons: add usage tracking ───────────────────────────
alter table public.coupons
  add column if not exists usage_limit integer,
  add column if not exists used_count integer not null default 0;

-- ── 4. Product variants: add color_hex for direct display ─────
alter table public.product_variants
  add column if not exists color_hex text;

-- ── 5. Indexes for common queries ─────────────────────────────
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_is_new on public.products(is_new);
create index if not exists idx_products_is_best_seller on public.products(is_best_seller);
create index if not exists idx_products_is_trending on public.products(is_trending);
create index if not exists idx_products_collection on public.products(collection);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_reviews_product on public.reviews(product_id);
create index if not exists idx_wishlists_user on public.wishlists(user_id);
create index if not exists idx_order_items_order on public.order_items(order_id);

-- ── 6. Storage buckets ───────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880, '{image/png,image/jpeg,image/webp,image/avif}'),
  ('banners', 'banners', true, 5242880, '{image/png,image/jpeg,image/webp,image/avif}')
on conflict (id) do nothing;

-- Storage RLS policies: public read for all buckets
create policy "Public read access for product-images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Public read access for banners"
  on storage.objects for select
  using (bucket_id = 'banners');

-- Storage RLS policies: admin write access
create policy "Admin upload to product-images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "Admin delete from product-images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "Admin upload to banners"
  on storage.objects for insert
  with check (
    bucket_id = 'banners'
    and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "Admin delete from banners"
  on storage.objects for delete
  using (
    bucket_id = 'banners'
    and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

-- ── 7. Admin helper: check role function ─────────────────────
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  );
end;
$$ language plpgsql security definer stable;
