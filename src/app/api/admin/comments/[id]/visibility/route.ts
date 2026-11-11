import { NextRequest, NextResponse } from 'next/server';
import { toggleCommentVisibility } from '@/lib/services/comments';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const isHidden = Boolean(body.isHidden);

    const result = await toggleCommentVisibility(id, isHidden);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, isHidden });
  } catch (err: any) {
    console.error('API /admin/comments/[id]/visibility error:', err);
    return NextResponse.json(
      { error: err.message || 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}

