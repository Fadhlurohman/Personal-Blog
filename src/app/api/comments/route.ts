import { NextRequest, NextResponse } from 'next/server';
import { createComment, deleteComment } from '@/lib/services/comments';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Spam Honeypot check
    if (body.website_hp) {
      // Honeypot filled by bot: pretend success without saving
      return NextResponse.json({ success: true, message: 'Comment submitted' });
    }

    const { postId, displayName, content } = body;

    if (!postId || !content) {
      return NextResponse.json(
        { error: 'Post ID dan konten komentar wajib diisi.' },
        { status: 400 }
      );
    }

    const result = await createComment({
      postId,
      displayName,
      content,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, comment: result.comment }, { status: 201 });
  } catch (err: any) {
    console.error('API /comments POST error:', err);
    return NextResponse.json(
      { error: err.message || 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('id');

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID wajib disertakan.' },
        { status: 400 }
      );
    }

    const result = await deleteComment(commentId);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Gagal menghapus komentar.' }, { status: 403 });
    }

    return NextResponse.json({ success: true, message: 'Komentar berhasil dihapus.' });
  } catch (err: any) {
    console.error('API /comments DELETE error:', err);
    return NextResponse.json(
      { error: err.message || 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}

