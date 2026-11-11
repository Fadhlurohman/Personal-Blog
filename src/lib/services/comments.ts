import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  generateCommentToken,
  getStoredCommentTokens,
  storeCommentToken,
  verifyCommentOwnership,
  removeCommentToken,
} from '@/lib/utils/comment-tokens';
import type { Comment } from '@/types/database';
import { cookies } from 'next/headers';

export async function getPostComments(postId: string): Promise<Comment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('comments')
    .select('id, post_id, display_name, content, owner_token_hash, is_hidden, created_at')
    .eq('post_id', postId)
    .eq('is_hidden', false)
    .order('created_at', { ascending: true });

  if (error || !data) {
    return [];
  }

  // Check if current user is an authenticated admin
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = !!user;

  // Read stored visitor comment tokens from HttpOnly cookie
  const storedTokens = await getStoredCommentTokens();

  // Map comments and attach is_owner flag
  return (data as any[]).map((comment) => {
    const rawToken = storedTokens[comment.id];
    let isOwner = false;

    if (isAdmin) {
      isOwner = true;
    } else if (rawToken) {
      isOwner = true;
    }

    return {
      id: comment.id,
      post_id: comment.post_id,
      display_name: comment.display_name,
      content: comment.content,
      is_hidden: comment.is_hidden,
      created_at: comment.created_at,
      is_owner: isOwner,
    };
  });
}

export interface CreateCommentInput {
  postId: string;
  displayName?: string;
  content: string;
}

export async function createComment(
  input: CreateCommentInput
): Promise<{ comment?: Comment; error?: string }> {
  // 1. Rate limiting check via cookie
  const cookieStore = await cookies();
  const lastCommentTs = cookieStore.get('_last_comment_ts')?.value;
  const now = Date.now();
  if (lastCommentTs) {
    const elapsed = now - parseInt(lastCommentTs, 10);
    if (elapsed < 5000) {
      return { error: 'Mohon tunggu beberapa detik sebelum mengirim komentar kembali.' };
    }
  }

  // 2. Validate input
  const content = (input.content || '').trim();
  if (!content) {
    return { error: 'Isi komentar tidak boleh kosong.' };
  }
  if (content.length > 1000) {
    return { error: 'Komentar terlalu panjang (maksimal 1000 karakter).' };
  }

  const rawDisplayName = (input.displayName || '').trim();
  const displayName = rawDisplayName.length > 0 ? rawDisplayName.slice(0, 50) : 'Anonymous';

  // 3. Verify comments_enabled on post
  const supabase = await createClient();
  const { data: postData } = await supabase
    .from('posts')
    .select('comments_enabled, status')
    .eq('id', input.postId)
    .single();

  const post = postData as any;
  if (!post || post.status !== 'published') {
    return { error: 'Postingan tidak ditemukan atau belum dipublikasikan.' };
  }

  if (post.comments_enabled === false) {
    return { error: 'Komentar untuk postingan ini telah dinonaktifkan oleh pemilik blog.' };
  }

  // 4. Generate cryptographically strong secret token & hash
  const { rawToken, tokenHash } = generateCommentToken();

  // 5. Insert comment into database
  const adminClient = createAdminClient();
  const { data: commentData, error } = await adminClient
    .from('comments')
    .insert({
      post_id: input.postId,
      display_name: displayName,
      content: content,
      owner_token_hash: tokenHash,
      is_hidden: false,
    } as any)
    .select('id, post_id, display_name, content, is_hidden, created_at')
    .single();

  if (error || !commentData) {
    console.error('Error creating comment:', error);
    return { error: error?.message || 'Gagal mengirim komentar.' };
  }

  const comment = commentData as any;

  // 6. Save raw token into HttpOnly cookie
  await storeCommentToken(comment.id, rawToken);

  // 7. Update rate limit timestamp cookie
  cookieStore.set('_last_comment_ts', now.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60, // 1 minute
  });

  return {
    comment: {
      id: comment.id,
      post_id: comment.post_id,
      display_name: comment.display_name,
      content: comment.content,
      is_hidden: comment.is_hidden,
      created_at: comment.created_at,
      is_owner: true,
    },
  };
}

export async function deleteComment(
  commentId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // 1. Check if authenticated admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminClient = createAdminClient();

  // Fetch the comment to get owner_token_hash
  const { data: commentData, error: fetchError } = await adminClient
    .from('comments')
    .select('id, owner_token_hash')
    .eq('id', commentId)
    .single();

  const comment = commentData as any;
  if (fetchError || !comment) {
    return { success: false, error: 'Komentar tidak ditemukan.' };
  }

  // If administrator, allow immediate deletion
  if (user) {
    const { error: delError } = await adminClient.from('comments').delete().eq('id', commentId);
    if (delError) return { success: false, error: delError.message };
    await removeCommentToken(commentId);
    return { success: true };
  }

  // If visitor: verify owner token hash
  const isOwner = await verifyCommentOwnership(commentId, comment.owner_token_hash);
  if (!isOwner) {
    return {
      success: false,
      error: 'Anda tidak memiliki hak untuk menghapus komentar ini.',
    };
  }

  // Token is verified! Delete the comment
  const { error: delError } = await adminClient.from('comments').delete().eq('id', commentId);
  if (delError) {
    return { success: false, error: delError.message };
  }

  // Remove from visitor's cookie
  await removeCommentToken(commentId);

  return { success: true };
}

export async function getAllCommentsAdmin({
  postId,
  limit = 50,
  offset = 0,
}: {
  postId?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<{ comments: (Comment & { post_title?: string })[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from('comments')
    .select(
      `
      id,
      post_id,
      display_name,
      content,
      is_hidden,
      created_at,
      posts (
        title
      )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false });

  if (postId) {
    query = query.eq('post_id', postId);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching admin comments:', error);
    return { comments: [], total: 0 };
  }

  const comments = (data || []).map((c: any) => ({
    id: c.id,
    post_id: c.post_id,
    display_name: c.display_name,
    content: c.content,
    is_hidden: c.is_hidden,
    created_at: c.created_at,
    is_owner: true,
    post_title: c.posts?.title || 'Unknown Post',
  }));

  return { comments, total: count || 0 };
}

export async function toggleCommentVisibility(
  commentId: string,
  isHidden: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('comments')
    .update({ is_hidden: isHidden } as any)
    .eq('id', commentId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
