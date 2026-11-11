import { getAllPostsAdmin } from '@/lib/services/posts';
import AdminPostList from '@/components/AdminPostList';

export default async function AdminPostsPage() {
  const { posts } = await getAllPostsAdmin({ limit: 100 });

  return <AdminPostList initialPosts={posts} />;
}

