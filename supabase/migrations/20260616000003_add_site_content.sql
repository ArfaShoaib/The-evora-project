create table site_content (
  id uuid default gen_random_uuid() primary key,
  section_key text unique not null,
  content jsonb not null default '{}',
  updated_at timestamp with time zone default now() not null
);

alter table site_content enable row level security;

create policy "Anyone can read site content" on site_content
  for select using (true);

create policy "Admins can manage site content" on site_content
  for all using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

insert into site_content (section_key, content) values
('hero', '{"tagline": "The Art of Everyday Luxury", "title": "Timeless Elegance for Modern Living", "description": "Discover our curated collection of premium fashion pieces, designed for those who appreciate the finer details in life.", "cta_primary_text": "Shop Collection", "cta_primary_link": "/shop", "cta_secondary_text": "View Lookbook", "cta_secondary_link": "/collections"}'),
('sale_banner', '{"title": "Up to 50% Off", "subtitle": "Limited Time Only", "description": "Don''t miss our seasonal sale. Luxury pieces at irresistible prices.", "cta_text": "Shop the Sale", "cta_link": "/sale", "active": true}'),
('seasonal', '{"title": "The Summer Collection", "subtitle": "Limited Edition", "description": "Embrace the season with our curated selection of lightweight fabrics, sun-kissed hues, and effortless silhouettes.", "cta_primary_text": "Shop Summer", "cta_primary_link": "/collections/summer-edit", "cta_secondary_text": "View All Collections", "cta_secondary_link": "/collections", "image_url": ""}'),
('about', '{"title": "Our Story", "description": "Founded with a passion for timeless design and uncompromising quality, Evora brings you carefully curated fashion pieces that transcend seasons and trends. Every piece tells a story of craftsmanship and attention to detail.", "mission": "To empower individuals through thoughtfully designed fashion that celebrates both elegance and sustainability."}'),
('testimonials', '{"items": [{"name": "Sarah J.", "text": "The quality is exceptional. Every piece feels luxurious and the attention to detail is remarkable.", "rating": 5}, {"name": "Michael C.", "text": "Evora has become my go-to for timeless fashion. The curation is impeccable.", "rating": 5}, {"name": "Emma W.", "text": "Beautiful pieces that last. The customer service experience is also outstanding.", "rating": 5}]}');
