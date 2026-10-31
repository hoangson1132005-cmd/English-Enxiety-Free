import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { ensureActiveRoadmap, generateRoadmap, ROADMAP_WEEKS } from '@/lib/roadmap';

async function buildView(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const active = await ensureActiveRoadmap(userId);
  const roadmap = await prisma.userRoadmap.findUniqueOrThrow({
    where: { id: active.id },
    include: {
      items: {
        orderBy: { order: 'asc' },
        include: { lesson: { include: { stage: true } }, attempts: { select: { id: true } } },
      },
    },
  });

  const inRoadmap = new Set(roadmap.items.map((i) => i.lessonId));
  const catalog = await prisma.lesson.findMany({
    where: { stage: { isPublished: true }, id: { notIn: [...inRoadmap] } },
    include: { stage: true },
    orderBy: [{ stage: { order: 'asc' } }, { order: 'asc' }],
  });

  const history = await prisma.userRoadmap.findMany({
    where: { userId, status: { in: ['completed', 'archived'] } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return {
    user: {
      id: user.id, full_name: user.fullName, email: user.email, current_level: user.currentLevel,
      daily_minutes: user.dailyMinutes, goal: user.goal,
    },
    roadmap: {
      id: roadmap.id, cycle: roadmap.cycle, kind: roadmap.kind, level: roadmap.level,
      generated_by: roadmap.generatedBy, rationale: roadmap.rationale, created_at: roadmap.createdAt.toISOString(),
    },
    items: roadmap.items.map((i) => ({
      item_id: i.id,
      lesson_id: i.lessonId,
      title: i.lesson.title,
      skill: i.lesson.skill,
      level: i.lesson.level,
      stage_title: i.lesson.stage.title,
      duration_minutes: i.lesson.durationMinutes,
      order: i.order,
      week: i.week,
      status: i.status,
      source: i.source,
      reason: i.reason,
      best_score: i.bestScore,
      attempt_count: i.attempts.length,
    })),
    catalog: catalog.map((l) => ({
      lesson_id: l.id, title: l.title, skill: l.skill, level: l.level, stage_title: l.stage.title, duration_minutes: l.durationMinutes,
    })),
    history: history.map((h) => ({
      id: h.id, cycle: h.cycle, kind: h.kind, level: h.level, status: h.status, created_at: h.createdAt.toISOString(),
    })),
  };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const exists = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
  return NextResponse.json(await buildView(id));
}

// Nhờ AI tạo lại lộ trình (mặc định giữ các bài học viên đã hoàn thành).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!user) return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });

  const current = await prisma.userRoadmap.findFirst({ where: { userId: id, status: 'active' } });
  await generateRoadmap(id, {
    kind: (current?.kind as 'initial' | 'level_up' | 'improve') ?? 'initial',
    by: 'admin',
    keepCompleted: body.keep_completed !== false && !!current,
  });
  return NextResponse.json(await buildView(id));
}

// Chỉnh tay: thêm bài, bỏ bài chưa học, đổi thứ tự.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const body = await req.json();

  const roadmap = await ensureActiveRoadmap(id);
  const items = await prisma.userRoadmapItem.findMany({
    where: { roadmapId: roadmap.id, status: { notIn: ['suggested', 'dismissed'] } },
    orderBy: { order: 'asc' },
  });

  if (body.action === 'add') {
    const lesson = await prisma.lesson.findUnique({ where: { id: body.lesson_id } });
    if (!lesson) return NextResponse.json({ error: 'Không tìm thấy bài học' }, { status: 404 });
    const existing = await prisma.userRoadmapItem.findUnique({
      where: { roadmapId_lessonId: { roadmapId: roadmap.id, lessonId: lesson.id } },
    });
    if (existing) {
      await prisma.userRoadmapItem.update({
        where: { id: existing.id },
        data: { status: 'pending', source: 'admin', order: (items[items.length - 1]?.order ?? 0) + 1 },
      });
    } else {
      await prisma.userRoadmapItem.create({
        data: {
          roadmapId: roadmap.id, lessonId: lesson.id, source: 'admin', status: 'pending',
          order: (items[items.length - 1]?.order ?? 0) + 1, week: ROADMAP_WEEKS, reason: 'Giáo viên thêm cho bạn',
        },
      });
    }
  } else if (body.action === 'remove') {
    const item = items.find((i) => i.id === body.item_id);
    if (!item) return NextResponse.json({ error: 'Không tìm thấy bài trong lộ trình' }, { status: 404 });
    if (item.status === 'completed') {
      return NextResponse.json({ error: 'Không thể bỏ bài học viên đã hoàn thành' }, { status: 400 });
    }
    await prisma.userRoadmapItem.delete({ where: { id: item.id } });
  } else if (body.action === 'move') {
    const idx = items.findIndex((i) => i.id === body.item_id);
    const swapWith = body.direction === 'up' ? idx - 1 : idx + 1;
    if (idx < 0 || swapWith < 0 || swapWith >= items.length) return NextResponse.json({ error: 'Không thể di chuyển' }, { status: 400 });
    const a = items[idx];
    const b = items[swapWith];
    await prisma.$transaction([
      prisma.userRoadmapItem.update({ where: { id: a.id }, data: { order: b.order } }),
      prisma.userRoadmapItem.update({ where: { id: b.id }, data: { order: a.order } }),
    ]);
  } else {
    return NextResponse.json({ error: 'Hành động không hợp lệ' }, { status: 400 });
  }

  await prisma.userRoadmap.update({ where: { id: roadmap.id }, data: { generatedBy: 'admin' } });
  return NextResponse.json(await buildView(id));
}
