'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  X,
  Play,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { slugify } from '@/lib/utils/format';
import type { Post, Media, PostStatus } from '@/types/database';

interface PostEditorProps {
  initialPost?: Post;
  isEditing?: boolean;
}

function getLocalDateTimeString(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function PostEditor({ initialPost, isEditing = false }: PostEditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialPost?.title || '');
  const [slug, setSlug] = useState(initialPost?.slug || '');
  const [content, setContent] = useState(initialPost?.content || '');
  const [status, setStatus] = useState<PostStatus>(initialPost?.status || 'published');
  const [commentsEnabled, setCommentsEnabled] = useState(
    initialPost ? initialPost.comments_enabled : true
  );
  const [publishedAt, setPublishedAt] = useState(
    initialPost?.published_at
      ? getLocalDateTimeString(new Date(initialPost.published_at))
      : getLocalDateTimeString(new Date())
  );

  // Media items state
  const [mediaItems, setMediaItems] = useState<
    Array<{
      id?: string;
      file_url: string;
      file_type: 'image' | 'video';
      caption: string;
      display_order: number;
    }>
  >(
    (initialPost?.media || []).map((m, idx) => ({
      id: m.id,
      file_url: m.file_url,
      file_type: m.file_type,
      caption: m.caption || '',
      display_order: m.display_order ?? idx,
    }))
  );

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isEditing || !slug) {
      setSlug(slugify(newTitle));
    }
  };

  // Upload handler for photos & videos
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMessage(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Gagal mengunggah file.');
        }

        setMediaItems((prev) => [
          ...prev,
          {
            file_url: data.url,
            file_type: data.fileType,
            caption: '',
            display_order: prev.length,
          },
        ]);
      } catch (err: any) {
        setErrorMessage(err.message || 'Terjadi kesalahan saat mengunggah media.');
      }
    }

    setUploading(false);
    e.target.value = '';
  };

  const handleRemoveMedia = (index: number) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCaptionChange = (index: number, caption: string) => {
    setMediaItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, caption } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      setErrorMessage('Judul dan slug postingan wajib diisi.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        content: content.trim(),
        status,
        comments_enabled: commentsEnabled,
        published_at: status === 'published' ? new Date(publishedAt).toISOString() : null,
        media: mediaItems.map((m, idx) => ({
          file_url: m.file_url,
          file_type: m.file_type,
          caption: m.caption,
          display_order: idx,
        })),
      };

      const endpoint = isEditing ? `/api/posts/${initialPost?.id}` : '/api/posts';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan postingan.');
      }

      router.push('/admin/posts');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat menyimpan postingan.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
      {errorMessage && (
        <div className="p-4 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900 flex items-center gap-2.5 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Details */}
      <div className="space-y-4 bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800">
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
            Judul Postingan
          </label>
          <input
            type="text"
            required
            placeholder="Tuliskan judul artikel atau jurnal..."
            value={title}
            onChange={handleTitleChange}
            className="w-full px-4 py-2.5 text-lg font-serif rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 transition"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              Slug URL
            </label>
            <button
              type="button"
              onClick={() => setSlug(slugify(title))}
              className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Generate dari judul</span>
            </button>
          </div>
          <div className="flex items-center rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950 px-3 py-2 text-sm">
            <span className="text-stone-400 select-none mr-1">/post/</span>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="judul-postingan"
              className="w-full bg-transparent text-stone-900 dark:text-stone-100 focus:outline-none font-mono text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
            Isi Tulisan / Jurnal
          </label>
          <textarea
            rows={12}
            placeholder="Tuliskan cerita, pemikiran, atau jurnal Anda di sini..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-3 text-sm sm:text-base leading-relaxed rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 transition resize-y font-sans"
          />
        </div>
      </div>

      {/* Media Attachments Section */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200">
              Media Lampiran (Foto & Video)
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Unggah foto (JPG, PNG, WebP) atau video (MP4, WebM) yang tersimpan di Supabase Storage.
            </p>
          </div>

          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition">
            <UploadCloud className="w-4 h-4 text-stone-600 dark:text-stone-400" />
            <span>{uploading ? 'Mengunggah...' : 'Pilih File Media'}</span>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              disabled={uploading}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Media Preview Grid */}
        {mediaItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {mediaItems.map((item, index) => (
              <div
                key={index}
                className="relative rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 p-2 space-y-2"
              >
                <div className="relative aspect-video rounded overflow-hidden bg-black/10">
                  {item.file_type === 'video' ? (
                    <video
                      src={item.file_url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={item.file_url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(index)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition"
                    title="Hapus media"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Keterangan / caption media..."
                  value={item.caption}
                  onChange={(e) => handleCaptionChange(index, e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings & Publishing Options */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
            Status Postingan
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="published"
                checked={status === 'published'}
                onChange={() => setStatus('published')}
                className="accent-stone-900 dark:accent-stone-100"
              />
              <span>Published</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="draft"
                checked={status === 'draft'}
                onChange={() => setStatus('draft')}
                className="accent-stone-900 dark:accent-stone-100"
              />
              <span>Draft</span>
            </label>
          </div>
        </div>

        {/* Publication Date */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              Tanggal Publikasi
            </label>
            <button
              type="button"
              onClick={() => setPublishedAt(getLocalDateTimeString(new Date()))}
              className="text-[11px] text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 underline decoration-dotted transition"
            >
              Waktu Sekarang
            </button>
          </div>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100"
          />
        </div>

        {/* Comments Toggle */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
            Interaksi Pengunjung
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300 cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={commentsEnabled}
              onChange={(e) => setCommentsEnabled(e.target.checked)}
              className="accent-stone-900 dark:accent-stone-100 rounded"
            />
            <span>Izinkan Komentar</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={saving || uploading}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-lg bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 disabled:opacity-50 transition shadow-sm"
        >
          <Check className="w-4 h-4" />
          <span>{saving ? 'Menyimpan...' : isEditing ? 'Perbarui Postingan' : 'Terbitkan Postingan'}</span>
        </button>
      </div>
    </form>
  );
}

