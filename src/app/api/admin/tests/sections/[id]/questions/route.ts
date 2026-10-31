import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { buildQuestionData, serializeAdminQuestion } from '@/lib/questionInput';

// Thêm một câu hỏi vào phần thi của đề test.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id: sectionId } = await params;
  const section = await prisma.testSection.findUnique({ where: { id: sectionId } });
  if (!section) return NextResponse.json({ error: 'Không tìm thấy phần thi' }, { status: 404 });

  const built = buildQuestionData(await req.json(), { skill: section.skill, topic: 'general' });
  if ('error' in built) return NextResponse.json({ error: built.error }, { status: 400 });

  const q = await prisma.question.create({ data: { ...built.data, testSectionId: sectionId } });
  return NextResponse.json(serializeAdminQuestion(q), { status: 201 });
}
