import PublicLayout from '@/components/PublicLayout';
import MediaGallery from '@/components/MediaGallery';
import { getAllMedia } from '@/lib/services/media';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Galeri Media',
  description: 'Koleksi dokumentasi foto dan video dari seluruh tulisan dan catatan perjalanan.',
};

export default async function MediaPage() {
  const { media } = await getAllMedia({ limit: 100 });

  return (
    <PublicLayout>
      <section className="pb-6 mb-4 border-b border-stone-200 dark:border-stone-800">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mb-2">
          Galeri Media
        </h1>
        <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
          Kumpulan dokumentasi foto dan video visual dari seluruh catatan dan cerita.
        </p>
      </section>

      <section>
        <MediaGallery initialMedia={media} />
      </section>
    </PublicLayout>
  );
}

