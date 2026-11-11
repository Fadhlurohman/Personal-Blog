import PostEditor from '@/components/PostEditor';

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
          Tulis Postingan Baru
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-1">
          Bagikan cerita, pemikiran, foto, atau video ke ruang digital Anda.
        </p>
      </div>

      <PostEditor isEditing={false} />
    </div>
  );
}

