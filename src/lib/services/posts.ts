import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Post, Media, PostStatus } from '@/types/database';

export interface GetPostsParams {
  limit?: number;
  offset?: number;
  search?: string;
}

export async function getPublishedPosts({
  limit = 10,
  offset = 0,
  search,
}: GetPostsParams = {}): Promise<{ posts: Post[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from('posts')
    .select(
      `
      id,
      title,
      slug,
      content,
      status,
      created_at,
      updated_at,
      published_at,
      comments_enabled,
      media (
        id,
        post_id,
        file_url,
        file_type,
        caption,
        display_order,
        created_at
      ),
      comments (count)
    `,
      { count: 'exact' }
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching published posts:', error);
    return { posts: [], total: 0 };
  }

  const posts: Post[] = ((data as any[]) || []).map((p: any) => {
    const sortedMedia = (p.media || []).sort(
      (a: Media, b: Media) => a.display_order - b.display_order
    );
    const commentsCount = p.comments?.[0]?.count ?? 0;
    return {
      ...p,
      media: sortedMedia,
      comments_count: commentsCount,
    };
  });

  return { posts, total: count || 0 };
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      id,
      title,
      slug,
      content,
      status,
      created_at,
      updated_at,
      published_at,
      comments_enabled,
      media (
        id,
        post_id,
        file_url,
        file_type,
        caption,
        display_order,
        created_at
      )
    `
    )
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }

  const row = data as any;
  const sortedMedia = (row.media || []).sort(
    (a: Media, b: Media) => a.display_order - b.display_order
  );

  return {
    ...row,
    media: sortedMedia,
  } as Post;
}

export async function getAllPostsAdmin({
  limit = 20,
  offset = 0,
  search,
  status,
}: {
  limit?: number;
  offset?: number;
  search?: string;
  status?: PostStatus | 'all';
} = {}): Promise<{ posts: Post[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from('posts')
    .select(
      `
      id,
      title,
      slug,
      content,
      status,
      created_at,
      updated_at,
      published_at,
      comments_enabled,
      media (count),
      comments (count)
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching admin posts:', error);
    return { posts: [], total: 0 };
  }

  const posts: Post[] = ((data as any[]) || []).map((p: any) => ({
    ...p,
    media_count: p.media?.[0]?.count ?? 0,
    comments_count: p.comments?.[0]?.count ?? 0,
  }));

  return { posts, total: count || 0 };
}

export async function getPostByIdAdmin(id: string): Promise<Post | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      id,
      title,
      slug,
      content,
      status,
      created_at,
      updated_at,
      published_at,
      comments_enabled,
      media (
        id,
        post_id,
        file_url,
        file_type,
        caption,
        display_order,
        created_at
      )
    `
    )
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  const row = data as any;
  const sortedMedia = (row.media || []).sort(
    (a: Media, b: Media) => a.display_order - b.display_order
  );

  return {
    ...row,
    media: sortedMedia,
  } as Post;
}

export interface PostInput {
  title: string;
  slug: string;
  content: string;
  status: PostStatus;
  comments_enabled?: boolean;
  published_at?: string | null;
  media?: Array<{
    file_url: string;
    file_type: 'image' | 'video';
    caption?: string;
    display_order?: number;
  }>;
}

export async function createPost(input: PostInput): Promise<{ post?: Post; error?: string }> {
  const supabase = await createClient();

  const publishedAt =
    input.status === 'published' ? input.published_at || new Date().toISOString() : null;

  const { data: postData, error: postError } = await supabase
    .from('posts')
    .insert({
      title: input.title,
      slug: input.slug,
      content: input.content,
      status: input.status,
      comments_enabled: input.comments_enabled ?? true,
      published_at: publishedAt,
    } as any)
    .select()
    .single();

  const post = postData as any;
  if (postError || !post) {
    return { error: postError?.message || 'Gagal membuat postingan' };
  }

  if (input.media && input.media.length > 0) {
    const mediaToInsert = input.media.map((item, index) => ({
      post_id: post.id,
      file_url: item.file_url,
      file_type: item.file_type,
      caption: item.caption || '',
      display_order: item.display_order ?? index,
    }));

    const { error: mediaError } = await supabase.from('media').insert(mediaToInsert as any);
    if (mediaError) {
      console.error('Error inserting media:', mediaError);
    }
  }

  return { post: post as Post };
}

export async function updatePost(
  id: string,
  input: Partial<PostInput>
): Promise<{ post?: Post; error?: string }> {
  const supabase = await createClient();

  const updateData: any = {};
  if (input.title !== undefined) updateData.title = input.title;
  if (input.slug !== undefined) updateData.slug = input.slug;
  if (input.content !== undefined) updateData.content = input.content;
  if (input.status !== undefined) {
    updateData.status = input.status;
    if (input.status === 'published' && !input.published_at) {
      updateData.published_at = new Date().toISOString();
    } else if (input.published_at !== undefined) {
      updateData.published_at = input.published_at;
    }
  }
  if (input.comments_enabled !== undefined) updateData.comments_enabled = input.comments_enabled;

  const { data: postData, error: postError } = await supabase
    .from('posts')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  const post = postData as any;
  if (postError || !post) {
    return { error: postError?.message || 'Gagal memperbarui postingan' };
  }

  // If media was provided, replace existing media
  if (input.media !== undefined) {
    await supabase.from('media').delete().eq('post_id', id);

    if (input.media.length > 0) {
      const mediaToInsert = input.media.map((item, index) => ({
        post_id: id,
        file_url: item.file_url,
        file_type: item.file_type,
        caption: item.caption || '',
        display_order: item.display_order ?? index,
      }));

      await supabase.from('media').insert(mediaToInsert as any);
    }
  }

  return { post: post as Post };
}

export async function deletePost(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}
