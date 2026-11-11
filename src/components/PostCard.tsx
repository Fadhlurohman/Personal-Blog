'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, ArrowRight, Calendar } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/format';
import type { Post } from '@/types/database';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const mediaItems = post.media || [];
  const hasMedia = mediaItems.length > 0;

  return (
    <article className="group py-8 sm:py-10 border-b border-stone-200/70 dark:border-stone-800/70 last:border-b-0 transition-colors">
      {/* Date & Time */}
      <div className="flex items-center gap-2 text-xs font-mono text-stone-400 dark:text-stone-500 mb-2.5">
        <Calendar className="w-3.5 h-3.5" />
        <time dateTime={post.published_at || post.created_at}>
          {formatDateTime(post.published_at || post.created_at)}
        </time>
      </div>

      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stone-900 dark:text-stone-100 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors mb-3 leading-snug">
        <Link href={`/post/${post.slug}`}>
          {post.title}
        </Link>
      </h2>

      {/* Content Preview */}
      <div className="prose prose-stone dark:prose-invert max-w-none text-stone-700 dark:text-stone-300 text-sm sm:text-base leading-relaxed whitespace-pre-line line-clamp-4 mb-4">
        {post.content}
      </div>

      {/* Media Attachments Preview */}
      {hasMedia && (
        <div className="my-4 space-y-2">
          {mediaItems.length === 1 ? (
            <div className="rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900">
              {mediaItems[0].file_type === 'video' ? (
                <video
                  src={mediaItems[0].file_url}
                  controls
                  preload="metadata"
                  className="w-full max-h-[420px] object-cover bg-black"
                />
              ) : (
                <div className="relative aspect-video sm:aspect-auto sm:max-h-[420px] overflow-hidden">
                  <img
                    src={mediaItems[0].file_url}
                    alt={mediaItems[0].caption || post.title}
                    loading="lazy"
                    className="w-full h-auto max-h-[420px] object-cover hover:scale-101 transition-transform duration-300"
                  />
                </div>
              )}
              {mediaItems[0].caption && (
                <p className="text-xs text-stone-500 dark:text-stone-400 px-3 py-2 italic border-t border-stone-100 dark:border-stone-800/50">
                  {mediaItems[0].caption}
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {mediaItems.slice(0, 4).map((item, index) => (
                <div
                  key={item.id}
                  className="relative rounded-lg overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 aspect-square"
                >
                  {item.file_type === 'video' ? (
                    <video
                      src={item.file_url}
                      controls
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={item.file_url}
                      alt={item.caption || `Media ${index + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {index === 3 && mediaItems.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-medium text-sm">
                      +{mediaItems.length - 4} media
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Meta / Detail Link */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-2">
        <Link
          href={`/post/${post.slug}#comments`}
          className="flex items-center gap-1.5 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{post.comments_count ?? 0} komentar</span>
        </Link>

        <Link
          href={`/post/${post.slug}`}
          className="inline-flex items-center gap-1 font-medium text-stone-800 dark:text-stone-200 hover:gap-1.5 transition-all"
        >
          <span>Baca selengkapnya</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}

