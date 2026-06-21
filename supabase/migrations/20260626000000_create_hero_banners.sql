-- Hero banners carousel table for the storefront hero section.

create table public.hero_banners (
  id uuid default gen_random_uuid() primary key,
  image_url text not null,
  heading text not null,
  subheading text,
  cta_text text not null default 'Shop Now',
  collection_id uuid not null references public.collections(id) on delete cascade,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.hero_banners enable row level security;

create policy "Allow public read access to active hero_banners" on public.hero_banners
  for select using (is_active = true);

create policy "Allow admin read access to all hero_banners" on public.hero_banners
  for select using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "Allow admin write access to hero_banners" on public.hero_banners
  for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create index if not exists idx_hero_banners_display_order on public.hero_banners(display_order);
create index if not exists idx_hero_banners_is_active on public.hero_banners(is_active);
