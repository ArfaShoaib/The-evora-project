-- Add variation_fields column to categories for storing subcategory variation config
ALTER TABLE categories ADD COLUMN IF NOT EXISTS variation_fields JSONB DEFAULT NULL;

-- Seed subcategories for Apparel (parent_id = a0000000-0000-0000-0000-000000000001)
-- Western Wear and Desi / Pakistani Wear already exist, just update variation_fields
UPDATE categories SET variation_fields = '["Size", "Color", "Material"]'::jsonb
WHERE slug = 'western-wear';

UPDATE categories SET variation_fields = '["Size", "Color", "Material"]'::jsonb
WHERE slug = 'desi-pakistani-wear';

-- Seed missing subcategories under Accessories (parent_id = a0000000-0000-0000-0000-000000000004)
INSERT INTO categories (name, slug, parent_id, variation_fields, created_at)
VALUES
  ('Jewelry (Zewar)', 'jewelry-zewar', 'a0000000-0000-0000-0000-000000000004', '["Color", "Material"]', NOW()),
  ('Bags & Wallets', 'bags-wallets', 'a0000000-0000-0000-0000-000000000004', '["Color", "Material"]', NOW()),
  ('Hair Accessories', 'hair-accessories', 'a0000000-0000-0000-0000-000000000004', '["Color", "Material"]', NOW()),
  ('Belts', 'belts', 'a0000000-0000-0000-0000-000000000004', '["Color", "Material"]', NOW()),
  ('Sunglasses', 'sunglasses', 'a0000000-0000-0000-0000-000000000004', '["Color", "Material"]', NOW()),
  ('Watches & Tech', 'watches-tech', 'a0000000-0000-0000-0000-000000000004', '["Color", "Strap Material"]', NOW()),
  ('Scarves & Stoles', 'scarves-stoles', 'a0000000-0000-0000-0000-000000000004', '["Color", "Material"]', NOW()),
  ('Other Essentials', 'other-essentials', 'a0000000-0000-0000-0000-000000000004', '["Color", "Material"]', NOW())
ON CONFLICT (slug) DO UPDATE SET variation_fields = EXCLUDED.variation_fields;

-- Seed subcategories under Perfumes (parent_id = a0000000-0000-0000-0000-000000000005)
INSERT INTO categories (name, slug, parent_id, variation_fields, created_at)
VALUES
  ('Men''s Perfumes', 'mens-perfumes', 'a0000000-0000-0000-0000-000000000005', '["Volume (ml)", "Scent Family"]', NOW()),
  ('Women''s Perfumes', 'womens-perfumes', 'a0000000-0000-0000-0000-000000000005', '["Volume (ml)", "Scent Family"]', NOW()),
  ('Unisex / Niche', 'unisex-niche', 'a0000000-0000-0000-0000-000000000005', '["Volume (ml)", "Scent Family"]', NOW()),
  ('Attars / Traditional Oils', 'attars-traditional-oils', 'a0000000-0000-0000-0000-000000000005', '["Volume (ml)", "Scent Family"]', NOW())
ON CONFLICT (slug) DO UPDATE SET variation_fields = EXCLUDED.variation_fields;
