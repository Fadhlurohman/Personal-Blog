import { getAllCommentsAdmin } from '@/lib/services/comments';
import AdminCommentList from '@/components/AdminCommentList';

export default async function AdminCommentsPage() {
  const { comments } = await getAllCommentsAdmin({ limit: 100 });

  return <AdminCommentList initialComments={comments} />;
}

