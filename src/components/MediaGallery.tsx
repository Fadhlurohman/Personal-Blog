'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, Play, Image as ImageIcon, Film, ExternalLink } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/format';
import type { Media, MediaType } from '@/types/database';

interface MediaWithPost extends Media {
  post_title?: string;
  post_slug?: string;
}

interface MediaGalleryProps {
  initialMedia: MediaWithPost[];
}

export default function MediaGallery({ initialMedia }: MediaGalleryProps) {
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<MediaWithPost | null>(null);

  const filteredMedia = initialMedia.filter((item) => {
    if (filter === 'all') return true;
    return item.file_type === filter;
  });

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-8 border-b border-stone-200 dark:border-stone-800 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            filter === 'all'
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          Semua ({initialMedia.length})
        </button>
        <button
          onClick={() => setFilter('image')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
            filter === 'image'
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Foto ({initialMedia.filter((m) => m.file_type === 'image').length})</span>
        </button>
        <button
          onClick={() => setFilter('video')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
            filter === 'video'
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Video ({initialMedia.filter((m) => m.file_type === 'video').length})</span>
        </button>
      </div>

      {/* Grid */}
      {filteredMedia.length === 0 ? (
        <div className="text-center py-16 text-stone-400 dark:text-stone-600 text-sm">
          Belum ada media yang diunggah.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 flex flex-col"
            >
              <div className="relative aspect-square overflow-hidden bg-black/10">
                {item.file_type === 'video' ? (
                  <video
                    src={item.file_url}
                    controls
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(item)}
                    className="w-full h-full text-left cursor-zoom-in"
                  >
                    <img
                      src={item.file_url}
                      alt={item.caption || 'Media gallery'}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </button>
                )}

                {/* Media Type Badge */}
                <div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-md text-white p-1 rounded-md pointer-events-none">
                  {item.file_type === 'video' ? (
                    <Play className="w-3 h-3 fill-white" />
                  ) : (
                    <ImageIcon className="w-3 h-3" />
                  )}
                </div>
              </div>

              {/* Caption & Post link */}
              {(item.caption || item.post_title) && (
                <div className="p-3 text-xs flex-1 flex flex-col justify-between border-t border-stone-100 dark:border-stone-800/60">
                  {item.caption && (
                    <p className="text-stone-700 dark:text-stone-300 mb-1 line-clamp-2">
                      {item.caption}
                    </p>
                  )}
                  {item.post_slug && item.post_title && (
                    <Link
                      href={`/post/${item.post_slug}`}
                      className="text-stone-400 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 inline-flex items-center gap-1 font-medium mt-auto"
                    >
                      <span className="truncate">{item.post_title}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal for Photo Zoom */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors z-10"
            aria-label="Tutup"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-4xl max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.file_url}
              alt={selectedPhoto.caption || 'Preview foto'}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
            />
            {selectedPhoto.caption && (
              <p className="mt-4 text-stone-200 text-sm text-center max-w-lg bg-black/40 px-4 py-2 rounded-lg">
                {selectedPhoto.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

