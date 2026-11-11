import PublicLayout from '@/components/PublicLayout';
import CommentsSection from '@/components/CommentsSection';
import { getPostBySlug } from '@/lib/services/posts';
import { getPostComments } from '@/lib/services/comments';
import { formatDateTime } from '@/lib/utils/format';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar } from 'lucide-react';
import type { Metadata } from 'next';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);

    if (!post) {
      return {
        title: 'Postingan Tidak Ditemukan',
      };
    }

    const snippet = post.content.slice(0, 160).replace(/\n/g, ' ');
    const firstImage = post.media?.find((m) => m.file_type === 'image')?.file_url;

    return {
      title: post.title,
      description: snippet,
      openGraph: {
        title: post.title,
        description: snippet,
        type: 'article',
        publishedTime: post.published_at || post.created_at,
        images: firstImage ? [{ url: firstImage }] : [],
      },
    };
  } catch {
    return {
      title: 'Artikel Blog',
    };
  }
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const { slug } = await params;
  let post = null;
  try {
    post = await getPostBySlug(slug);
  } catch (err) {
    console.error('Error fetching post:', err);
  }

  if (!post) {
    notFound();
  }

  let comments: any[] = [];
  let isAdmin = false;

  try {
    const [commentsRes, supabase] = await Promise.all([
      getPostComments(post.id),
      createClient(),
    ]);
    comments = commentsRes;
    const { data } = await supabase.auth.getUser();
    isAdmin = !!data?.user;
  } catch (err) {
    console.error('Error loading post comments:', err);
  }

  const mediaItems = post.media || [];

  return (
    <PublicLayout>
      <article className="py-4">
        {/* Back navigation */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Post Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-stone-400 dark:text-stone-500 mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <time dateTime={post.published_at || post.created_at}>
              {formatDateTime(post.published_at || post.created_at)}
            </time>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 leading-tight">
            {post.title}
          </h1>
        </header>

        {/* Media Attachments */}
        {mediaItems.length > 0 && (
          <div className="mb-10 space-y-4">
            {mediaItems.map((item, idx) => (
              <figure
                key={item.id || idx}
                className="rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900"
              >
                {item.file_type === 'video' ? (
                  <video
                    src={item.file_url}
                    controls
                    preload="metadata"
                    className="w-full max-h-[520px] object-cover bg-black"
                  />
                ) : (
                  <img
                    src={item.file_url}
                    alt={item.caption || post.title}
                    loading="lazy"
                    className="w-full max-h-[520px] object-cover"
                  />
                )}
                {item.caption && (
                  <figcaption className="p-3 text-xs text-stone-500 dark:text-stone-400 text-center italic border-t border-stone-200 dark:border-stone-800">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}

        {/* Main Text Content */}
        <div className="prose prose-stone dark:prose-invert max-w-none text-stone-800 dark:text-stone-200 text-base sm:text-lg leading-relaxed whitespace-pre-line mb-12">
          {post.content}
        </div>

        {/* Comments Section */}
        <CommentsSection
          postId={post.id}
          commentsEnabled={post.comments_enabled}
          initialComments={comments}
          isAdmin={isAdmin}
        />
      </article>
    </PublicLayout>
  );
}
