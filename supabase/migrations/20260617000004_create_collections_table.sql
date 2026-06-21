-- Creates a dedicated collections table for curated product groupings.
-- Products can optionally belong to one collection via collection_id FK.

create table public.collections (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.collections enable row level security;

create policy "Allow public read access to collections" on public.collections
  for select using (is_active = true);

create policy "Allow admin read access to all collections" on public.collections
  for select using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "Allow admin write access to collections" on public.collections
  for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

-- Add collection_id foreign key to products
alter table public.products
  add column if not exists collection_id uuid references public.collections(id) on delete set null;

create index if not exists idx_products_collection_id on public.products(collection_id);
