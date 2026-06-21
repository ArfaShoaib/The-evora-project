create table public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.newsletter_subscribers enable row level security;

create policy "Allow admin full access to newsletter_subscribers" on public.newsletter_subscribers
  for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "Allow anyone to subscribe" on public.newsletter_subscribers
  for insert with check (true);
