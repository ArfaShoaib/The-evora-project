-- Seed default shipping cost (0 = free until admin configures)
INSERT INTO site_settings (key, value)
VALUES ('shipping', '{"shipping_cost_pkr": 0}'::jsonb)
ON CONFLICT (key) DO NOTHING;
