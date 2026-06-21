-- Seed featured collections for homepage
insert into site_content (section_key, content) values
('featured_collections', '{"items": [{"name": "Dresses", "slug": "dresses", "description": "From effortless day dresses to statement evening wear", "image_url": ""}, {"name": "Tops & Blouses", "slug": "tops", "description": "Refined silhouettes for every occasion", "image_url": ""}, {"name": "Bags", "slug": "bags", "description": "Luxury craftsmanship meets modern design", "image_url": ""}, {"name": "Shoes", "slug": "shoes", "description": "Step into sophistication", "image_url": ""}]}')
on conflict (section_key) do nothing;
