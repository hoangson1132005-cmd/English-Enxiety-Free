import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

function serializeQuestion(q: {
  id: string; skill: string; topic: string; level: string; type: string;
  question: string; options: string | null; answer: string; explanation: string;
  audioUrl: string | null; passage: string | null;
}) {
  return {
    id: q.id,
    skill: q.skill,
    topic: q.topic,
    level: q.level,
    type: q.type,
    question: q.question,
    options: q.options ? JSON.parse(q.options) : undefined,
    answer: JSON.parse(q.answer),
    explanation: q.explanation,
    audio_url: q.audioUrl ?? undefined,
    passage: q.passage ?? undefined,
  };
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const questions = await prisma.question.findMany({
    where: { testSectionId: null },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(questions.map(serializeQuestion));
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  if (!body.question || !body.answer) {
    return NextResponse.json({ error: 'Thiếu nội dung câu hỏi hoặc đáp án' }, { status: 400 });
  }

  const q = await prisma.question.create({
    data: {
      skill: body.skill ?? 'vocabulary',
      topic: body.topic || 'general',
      level: body.level ?? 'B1',
      type: body.type ?? 'multiple_choice',
      question: body.question,
      answer: JSON.stringify(body.answer),
      explanation: body.explanation ?? '',
    },
  });

  return NextResponse.json(serializeQuestion(q), { status: 201 });
}
