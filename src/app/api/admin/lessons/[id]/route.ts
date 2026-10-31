import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

function serializeLessonDetail(lesson: {
  id: string; stageId: string; order: number; title: string; skill: string;
  durationMinutes: number; xpReward: number; description: string; topic: string; content: string; level: string | null; vocabItems: string;
  stage: { title: string };
  questions: { id: string; question: string; skill: string; topic: string; level: string; type: string; options: string | null; answer: string; explanation: string; passage: string | null; audioUrl: string | null }[];
}) {
  return {
    id: lesson.id,
    stage_id: lesson.stageId,
    stage_title: lesson.stage.title,
    order: lesson.order,
    title: lesson.title,
    skill: lesson.skill,
    duration_minutes: lesson.durationMinutes,
    xp_reward: lesson.xpReward,
    description: lesson.description,
    topic: lesson.topic,
    content: lesson.content,
    level: lesson.level,
    vocab_items: JSON.parse(lesson.vocabItems || '[]'),
    questions: lesson.questions.map((q) => ({
      id: q.id,
      question: q.question,
      skill: q.skill,
      topic: q.topic,
      level: q.level,
      type: q.type,
      options: q.options ? JSON.parse(q.options) : undefined,
      answer: JSON.parse(q.answer),
      explanation: q.explanation,
      passage: q.passage ?? undefined,
      audio_url: q.audioUrl ?? undefined,
    })),
  };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const lesson = await prisma.lesson.findUnique({ where: { id }, include: { stage: true, questions: true } });
  if (!lesson) return NextResponse.json({ error: 'Không tìm thấy bài học' }, { status: 404 });

  return NextResponse.json(serializeLessonDetail(lesson));
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const lesson = await prisma.lesson.update({
    where: { id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.skill !== undefined ? { skill: body.skill } : {}),
      ...(body.duration_minutes !== undefined ? { durationMinutes: body.duration_minutes } : {}),
      ...(body.xp_reward !== undefined ? { xpReward: body.xp_reward } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.topic !== undefined ? { topic: body.topic } : {}),
      ...(body.content !== undefined ? { content: body.content } : {}),
      ...(body.level !== undefined ? { level: body.level || null } : {}),
      ...(body.vocab_items !== undefined ? { vocabItems: JSON.stringify(body.vocab_items) } : {}),
    },
    include: { stage: true, questions: true },
  });

  return NextResponse.json(serializeLessonDetail(lesson));
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  await prisma.lesson.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
