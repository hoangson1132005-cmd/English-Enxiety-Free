import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id: testId } = await params;
  const body = await req.json();
  if (!body.title) return NextResponse.json({ error: 'Thiếu tên phần thi' }, { status: 400 });

  const test = await prisma.test.findUnique({ where: { id: testId } });
  if (!test) return NextResponse.json({ error: 'Không tìm thấy đề test' }, { status: 404 });

  const order = await prisma.testSection.count({ where: { testId } });

  const section = await prisma.testSection.create({
    data: {
      testId,
      skill: body.skill ?? 'vocabulary',
      title: body.title,
      instructions: body.instructions ?? '',
      timeLimitMinutes: body.time_limit_minutes ?? null,
      order,
    },
  });

  return NextResponse.json(
    {
      id: section.id,
      skill: section.skill,
      title: section.title,
      instructions: section.instructions,
      time_limit_minutes: section.timeLimitMinutes ?? undefined,
      questions: [],
    },
    { status: 201 }
  );
}
