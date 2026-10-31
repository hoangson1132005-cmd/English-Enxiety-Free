import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getLessonContext } from '@/lib/roadmap';
import { getLessonVocab } from '@/lib/lessonVocab';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const lesson = await prisma.lesson.findUnique({ where: { id }, include: { questions: true } });
  if (!lesson) return NextResponse.json({ error: 'Không tìm thấy bài học' }, { status: 404 });

  const ctx = await getLessonContext(session.user.id, id);
  if (!ctx.item) return NextResponse.json({ error: 'Bài học này không nằm trong lộ trình của bạn' }, { status: 403 });
  if (ctx.locked) return NextResponse.json({ error: 'Hãy hoàn thành bài học trước đó để mở bài này' }, { status: 403 });

  const [vocab, attempts] = await Promise.all([
    getLessonVocab(lesson),
    prisma.lessonAttempt.findMany({
      where: { userId: session.user.id, lessonId: id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

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
    vocab,
    item_status: ctx.item.status,
    best_score: ctx.item.bestScore,
    next_lesson_id: ctx.nextItem?.lessonId ?? null,
    attempts: attempts.map((a) => ({ id: a.id, score: a.score, passed: a.passed, created_at: a.createdAt.toISOString() })),
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
