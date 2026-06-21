-- Create public profiles table linked to Supabase Auth users
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  email text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Allow public read access to profiles" on public.profiles
  for select using (true);

create policy "Allow users to update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Create trigger function to create profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', 'Customer'),
    new.email,
    'customer'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create Categories Table
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;

create policy "Allow public read access to categories" on public.categories 
  for select using (true);

create policy "Allow admin write access to categories" on public.categories 
  for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

-- Create Products Table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null,
  sale_price numeric(10,2),
  sku text not null unique,
  images text[] not null default '{}',
  thumbnail text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;

create policy "Allow public read access to published products" on public.products 
  for select using (
    status = 'published' or exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "Allow admin write access to products" on public.products 
  for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

-- Create Product Variants Table
create table public.product_variants (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  size text,
  color text,
  stock integer not null default 0,
  sku text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.product_variants enable row level security;

create policy "Allow public read access to variants" on public.product_variants 
  for select using (true);

create policy "Allow admin write access to variants" on public.product_variants 
  for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

-- Create Coupons Table
create table public.coupons (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10,2) not null,
  min_order_value numeric(10,2),
  is_active boolean not null default true,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.coupons enable row level security;

create policy "Allow public read access to active coupons" on public.coupons 
  for select using (is_active = true);

create policy "Allow admin write access to coupons" on public.coupons 
  for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

-- Create Orders Table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  coupon_id uuid references public.coupons(id) on delete set null,
  total_price numeric(10,2) not null,
  status text not null default 'Pending' check (status in ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
  shipping_address jsonb not null,
  billing_address jsonb not null,
  payment_method text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;

create policy "Allow users to view their own orders" on public.orders 
  for select using (
    auth.uid() = user_id or exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "Allow users to create their own orders" on public.orders 
  for insert with check (
    auth.uid() = user_id
  );

create policy "Allow admin write access to orders" on public.orders 
  for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

-- Create Order Items Table
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  quantity integer not null check (quantity > 0),
  price numeric(10,2) not null
);

alter table public.order_items enable row level security;

create policy "Allow users to view their own order items" on public.order_items 
  for select using (
    exists (
      select 1 from public.orders 
      where orders.id = order_items.order_id 
      and (orders.user_id = auth.uid() or exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'))
    )
  );

create policy "Allow users to insert order items" on public.order_items 
  for insert with check (
    exists (
      select 1 from public.orders 
      where orders.id = order_items.order_id 
      and orders.user_id = auth.uid()
    )
  );

create policy "Allow admin write access to order items" on public.order_items 
  for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

-- Create Reviews Table
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  review text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reviews enable row level security;

create policy "Allow public read access to reviews" on public.reviews 
  for select using (true);

create policy "Allow users to write reviews" on public.reviews 
  for insert with check (
    auth.uid() = user_id
  );

create policy "Allow users to update/delete their own reviews" on public.reviews 
  for update using (
    auth.uid() = user_id
  );

-- Create Wishlists Table
create table public.wishlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, product_id)
);

alter table public.wishlists enable row level security;

create policy "Allow users to view their own wishlist" on public.wishlists 
  for select using (auth.uid() = user_id);

create policy "Allow users to add to their wishlist" on public.wishlists 
  for insert with check (auth.uid() = user_id);

create policy "Allow users to remove from their wishlist" on public.wishlists 
  for delete using (auth.uid() = user_id);
