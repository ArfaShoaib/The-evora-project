-- Seed default social links (empty URLs until admin configures them)
INSERT INTO site_settings (key, value)
VALUES ('social_links', '{
  "instagram": "",
  "facebook": "",
  "twitter": "",
  "tiktok": "",
  "youtube": "",
  "pinterest": ""
}'::jsonb)
ON CONFLICT (key) DO NOTHING;
