import { NextRequest, NextResponse } from 'next/server';
import { createPost } from '@/lib/services/posts';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = await createPost(body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, post: result.post }, { status: 201 });
  } catch (err: any) {
    console.error('API /posts POST error:', err);
    return NextResponse.json(
      { error: err.message || 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}

