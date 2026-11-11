'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  PlusCircle,
  Edit,
  Trash2,
  ExternalLink,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils/format';
import type { Post } from '@/types/database';

interface AdminPostListProps {
  initialPosts: Post[];
}

export default function AdminPostList({ initialPosts }: AdminPostListProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredPosts = posts.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch =
      search.trim() === '' ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleDelete = async (id: string, title: string) => {
    const confirm = window.confirm(`Hapus postingan "${title}" secara permanen? Seluruh media dan komentar yang terkait juga akan terhapus.`);
    if (!confirm) return;

    setDeletingId(id);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus postingan');

      setPosts((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menghapus postingan');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
            Kelola Postingan
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-1">
            Total {posts.length} postingan di database.
          </p>
        </div>

        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 text-xs font-semibold transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Postingan Baru</span>
        </Link>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul atau slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-stone-50/50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
              statusFilter === 'all'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition flex items-center gap-1 ${
              statusFilter === 'published'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Published</span>
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition flex items-center gap-1 ${
              statusFilter === 'draft'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Clock className="w-3 h-3 text-amber-500" />
            <span>Draft</span>
          </button>
        </div>
      </div>

      {/* Post Table / List */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
        {filteredPosts.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-400">
            Tidak ada postingan yang sesuai dengan filter atau pencarian.
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
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

                  <h3 className="font-serif font-semibold text-base text-stone-900 dark:text-stone-100">
                    <Link
                      href={`/admin/posts/edit/${post.id}`}
                      className="hover:underline"
                    >
                      {post.title}
                    </Link>
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-stone-400 font-mono">
                    <span>/{post.slug}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {post.comments_count ?? 0}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {post.status === 'published' && (
                    <Link
                      href={`/post/${post.slug}`}
                      target="_blank"
                      className="p-2 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition"
                      title="Lihat di blog publik"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                  <Link
                    href={`/admin/posts/edit/${post.id}`}
                    className="p-2 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition"
                    title="Edit postingan"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(post.id, post.title)}
                    disabled={deletingId === post.id}
                    className="p-2 text-stone-400 hover:text-rose-600 transition disabled:opacity-50"
                    title="Hapus postingan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

