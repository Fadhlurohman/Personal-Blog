import { NextRequest, NextResponse } from 'next/server';
import { uploadMediaFile } from '@/lib/services/media';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan.' }, { status: 400 });
    }

    const result = await uploadMediaFile(file);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      fileType: result.fileType,
    });
  } catch (err: any) {
    console.error('API /media/upload error:', err);
    return NextResponse.json(
      { error: err.message || 'Terjadi kesalahan saat mengunggah media.' },
      { status: 500 }
    );
  }
}

