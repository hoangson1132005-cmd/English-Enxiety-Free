import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Phát file âm thanh cho người dùng đã đăng nhập. Hỗ trợ Range để trình phát tua được.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return new Response('Unauthorized', { status: 401 });

  const { id } = await params;
  const file = await prisma.audioFile.findUnique({ where: { id } });
  if (!file) return new Response('Not found', { status: 404 });

  const data = Buffer.from(file.data);
  const total = data.length;
  const headers: Record<string, string> = {
    'Content-Type': file.mimeType,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'private, max-age=86400',
  };

  const range = req.headers.get('range')?.match(/bytes=(\d*)-(\d*)/);
  if (range) {
    const start = range[1] ? parseInt(range[1], 10) : 0;
    const end = range[2] ? Math.min(parseInt(range[2], 10), total - 1) : total - 1;
    if (start >= total || start > end) {
      return new Response('Range not satisfiable', { status: 416, headers: { 'Content-Range': `bytes */${total}` } });
    }
    return new Response(data.subarray(start, end + 1), {
      status: 206,
      headers: { ...headers, 'Content-Range': `bytes ${start}-${end}/${total}`, 'Content-Length': String(end - start + 1) },
    });
  }
  return new Response(data, { status: 200, headers: { ...headers, 'Content-Length': String(total) } });
}
