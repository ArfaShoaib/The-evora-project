-- Add parent_id to categories for subcategory support
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Extend product_variants with material, volume, price_modifier
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS material TEXT;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS volume TEXT;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS price_modifier NUMERIC(10,2) DEFAULT 0;

-- Seed categories with subcategories
-- Parent: Apparel
INSERT INTO categories (id, name, slug, parent_id, created_at)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Apparel', 'apparel', NULL, NOW())
ON CONFLICT (slug) DO NOTHING;

-- Subcategories under Apparel
INSERT INTO categories (id, name, slug, parent_id, created_at)
VALUES
  ('a0000000-0000-0000-0000-000000000002', 'Western Wear', 'western-wear', 'a0000000-0000-0000-0000-000000000001', NOW()),
  ('a0000000-0000-0000-0000-000000000003', 'Desi / Pakistani Wear', 'desi-pakistani-wear', 'a0000000-0000-0000-0000-000000000001', NOW())
ON CONFLICT (slug) DO NOTHING;

-- Top-level categories
INSERT INTO categories (id, name, slug, parent_id, created_at)
VALUES
  ('a0000000-0000-0000-0000-000000000004', 'Accessories', 'accessories', NULL, NOW()),
  ('a0000000-0000-0000-0000-000000000005', 'Perfumes', 'perfumes', NULL, NOW())
ON CONFLICT (slug) DO NOTHING;
