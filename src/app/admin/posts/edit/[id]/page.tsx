import PostEditor from '@/components/PostEditor';
import { getPostByIdAdmin } from '@/lib/services/posts';
import { notFound } from 'next/navigation';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const post = await getPostByIdAdmin(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
          Edit Postingan
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-1">
          Perbarui teks, status publikasi, atau kelola media lampiran.
        </p>
      </div>

      <PostEditor initialPost={post} isEditing={true} />
    </div>
  );
}

