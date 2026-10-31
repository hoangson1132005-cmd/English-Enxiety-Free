import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createStageSession } from '@/lib/quiz';

// Mở bài kiểm tra cuối chặng (15-20 câu) khi học viên đã học xong mọi bài của chặng đó.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const phase = Number((await req.json().catch(() => ({}))).phase);
  if (!Number.isInteger(phase) || phase < 1) return NextResponse.json({ error: 'Thiếu chặng' }, { status: 400 });

  const roadmap = await prisma.userRoadmap.findFirst({
    where: { userId: session.user.id, status: 'active' },
    include: { items: true },
  });
  if (!roadmap) return NextResponse.json({ error: 'Chưa có lộ trình' }, { status: 404 });

  const inPhase = roadmap.items.filter((i) => i.phase === phase && i.status !== 'suggested' && i.status !== 'dismissed');
  if (!inPhase.length) return NextResponse.json({ error: 'Chặng này không có bài học' }, { status: 404 });
  if (!inPhase.every((i) => i.status === 'completed')) {
    return NextResponse.json({ error: 'Hãy hoàn thành tất cả bài học trong chặng trước khi kiểm tra' }, { status: 403 });
  }

  try {
    const { session: quiz, questions } = await createStageSession(session.user.id, roadmap.id, phase);
    if (!questions.length) {
      return NextResponse.json({ error: 'Ngân hàng câu hỏi chưa có câu phù hợp. Vui lòng liên hệ quản trị viên.' }, { status: 503 });
    }
    return NextResponse.json({ session_id: quiz.id });
  } catch (err) {
    console.error('Create stage quiz failed:', err);
    return NextResponse.json({ error: 'Không tạo được bài kiểm tra. Vui lòng thử lại.' }, { status: 500 });
  }
}
