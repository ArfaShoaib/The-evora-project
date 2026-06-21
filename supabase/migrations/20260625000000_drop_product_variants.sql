-- Drop the product_variants table — all variant data now lives in the products table
-- (products.sizes, products.colors, products.variations)

DROP TABLE IF EXISTS product_variants CASCADE;
