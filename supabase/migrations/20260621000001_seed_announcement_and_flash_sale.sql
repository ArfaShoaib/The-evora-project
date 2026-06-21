-- Seed flash sale (inactive by default)
INSERT INTO site_content (section_key, content) VALUES
('flash_sale', '{"active": false, "title": "FLASH SALE", "subtitle": "Up to 50% Off", "description": "Limited time offer", "cta_text": "Shop Now", "cta_link": "/sale", "end_date": ""}')
ON CONFLICT (section_key) DO NOTHING;
