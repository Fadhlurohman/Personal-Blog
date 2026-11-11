'use client';

import { useState } from 'react';
import { Trash2, MessageSquare, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/format';
import type { Comment } from '@/types/database';

interface CommentsSectionProps {
  postId: string;
  commentsEnabled: boolean;
  initialComments: Comment[];
  isAdmin?: boolean;
}

export default function CommentsSection({
  postId,
  commentsEnabled,
  initialComments,
  isAdmin = false,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [displayName, setDisplayName] = useState('');
  const [content, setContent] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          displayName: displayName.trim() || 'Anonymous',
          content: content.trim(),
          website_hp: honeypot, // Honeypot field
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirim komentar.');
      }

      if (data.comment) {
        setComments((prev) => [...prev, data.comment]);
        setContent('');
        setDisplayName('');
        setStatusMessage({ type: 'success', text: 'Komentar Anda berhasil dikirim!' });
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Terjadi kesalahan saat mengirim komentar.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    const confirmDelete = window.confirm('Apakah Anda yakin ingin menghapus komentar ini?');
    if (!confirmDelete) return;

    setDeletingId(commentId);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/comments?id=${commentId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghapus komentar.');
      }

      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setStatusMessage({ type: 'success', text: 'Komentar berhasil dihapus.' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Terjadi kesalahan saat menghapus komentar.' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section id="comments" className="mt-16 pt-10 border-t border-stone-200 dark:border-stone-800">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-serif text-xl sm:text-2xl font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-stone-600 dark:text-stone-400" />
          <span>Komentar ({comments.length})</span>
        </h3>
      </div>

      {/* Status Messages */}
      {statusMessage && (
        <div
          className={`mb-6 p-3.5 rounded-lg text-sm flex items-center gap-2.5 ${
            statusMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
          }`}
        >
          {statusMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Comment Form */}
      {commentsEnabled ? (
        <form onSubmit={handleSubmit} className="mb-12 space-y-4">
          {/* Honeypot anti-bot input (hidden) */}
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="website_hp"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="commenter-name"
              className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1"
            >
              Nama <span className="text-stone-400 dark:text-stone-500 font-normal">(opsional)</span>
            </label>
            <input
              id="commenter-name"
              type="text"
              maxLength={50}
              placeholder="Anonymous"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full sm:max-w-xs px-3.5 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600 transition"
            />
          </div>

          <div>
            <label
              htmlFor="comment-content"
              className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1"
            >
              Tulis Komentar
            </label>
            <textarea
              id="comment-content"
              rows={3}
              required
              maxLength={1000}
              placeholder="Tuliskan pemikiran atau tanggapan Anda..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600 transition resize-y"
            />
            <div className="flex justify-between items-center mt-1 text-[11px] text-stone-400 dark:text-stone-500">
              <span>Pengunjung dapat menghapus komentarnya sendiri setelah dikirim.</span>
              <span>{content.length}/1000</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Mengirim...' : 'Kirim Komentar'}</span>
          </button>
        </form>
      ) : (
        <div className="mb-10 p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-500 dark:text-stone-400 text-sm text-center">
          Komentar untuk postingan ini telah dinonaktifkan.
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-stone-400 dark:text-stone-600 text-sm text-center py-8">
            Belum ada komentar. Jadilah yang pertama memberikan tanggapan!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-xl border border-stone-200/80 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/40 space-y-2 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-xs sm:text-sm text-stone-800 dark:text-stone-200">
                    {comment.display_name}
                  </span>
                  <span className="text-stone-300 dark:text-stone-700">•</span>
                  <time className="text-[11px] font-mono text-stone-400 dark:text-stone-500">
                    {formatDateTime(comment.created_at)}
                  </time>
                </div>

                {/* Secure Delete Button: Available if user holds cookie token or is admin */}
                {(comment.is_owner || isAdmin) && (
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    disabled={deletingId === comment.id}
                    title="Hapus komentar ini"
                    className="text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs flex items-center gap-1 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="sr-only sm:not-sr-only text-[11px]">
                      {deletingId === comment.id ? 'Menghapus...' : 'Hapus'}
                    </span>
                  </button>
                )}
              </div>

              <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed whitespace-pre-line">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

