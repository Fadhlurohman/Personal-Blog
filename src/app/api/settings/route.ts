import { NextRequest, NextResponse } from 'next/server';
import { updateSiteSettings, updateProfile } from '@/lib/services/settings';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { site_name, site_description, social_links, display_name, bio, avatar_url } = body;

    // Update site settings
    if (site_name || site_description || social_links) {
      const res = await updateSiteSettings({
        site_name,
        site_description,
        social_links,
      });
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
    }

    // Update profile
    if (display_name || bio !== undefined || avatar_url !== undefined) {
      const res = await updateProfile({
        display_name,
        bio,
        avatar_url,
      });
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, message: 'Pengaturan berhasil diperbarui.' });
  } catch (err: any) {
    console.error('API /settings PUT error:', err);
    return NextResponse.json(
      { error: err.message || 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}

