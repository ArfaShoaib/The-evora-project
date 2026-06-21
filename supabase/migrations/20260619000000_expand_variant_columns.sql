-- Add expanded variant attribute columns to product_variants
-- Supports detailed Apparel, Accessories, and Perfume variants

ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS fit text,
  ADD COLUMN IF NOT EXISTS neckline text,
  ADD COLUMN IF NOT EXISTS pattern text,
  ADD COLUMN IF NOT EXISTS embroidery text,
  ADD COLUMN IF NOT EXISTS sleeve_length text,
  ADD COLUMN IF NOT EXISTS dupatta text,
  ADD COLUMN IF NOT EXISTS dial_color text,
  ADD COLUMN IF NOT EXISTS movement text,
  ADD COLUMN IF NOT EXISTS target text,
  ADD COLUMN IF NOT EXISTS fragrance_notes text,
  ADD COLUMN IF NOT EXISTS attributes jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS image_url text;
