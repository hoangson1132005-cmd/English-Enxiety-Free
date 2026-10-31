import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { buildQuestionData, serializeAdminQuestion } from '@/lib/questionInput';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id: lessonId } = await params;
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ error: 'Không tìm thấy bài học' }, { status: 404 });

  const built = buildQuestionData(await req.json(), { skill: lesson.skill, topic: lesson.topic });
  if ('error' in built) return NextResponse.json({ error: built.error }, { status: 400 });

  const q = await prisma.question.create({ data: { ...built.data, lessonId } });
  return NextResponse.json(serializeAdminQuestion(q), { status: 201 });
}
