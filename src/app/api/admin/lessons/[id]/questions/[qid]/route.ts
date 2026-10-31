import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { buildQuestionData, serializeAdminQuestion } from '@/lib/questionInput';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; qid: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { qid } = await params;
  const existing = await prisma.question.findUnique({ where: { id: qid } });
  if (!existing) return NextResponse.json({ error: 'Không tìm thấy câu hỏi' }, { status: 404 });

  const built = buildQuestionData(await req.json(), { skill: existing.skill, topic: existing.topic });
  if ('error' in built) return NextResponse.json({ error: built.error }, { status: 400 });

  const q = await prisma.question.update({ where: { id: qid }, data: built.data });
  return NextResponse.json(serializeAdminQuestion(q));
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; qid: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { qid } = await params;
  await prisma.question.delete({ where: { id: qid } });
  return NextResponse.json({ success: true });
}
