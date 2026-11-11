-- ============================================================
-- SEED DATA FOR PERSONAL BLOG & DIGITAL JOURNAL
-- ============================================================

-- 1. Default Site Settings
INSERT INTO public.site_settings (id, site_name, site_description, social_links)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'The Memoir',
  'Ruang digital minimalis untuk berbagi tulisan, cerita, foto, dan video perjalanan hidup.',
  '{"github": "", "twitter": "https://x.com/navntn", "instagram": "https://instagram.com/navntn", "linkedin": "", "email": "fadhlurohmanfn@gmail.com"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  site_name = EXCLUDED.site_name,
  site_description = EXCLUDED.site_description,
  social_links = EXCLUDED.social_links;

-- 2. First Welcome Post
INSERT INTO public.posts (id, title, slug, content, status, published_at, comments_enabled)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Selamat Datang di Ruang Digital Pribadi Saya',
  'selamat-datang-di-ruang-digital-pribadi-saya',
  'Selamat datang! Ini adalah ruang digital pribadi saya untuk menuliskan ide, pemikiran, dokumentasi perjalanan, serta mengabadikan berbagai momen dalam bentuk teks, foto, dan video.

Blog ini dirancang dengan konsep minimalis, bersih, dan berfokus pada kenyamanan membaca. Tanpa distraksi iklan, tanpa algoritma media sosial, hanya tulisan murni dari pikiran saya untuk Anda nikmati.

Jangan ragu untuk meninggalkan komentar di bawah!',
  'published',
  NOW(),
  TRUE
)
ON CONFLICT (slug) DO NOTHING;

-- 3. Initial Sample Comment
INSERT INTO public.comments (id, post_id, display_name, content, owner_token_hash, is_hidden)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Sahabat Pembaca',
  'Selamat atas peluncuran blog barunya! Desainnya sangat rapi, nyaman di mata, dan cepat sekali dibuka.',
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  FALSE
)
ON CONFLICT (id) DO NOTHING;

