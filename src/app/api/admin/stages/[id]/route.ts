import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const stage = await prisma.stage.update({
    where: { id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.order !== undefined ? { order: body.order } : {}),
      ...(body.focus_skills !== undefined ? { focusSkills: JSON.stringify(body.focus_skills) } : {}),
      ...(body.weeks !== undefined ? { weeks: JSON.stringify(body.weeks) } : {}),
      ...(body.has_midterm !== undefined ? { hasMidterm: body.has_midterm } : {}),
      ...(body.has_final !== undefined ? { hasFinal: body.has_final } : {}),
      ...(body.why_this_stage !== undefined ? { whyThisStage: body.why_this_stage } : {}),
    },
    include: { lessons: { select: { id: true } } },
  });

  return NextResponse.json({
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
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  await prisma.stage.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
