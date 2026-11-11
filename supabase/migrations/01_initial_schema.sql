-- ============================================================
-- PERSONAL BLOG & DIGITAL JOURNAL - SUPABASE SCHEMA MIGRATION
-- ============================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Blog Author',
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  comments_enabled BOOLEAN NOT NULL DEFAULT TRUE
);

-- 3. MEDIA TABLE
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  caption TEXT DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Anonymous',
  content TEXT NOT NULL,
  owner_token_hash TEXT NOT NULL,
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL DEFAULT 'Personal Blog & Digital Journal',
  site_description TEXT NOT NULL DEFAULT 'Ruang digital pribadi untuk membagikan tulisan, pemikiran, cerita, foto, dan video.',
  social_links JSONB NOT NULL DEFAULT '{"github": "", "twitter": "", "instagram": "", "linkedin": "", "email": ""}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status_published_at ON public.posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_post_id ON public.media(post_id);
CREATE INDEX IF NOT EXISTS idx_media_file_type ON public.media(file_type);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_owner_token_hash ON public.comments(owner_token_hash);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (TRUE);

CREATE POLICY "Authenticated users can update profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- POSTS POLICIES
CREATE POLICY "Published posts are viewable by everyone" 
  ON public.posts FOR SELECT 
  USING (status = 'published' OR auth.role() = 'authenticated');

CREATE POLICY "Only authenticated admin can insert posts" 
  ON public.posts FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated admin can update posts" 
  ON public.posts FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated admin can delete posts" 
  ON public.posts FOR DELETE 
  USING (auth.role() = 'authenticated');

-- MEDIA POLICIES
CREATE POLICY "Media is viewable by everyone" 
  ON public.media FOR SELECT 
  USING (TRUE);

CREATE POLICY "Only authenticated admin can insert media" 
  ON public.media FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated admin can update media" 
  ON public.media FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated admin can delete media" 
  ON public.media FOR DELETE 
  USING (auth.role() = 'authenticated');

-- COMMENTS POLICIES
CREATE POLICY "Visible comments on published posts are viewable by everyone" 
  ON public.comments FOR SELECT 
  USING (is_hidden = FALSE OR auth.role() = 'authenticated');

CREATE POLICY "Anyone can insert a valid comment" 
  ON public.comments FOR INSERT 
  WITH CHECK (
    char_length(content) >= 1 AND 
    char_length(content) <= 1000 AND
    char_length(owner_token_hash) = 64
  );

CREATE POLICY "Authenticated admin can update comments" 
  ON public.comments FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admin can delete comments" 
  ON public.comments FOR DELETE 
  USING (auth.role() = 'authenticated');

-- SITE SETTINGS POLICIES
CREATE POLICY "Site settings are viewable by everyone" 
  ON public.site_settings FOR SELECT 
  USING (TRUE);

CREATE POLICY "Only authenticated admin can update site settings" 
  ON public.site_settings FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated admin can insert site settings" 
  ON public.site_settings FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE BUCKET CONFIGURATION
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Media bucket is publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "Authenticated admin can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated admin can update media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated admin can delete media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- ============================================================
-- AUTOMATIC PROFILE TRIGGER ON AUTH USER CREATION
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, bio, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Administrator'),
    'Penulis dan pemilik blog ini.',
    ''
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for posts updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_posts_updated ON public.posts;
CREATE TRIGGER on_posts_updated
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_site_settings_updated ON public.site_settings;
CREATE TRIGGER on_site_settings_updated
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

