INSERT INTO site_content (section_key, content) VALUES
('instagram_gallery', '{
  "items": [
    { "image_url": "/products/dress1.webp", "link": "https://instagram.com/p/1", "likes": 1243 },
    { "image_url": "/products/blouse1.webp", "link": "https://instagram.com/p/2", "likes": 892 },
    { "image_url": "/products/pants1.webp", "link": "https://instagram.com/p/3", "likes": 1567 },
    { "image_url": "/products/jacket1.webp", "link": "https://instagram.com/p/4", "likes": 734 },
    { "image_url": "/products/skirt1.webp", "link": "https://instagram.com/p/5", "likes": 1102 },
    { "image_url": "/products/top1.webp", "link": "https://instagram.com/p/6", "likes": 956 }
  ]
}'::jsonb)
ON CONFLICT (section_key) DO NOTHING;
