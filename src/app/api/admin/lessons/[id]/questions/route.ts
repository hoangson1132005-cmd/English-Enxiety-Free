import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id: lessonId } = await params;
  const body = await req.json();
  if (!body.question || !body.answer) {
    return NextResponse.json({ error: 'Thiếu nội dung câu hỏi hoặc đáp án' }, { status: 400 });
  }

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ error: 'Không tìm thấy bài học' }, { status: 404 });

  const q = await prisma.question.create({
    data: {
      lessonId,
      skill: body.skill ?? lesson.skill,
      topic: body.topic || lesson.topic,
      level: body.level ?? 'B1',
      type: body.type ?? 'multiple_choice',
      question: body.question,
      options: body.options ? JSON.stringify(body.options) : null,
      answer: JSON.stringify(body.answer),
      explanation: body.explanation ?? '',
    },
  });

  return NextResponse.json(
    {
      id: q.id,
      question: q.question,
      skill: q.skill,
      topic: q.topic,
      level: q.level,
      type: q.type,
      options: q.options ? JSON.parse(q.options) : undefined,
      answer: JSON.parse(q.answer),
      explanation: q.explanation,
    },
    { status: 201 }
  );
}
