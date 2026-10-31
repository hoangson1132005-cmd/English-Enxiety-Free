import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

function serializeStage(stage: {
  id: string; order: number; title: string; description: string; focusSkills: string; weeks: string;
  hasMidterm: boolean; hasFinal: boolean; whyThisStage: string | null; isPublished: boolean;
  lessons: { id: string }[];
}) {
  return {
    id: stage.id,
    order: stage.order,
    title: stage.title,
    description: stage.description,
    focus_skills: JSON.parse(stage.focusSkills),
    weeks: JSON.parse(stage.weeks),
    has_midterm: stage.hasMidterm,
    has_final: stage.hasFinal,
    why_this_stage: stage.whyThisStage ?? undefined,
    is_published: stage.isPublished,
    lesson_count: stage.lessons.length,
  };
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const stages = await prisma.stage.findMany({ orderBy: { order: 'asc' }, include: { lessons: { select: { id: true } } } });
  return NextResponse.json(stages.map(serializeStage));
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  if (!body.title) return NextResponse.json({ error: 'Thiếu tên chặng' }, { status: 400 });

  const maxOrder = await prisma.stage.aggregate({ _max: { order: true } });
  const nextOrder = (maxOrder._max.order ?? 0) + 1;

  const stage = await prisma.stage.create({
    data: {
      order: body.order ?? nextOrder,
      title: body.title,
      description: body.description || '',
      focusSkills: JSON.stringify(body.focus_skills ?? []),
      weeks: JSON.stringify(body.weeks ?? []),
      hasMidterm: !!body.has_midterm,
      hasFinal: !!body.has_final,
      whyThisStage: body.why_this_stage || null,
      isPublished: true,
    },
    include: { lessons: { select: { id: true } } },
  });

  return NextResponse.json(serializeStage(stage), { status: 201 });
}
