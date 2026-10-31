import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const test = await prisma.test.findFirst({
    where: { isActive: true },
    include: { sections: { include: { questions: true } } },
  });
  if (!test) return NextResponse.json({ error: 'Chưa có đề test đang hoạt động' }, { status: 404 });

  return NextResponse.json({
    id: test.id,
    title: test.title,
    description: test.description,
    duration_minutes: test.durationMinutes,
    sections: test.sections
      .sort((a, b) => a.order - b.order)
      .map((s) => ({
        id: s.id,
        skill: s.skill,
        title: s.title,
        instructions: s.instructions,
        time_limit_minutes: s.timeLimitMinutes ?? undefined,
        questions: s.questions.map((q) => ({
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
        })),
      })),
  });
}
