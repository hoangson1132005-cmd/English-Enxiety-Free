import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

const MANUAL_SOURCE = 'Nhập thủ công';

function serialize(l: {
  id: string; order: number; title: string; skill: string; level: string | null; durationMinutes: number; xpReward: number;
  description: string; topic: string; isPublished: boolean; source: string;
}) {
  return {
    id: l.id,
    order: l.order,
    title: l.title,
    skill: l.skill,
    level: l.level,
    duration_minutes: l.durationMinutes,
    xp_reward: l.xpReward,
    description: l.description,
    topic: l.topic,
    is_published: l.isPublished,
    source: l.source,
  };
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const lessons = await prisma.lesson.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(lessons.map(serialize));
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  if (!body.title) return NextResponse.json({ error: 'Thiếu tên bài học' }, { status: 400 });

  const last = await prisma.lesson.aggregate({ _max: { order: true } });
  const lesson = await prisma.lesson.create({
    data: {
      order: (last._max.order ?? 0) + 1,
      title: body.title,
      skill: body.skill ?? 'vocabulary',
      durationMinutes: body.duration_minutes ?? 20,
      xpReward: body.xp_reward ?? 50,
      description: body.description ?? '',
      topic: body.topic || 'general',
      source: MANUAL_SOURCE,
      isPublished: false, // nháp cho tới khi admin xuất bản
    },
  });

  return NextResponse.json(serialize(lesson), { status: 201 });
}
