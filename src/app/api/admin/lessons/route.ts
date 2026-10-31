import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const lessons = await prisma.lesson.findMany({
    include: { stage: true },
    orderBy: [{ stage: { order: 'asc' } }, { order: 'asc' }],
  });

  return NextResponse.json(
    lessons.map((l) => ({
      id: l.id,
      stage_id: l.stageId,
      stage_title: l.stage.title,
      order: l.order,
      title: l.title,
      skill: l.skill,
      duration_minutes: l.durationMinutes,
      xp_reward: l.xpReward,
      description: l.description,
      topic: l.topic,
    }))
  );
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  if (!body.title) return NextResponse.json({ error: 'Thiếu tên bài học' }, { status: 400 });

  const stage = await prisma.stage.findFirst({ where: { title: body.stage_title } });
  if (!stage) return NextResponse.json({ error: 'Không tìm thấy chặng học' }, { status: 400 });

  const lesson = await prisma.lesson.create({
    data: {
      stageId: stage.id,
      order: (await prisma.lesson.count({ where: { stageId: stage.id } })) + 1,
      title: body.title,
      skill: body.skill ?? 'vocabulary',
      durationMinutes: body.duration_minutes ?? 20,
      xpReward: body.xp_reward ?? 50,
      description: body.description ?? '',
      topic: body.topic || 'general',
    },
    include: { stage: true },
  });

  return NextResponse.json(
    {
      id: lesson.id,
      stage_id: lesson.stageId,
      stage_title: lesson.stage.title,
      order: lesson.order,
      title: lesson.title,
      skill: lesson.skill,
      duration_minutes: lesson.durationMinutes,
      xp_reward: lesson.xpReward,
      description: lesson.description,
      topic: lesson.topic,
    },
    { status: 201 }
  );
}
