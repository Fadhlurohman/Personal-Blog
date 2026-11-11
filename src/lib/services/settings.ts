import { createClient } from '@/lib/supabase/server';
import type { SiteSettings, Profile } from '@/types/database';

export const DEFAULT_SETTINGS: SiteSettings = {
  id: '00000000-0000-0000-0000-000000000001',
  site_name: 'Personal Blog',
  site_description: 'Ruang digital pribadi untuk membagikan tulisan, cerita, foto, dan video.',
  social_links: {
    github: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    email: '',
  },
  updated_at: new Date().toISOString(),
};

export const DEFAULT_PROFILE: Profile = {
  id: '',
  display_name: 'Penulis Blog',
  bio: 'Selamat datang di ruang digital pribadi saya. Di sini saya menuliskan berbagai cerita, pemikiran, dan catatan perjalanan.',
  avatar_url: '',
  updated_at: new Date().toISOString(),
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .single();

  if (error || !data) {
    return DEFAULT_SETTINGS;
  }

  const row = data as any;
  return {
    ...DEFAULT_SETTINGS,
    ...row,
    social_links: {
      ...DEFAULT_SETTINGS.social_links,
      ...(row.social_links || {}),
    },
  };
}

export async function updateSiteSettings(
  input: Partial<SiteSettings>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const current = await getSiteSettings();

  const { error } = await supabase
    .from('site_settings')
    .upsert({
      id: current.id,
      site_name: input.site_name || current.site_name,
      site_description: input.site_description || current.site_description,
      social_links: input.social_links || current.social_links,
      updated_at: new Date().toISOString(),
    } as any);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getProfile(): Promise<Profile> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    .single();

  if (error || !data) {
    return DEFAULT_PROFILE;
  }

  return data as Profile;
}

export async function updateProfile(
  input: Partial<Profile>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      display_name: input.display_name,
      bio: input.bio,
      avatar_url: input.avatar_url,
      updated_at: new Date().toISOString(),
    } as any);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
