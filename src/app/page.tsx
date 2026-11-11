import PublicLayout from '@/components/PublicLayout';
import PostCard from '@/components/PostCard';
import { getPublishedPosts } from '@/lib/services/posts';
import { getSiteSettings, DEFAULT_SETTINGS } from '@/lib/services/settings';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Post } from '@/types/database';

export const dynamic = 'force-dynamic';

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: HomeProps) {
  const resolvedParams = await searchParams;
  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page, 10) : 1;
  const limit = 8;
  const offset = (page - 1) * limit;

  let posts: Post[] = [];
  let total = 0;
  let settings = DEFAULT_SETTINGS;

  try {
    const [postsRes, settingsRes] = await Promise.all([
      getPublishedPosts({ limit, offset }),
      getSiteSettings(),
    ]);
    posts = postsRes.posts;
    total = postsRes.total;
    settings = settingsRes;
  } catch (err: any) {
    if (err?.digest?.startsWith?.('DYNAMIC_SERVER_USAGE')) throw err;
    console.error('Error loading home page data:', err);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <PublicLayout>
      {/* Intro Header */}
      <section className="pb-8 mb-4 border-b border-stone-200 dark:border-stone-800">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mb-3">
          {settings.site_name}
        </h1>
        <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base leading-relaxed max-w-2xl">
          {settings.site_description}
        </p>
      </section>

      {/* Post Feed */}
      <section>
        {posts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-stone-500 dark:text-stone-400 text-sm mb-2">
              Belum ada postingan yang dipublikasikan.
            </p>
            <p className="text-stone-400 dark:text-stone-500 text-xs">
              Masuk sebagai administrator untuk mulai menulis cerita dan membagikan foto atau video.
            </p>
          </div>
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-10 border-t border-stone-200 dark:border-stone-800 mt-6 text-xs text-stone-600 dark:text-stone-400">
                {page > 1 ? (
                  <Link
                    href={`/?page=${page - 1}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Sebelumnya</span>
                  </Link>
                ) : (
                  <div />
                )}

                <span className="font-mono">
                  Halaman {page} dari {totalPages}
                </span>

                {page < totalPages ? (
                  <Link
                    href={`/?page=${page + 1}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                  >
                    <span>Selanjutnya</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
