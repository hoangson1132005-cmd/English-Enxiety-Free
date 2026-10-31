import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { generateQuestionsForLesson } from '@/lib/quiz';

// Nhờ AI tạo sẵn câu hỏi cho bài này; câu được lưu vào ngân hàng (nguồn "AI tạo") và admin có thể sửa / ẩn.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    const created = await generateQuestionsForLesson(id, body.count ? Number(body.count) : undefined);
    if (!created.length) {
      return NextResponse.json({ error: 'AI chưa tạo được câu hỏi hợp lệ. Hãy thử lại sau ít phút.' }, { status: 502 });
    }
    return NextResponse.json({
      created: created.map((q) => ({ id: q.id, question: q.question, skill: q.skill, level: q.level, type: q.type })),
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Không tìm thấy bài học' }, { status: 404 });
  }
}
