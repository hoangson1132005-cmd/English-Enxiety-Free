import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const lesson = await prisma.lesson.findUnique({ where: { id }, include: { questions: true } });
  if (!lesson) return NextResponse.json({ error: 'Không tìm thấy bài học' }, { status: 404 });

  return NextResponse.json({
    id: lesson.id,
    stage_id: lesson.stageId,
    order: lesson.order,
    title: lesson.title,
    skill: lesson.skill,
    duration_minutes: lesson.durationMinutes,
    xp_reward: lesson.xpReward,
    description: lesson.description,
    topic: lesson.topic,
    content: lesson.content,
    questions: lesson.questions.map((q) => ({
      id: q.id,
      skill: q.skill,
      topic: q.topic,
      level: q.level,
      type: q.type,
      question: q.question,
      options: q.options ? JSON.parse(q.options) : undefined,
      passage: q.passage ?? undefined,
      audio_url: q.audioUrl ?? undefined,
      word_limit: undefined,
    })),
  });
}
