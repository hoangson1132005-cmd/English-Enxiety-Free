import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

// Câu hỏi này đã được bốc vào những lượt kiểm tra nào (tối đa 10 lượt gần nhất).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const q = await prisma.question.findUnique({ where: { id }, select: { usedCount: true, correctCount: true, lessonId: true } });
  if (!q) return NextResponse.json({ error: 'Không tìm thấy câu hỏi' }, { status: 404 });

  const sessions = await prisma.quizSession.findMany({
    where: { questionIds: { contains: `"${id}"` } },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { user: { select: { fullName: true } } },
  });
  const lessonIds = [...new Set(sessions.map((s) => s.lessonId).filter((x): x is string => !!x))];
  const lessons = await prisma.lesson.findMany({ where: { id: { in: lessonIds } }, select: { id: true, title: true } });

  const total = await prisma.quizSession.count({ where: { questionIds: { contains: `"${id}"` } } });
  const attachedLesson = q.lessonId ? await prisma.lesson.findUnique({ where: { id: q.lessonId }, select: { title: true } }) : null;

  return NextResponse.json({
    attached_lesson: attachedLesson?.title ?? null,
    total_sessions: total,
    used_count: q.usedCount,
    sessions: sessions.map((s) => ({
      id: s.id,
      kind: s.kind,
      scope: s.kind === 'lesson' ? lessons.find((l) => l.id === s.lessonId)?.title ?? '(bài đã xóa)' : s.kind === 'stage' ? `Chặng ${s.phase}` : 'Cuối khóa',
      user: s.user.fullName,
      status: s.status,
      created_at: s.createdAt.toISOString(),
    })),
  });
}
