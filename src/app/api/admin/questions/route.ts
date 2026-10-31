import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { buildQuestionData } from '@/lib/questionInput';

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

  const built = buildQuestionData(await req.json(), { skill: 'vocabulary', topic: 'general' });
  if ('error' in built) return NextResponse.json({ error: built.error }, { status: 400 });

  const q = await prisma.question.create({ data: built.data });

  return NextResponse.json(serializeQuestion(q), { status: 201 });
}
