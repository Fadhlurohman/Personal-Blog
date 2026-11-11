import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Media, MediaType } from '@/types/database';

export interface GetMediaParams {
  type?: MediaType | 'all';
  limit?: number;
  offset?: number;
}

export async function getAllMedia({
  type = 'all',
  limit = 24,
  offset = 0,
}: GetMediaParams = {}): Promise<{ media: (Media & { post_title?: string; post_slug?: string })[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from('media')
    .select(
      `
      id,
      post_id,
      file_url,
      file_type,
      caption,
      display_order,
      created_at,
      posts (
        title,
        slug,
        status
      )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false });

  if (type !== 'all') {
    query = query.eq('file_type', type);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching media:', error);
    return { media: [], total: 0 };
  }

  // Filter out media attached to unpublished posts for public view
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const filtered = (data || [])
    .filter((item: any) => {
      if (user) return true; // admin sees all
      if (!item.post_id) return true; // standalone media
      return item.posts?.status === 'published';
    })
    .map((item: any) => ({
      id: item.id,
      post_id: item.post_id,
      file_url: item.file_url,
      file_type: item.file_type as MediaType,
      caption: item.caption,
      display_order: item.display_order,
      created_at: item.created_at,
      post_title: item.posts?.title,
      post_slug: item.posts?.slug,
    }));

  return { media: filtered, total: count || 0 };
}

export async function uploadMediaFile(
  file: File
): Promise<{ url?: string; fileType?: MediaType; error?: string }> {
  const supabase = await createClient();

  // Validate authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Hanya administrator yang dapat mengunggah media.' };
  }

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  if (!isImage && !isVideo) {
    return { error: 'Format file tidak didukung. Harap pilih gambar atau video.' };
  }

  const maxSize = isImage ? 15 * 1024 * 1024 : 60 * 1024 * 1024; // 15MB for image, 60MB for video
  if (file.size > maxSize) {
    return {
      error: `Ukuran file melebihi batas maksimum (${isImage ? '15MB' : '60MB'}).`,
    };
  }

  const fileType: MediaType = isImage ? 'image' : 'video';
  const fileExt = file.name.split('.').pop() || (isImage ? 'jpg' : 'mp4');
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError || !uploadData) {
    console.error('Error uploading file to storage:', uploadError);
    return { error: uploadError?.message || 'Gagal mengunggah file ke penyimpanan.' };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('media').getPublicUrl(filePath);

  return { url: publicUrl, fileType };
}

