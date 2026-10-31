import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

type Phase = { title: string };

// Lịch sử bốc câu: mỗi lượt kiểm tra (cuối bài / cuối chặng / cuối khóa) của học viên dùng những câu nào.
export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const p = new URL(req.url).searchParams;
  const where: Prisma.QuizSessionWhereInput = {};
  const kind = p.get('kind');
  if (kind && kind !== 'all') where.kind = kind;
  const status = p.get('status');
  if (status && status !== 'all') where.status = status;
  const q = p.get('q')?.trim();
  if (q) where.user = { OR: [{ fullName: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] };

  const page = Math.max(1, Number(p.get('page')) || 1);
  const pageSize = 25;
  const [total, rows] = await Promise.all([
    prisma.quizSession.count({ where }),
    prisma.quizSession.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { fullName: true, email: true } } },
    }),
  ]);

  const lessonIds = [...new Set(rows.map((r) => r.lessonId).filter((x): x is string => !!x))];
  const roadmapIds = [...new Set(rows.map((r) => r.roadmapId).filter((x): x is string => !!x))];
  const [lessons, roadmaps] = await Promise.all([
    prisma.lesson.findMany({ where: { id: { in: lessonIds } }, select: { id: true, title: true } }),
    prisma.userRoadmap.findMany({ where: { id: { in: roadmapIds } }, select: { id: true, phases: true, cycle: true } }),
  ]);

  const items = rows.map((r) => {
    let scope = 'Cuối khóa';
    if (r.kind === 'lesson') scope = `Cuối bài: ${lessons.find((l) => l.id === r.lessonId)?.title ?? '(bài đã xóa)'}`;
    if (r.kind === 'stage') {
      let title = `Chặng ${r.phase}`;
      try {
        const phases = JSON.parse(roadmaps.find((m) => m.id === r.roadmapId)?.phases ?? '[]') as Phase[];
        if (r.phase && phases[r.phase - 1]) title = `Chặng ${r.phase}: ${phases[r.phase - 1].title}`;
      } catch {
        // dùng tên mặc định
      }
      scope = `Cuối chặng - ${title}`;
    }
    return {
      id: r.id,
      kind: r.kind,
      scope,
      user: { name: r.user.fullName, email: r.user.email },
      question_count: (JSON.parse(r.questionIds) as string[]).length,
      status: r.status,
      score: r.score,
      created_at: r.createdAt.toISOString(),
    };
  });

  return NextResponse.json({ items, total, page, page_size: pageSize });
}
