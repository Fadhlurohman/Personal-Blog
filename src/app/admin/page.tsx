import { createClient } from '@/lib/supabase/server';
import { getAllPostsAdmin } from '@/lib/services/posts';
import { getAllCommentsAdmin } from '@/lib/services/comments';
import { formatDateTime } from '@/lib/utils/format';
import Link from 'next/link';
import {
  FileText,
  CheckCircle2,
  Clock,
  MessageSquare,
  PlusCircle,
  ArrowRight,
  Eye,
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Parallel fetch stats and recent items
  const [postsRes, draftsRes, publishedRes, commentsRes, recentPosts] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact', head: true }),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('comments').select('id', { count: 'exact', head: true }),
    getAllPostsAdmin({ limit: 5 }),
  ]);

  const totalPosts = postsRes.count ?? 0;
  const draftCount = draftsRes.count ?? 0;
  const publishedCount = publishedRes.count ?? 0;
  const totalComments = commentsRes.count ?? 0;

  const statCards = [
    {
      title: 'Total Postingan',
      value: totalPosts,
      icon: FileText,
      color: 'text-stone-800 dark:text-stone-200',
    },
    {
      title: 'Diterbitkan',
      value: publishedCount,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Draft',
      value: draftCount,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Total Komentar',
      value: totalComments,
      icon: MessageSquare,
      color: 'text-blue-600 dark:text-blue-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
            Ringkasan Blog
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-1">
            Status keseluruhan konten, statistik publikasi, dan interaksi pengunjung.
          </p>
        </div>

        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 text-xs font-semibold transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tulis Postingan Baru</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  {card.title}
                </span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-stone-900 dark:text-stone-100">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Posts Section */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100 dark:border-stone-800">
          <h2 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">
            Postingan Terbaru
          </h2>
          <Link
            href="/admin/posts"
            className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1 font-medium transition"
          >
            <span>Lihat semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentPosts.posts.length === 0 ? (
          <div className="py-12 text-center text-stone-400 text-xs">
            Belum ada postingan. Mulai tulis postingan pertama Anda!
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {recentPosts.posts.map((post) => (
              <div
                key={post.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded ${
                        post.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {post.status}
                    </span>
                    <span className="text-xs font-mono text-stone-400">
                      {formatDateTime(post.published_at || post.created_at)}
                    </span>
                  </div>
                  <h3 className="font-medium text-sm text-stone-900 dark:text-stone-100 hover:text-stone-600 transition">
                    <Link href={`/admin/posts/edit/${post.id}`}>{post.title}</Link>
                  </h3>
                </div>

                <div className="flex items-center gap-3 text-xs text-stone-500">
                  <span>{post.comments_count ?? 0} komentar</span>
                  <Link
                    href={`/admin/posts/edit/${post.id}`}
                    className="px-2.5 py-1 rounded border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

