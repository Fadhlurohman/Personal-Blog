'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Search,
  MessageSquare,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils/format';
import type { Comment } from '@/types/database';

interface AdminCommentItem extends Comment {
  post_title?: string;
}

interface AdminCommentListProps {
  initialComments: AdminCommentItem[];
}

export default function AdminCommentList({ initialComments }: AdminCommentListProps) {
  const router = useRouter();
  const [comments, setComments] = useState<AdminCommentItem[]>(initialComments);
  const [search, setSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredComments = comments.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.display_name.toLowerCase().includes(q) ||
      c.content.toLowerCase().includes(q) ||
      (c.post_title && c.post_title.toLowerCase().includes(q))
    );
  });

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Hapus komentar ini secara permanen?');
    if (!confirm) return;

    setActionLoadingId(id);
    setFeedback(null);

    try {
      const res = await fetch(`/api/comments?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus komentar');

      setComments((prev) => prev.filter((c) => c.id !== id));
      setFeedback({ type: 'success', text: 'Komentar berhasil dihapus.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Terjadi kesalahan' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleHide = async (id: string, currentHidden: boolean) => {
    setActionLoadingId(id);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/comments/${id}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHidden: !currentHidden }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui visibilitas komentar');

      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_hidden: !currentHidden } : c))
      );
      setFeedback({
        type: 'success',
        text: !currentHidden ? 'Komentar disembunyikan dari publik.' : 'Komentar ditampilkan kembali.',
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Terjadi kesalahan' });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
          Kelola Komentar
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-1">
          Pantau, sembunyikan, atau hapus komentar pengunjung blog.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-lg text-xs flex items-center gap-2 ${
            feedback.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white dark:bg-stone-900 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, isi komentar, atau judul postingan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-stone-50/50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Comments List */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
        {filteredComments.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-400">
            Belum ada komentar yang masuk atau cocok dengan pencarian.
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {filteredComments.map((comment) => (
              <div
                key={comment.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition ${
                  comment.is_hidden ? 'opacity-60 bg-stone-50/70 dark:bg-stone-950/40' : ''
                }`}
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                      {comment.display_name}
                    </span>
                    <span className="text-stone-300 dark:text-stone-700">•</span>
                    <span className="text-xs font-mono text-stone-400">
                      {formatDateTime(comment.created_at)}
                    </span>
                    {comment.is_hidden && (
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                        Disembunyikan
                      </span>
                    )}
                  </div>

                  <p className="text-stone-700 dark:text-stone-300 text-sm whitespace-pre-line leading-relaxed">
                    {comment.content}
                  </p>

                  <div className="pt-1 text-xs text-stone-400 flex items-center gap-1 font-mono">
                    <span>Pada postingan:</span>
                    <span className="text-stone-600 dark:text-stone-300 font-medium">
                      {comment.post_title || 'Post'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleHide(comment.id, comment.is_hidden)}
                    disabled={actionLoadingId === comment.id}
                    title={comment.is_hidden ? 'Tampilkan kembali ke publik' : 'Sembunyikan dari publik'}
                    className="p-2 rounded hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition"
                  >
                    {comment.is_hidden ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    disabled={actionLoadingId === comment.id}
                    title="Hapus komentar permanen"
                    className="p-2 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-stone-400 hover:text-rose-600 transition"
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

