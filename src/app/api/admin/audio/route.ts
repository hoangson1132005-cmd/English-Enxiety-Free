import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

const MAX_BYTES = 6 * 1024 * 1024; // 6MB: đủ cho vài phút mp3
const ALLOWED = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/webm'];

// Admin upload một file âm thanh; trả về đường dẫn để gắn vào câu hỏi (audio_url).
export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Thiếu file âm thanh' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'File quá lớn (tối đa 6MB). Hãy nén hoặc cắt ngắn bản ghi.' }, { status: 400 });

  const mime = file.type || (file.name.toLowerCase().endsWith('.mp3') ? 'audio/mpeg' : '');
  if (!ALLOWED.includes(mime)) {
    return NextResponse.json({ error: 'Định dạng không hỗ trợ. Dùng mp3, wav, m4a, ogg hoặc webm.' }, { status: 400 });
  }

  const saved = await prisma.audioFile.create({
    data: { fileName: file.name, mimeType: mime, sizeBytes: file.size, data: Buffer.from(await file.arrayBuffer()) },
    select: { id: true, fileName: true, sizeBytes: true },
  });
  return NextResponse.json({ id: saved.id, url: `/api/audio/${saved.id}`, file_name: saved.fileName, size_bytes: saved.sizeBytes }, { status: 201 });
}
