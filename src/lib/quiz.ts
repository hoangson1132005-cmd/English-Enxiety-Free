import type { Question } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  assembleQuestions, tokenize, FINAL_EXAM_SIZE, LESSON_QUIZ_SIZE, LESSON_QUIZ_SIZE_FREE_TEXT, STAGE_QUIZ_SIZE, type AssembleOptions,
} from '@/lib/questionBank';
import type { CEFRLevel, SkillType } from '@/types';

type LearnerRow = { currentLevel: string; major: string | null; interests: string };

function learnerField(user: LearnerRow) {
  let interests: string[] = [];
  try {
    interests = JSON.parse(user.interests);
  } catch {
    // dữ liệu hỏng: bỏ qua
  }
  return [user.major, ...interests].filter(Boolean).join(', ') || 'tiếng Anh tổng quát';
}

function vocabTerms(vocabItemsJson: string) {
  try {
    return (JSON.parse(vocabItemsJson) as { term: string }[]).map((v) => v.term).join(' ');
  } catch {
    return '';
  }
}

async function weakSkillsOf(userId: string): Promise<SkillType[]> {
  const attempts = await prisma.lessonAttempt.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 40,
    include: { lesson: { select: { skill: true } } },
  });
  const by = new Map<string, number[]>();
  for (const a of attempts) by.set(a.lesson.skill, [...(by.get(a.lesson.skill) ?? []), a.score]);
  return [...by.entries()]
    .map(([skill, scores]) => ({ skill, avg: scores.reduce((x, y) => x + y, 0) / scores.length }))
    .filter((s) => s.avg < 70)
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 2)
    .map((s) => s.skill as SkillType);
}

async function createSession(
  userId: string,
  kind: 'lesson' | 'stage' | 'final',
  ref: { lessonId?: string; roadmapId?: string; phase?: number },
  questions: Question[]
) {
  return prisma.quizSession.create({
    data: { userId, kind, ...ref, questionIds: JSON.stringify(questions.map((q) => q.id)) },
  });
}

export async function loadSessionQuestions(session: { questionIds: string }) {
  const ids = JSON.parse(session.questionIds) as string[];
  const rows = await prisma.question.findMany({ where: { id: { in: ids } } });
  const byId = new Map(rows.map((q) => [q.id, q]));
  return ids.map((id) => byId.get(id)).filter((q): q is Question => !!q);
}

// Bài kiểm tra cuối bài: 5-10 câu bốc từ ngân hàng (+ câu gắn với bài), thiếu thì AI bổ sung.
// Dùng lại phiên đang mở để tải lại trang không đổi câu hỏi; làm lại sau khi nộp sẽ nhận bộ câu mới.
export async function getOrCreateLessonSession(userId: string, lessonId: string) {
  const open = await prisma.quizSession.findFirst({
    where: { userId, kind: 'lesson', lessonId, status: 'open' },
    orderBy: { createdAt: 'desc' },
  });
  if (open) {
    const questions = await loadSessionQuestions(open);
    if (questions.length) return { session: open, questions };
  }

  const [user, lesson] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.lesson.findUniqueOrThrow({ where: { id: lessonId } }),
  ]);
  const freeTextLesson = lesson.skill === 'writing' || lesson.skill === 'speaking';
  const level = ((lesson.level as CEFRLevel | null) ?? (user.currentLevel as CEFRLevel));
  let vocab = '';
  try {
    vocab = (JSON.parse(lesson.vocabItems) as { term: string }[]).map((v) => v.term).join(', ');
  } catch {
    // bỏ qua
  }

  const questions = await assembleQuestions({
    userId,
    count: freeTextLesson ? LESSON_QUIZ_SIZE_FREE_TEXT : LESSON_QUIZ_SIZE,
    level,
    lessonIds: [lessonId],
    topics: [lesson.topic],
    keywords: tokenize(lesson.title, lesson.topic, lesson.description, vocab),
    focusSkills: [lesson.skill as SkillType],
    maxFreeText: freeTextLesson ? 2 : 1,
    field: learnerField(user),
    topic: lesson.topic,
    scope: `Bài học "${lesson.title}" (${lesson.description}). Từ khóa: ${vocab || lesson.topic}. Nội dung: ${lesson.content.slice(0, 1200)}`,
    useAiSelection: false, // câu cuối bài cần nhanh: chỉ lọc theo điểm, AI chỉ bù khi thiếu
  } satisfies AssembleOptions);

  const session = await createSession(userId, 'lesson', { lessonId }, questions);
  return { session, questions };
}

// Cuối chặng (nhóm bài trong lộ trình của học viên): 15-20 câu theo nội dung các bài trong chặng.
export async function createStageSession(userId: string, roadmapId: string, phase: number) {
  const open = await prisma.quizSession.findFirst({
    where: { userId, kind: 'stage', roadmapId, phase, status: 'open' },
    orderBy: { createdAt: 'desc' },
  });
  if (open) {
    const questions = await loadSessionQuestions(open);
    if (questions.length) return { session: open, questions };
  }

  const [user, items] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.userRoadmapItem.findMany({ where: { roadmapId, phase }, include: { lesson: true } }),
  ]);
  const lessons = items.map((i) => i.lesson);
  const phaseInfo = await prisma.userRoadmap.findUniqueOrThrow({ where: { id: roadmapId }, select: { phases: true } });
  const phaseTitle = (JSON.parse(phaseInfo.phases) as { title: string }[])[phase - 1]?.title ?? `Chặng ${phase}`;

  const questions = await assembleQuestions({
    userId,
    count: STAGE_QUIZ_SIZE,
    level: user.currentLevel as CEFRLevel,
    lessonIds: lessons.map((l) => l.id),
    topics: [...new Set(lessons.map((l) => l.topic))],
    keywords: tokenize(...lessons.flatMap((l) => [l.title, l.topic, l.description, vocabTerms(l.vocabItems)])),
    focusSkills: [...new Set(lessons.map((l) => l.skill as SkillType))],
    weakSkills: await weakSkillsOf(userId),
    maxFreeText: 2,
    field: learnerField(user),
    topic: lessons[0]?.topic ?? 'general',
    scope: `Kiểm tra cuối chặng "${phaseTitle}", gồm các bài: ${lessons.map((l) => `${l.title} (${l.skill})`).join('; ')}`,
    useAiSelection: true,
  });

  const session = await createSession(userId, 'stage', { roadmapId, phase }, questions);
  return { session, questions };
}

// Kiểm tra cuối khóa (cuối lộ trình): ~30 câu bao quát toàn bộ nội dung đã học, cân bằng kỹ năng.
export async function createFinalSession(userId: string, roadmapId: string) {
  const open = await prisma.quizSession.findFirst({
    where: { userId, kind: 'final', roadmapId, status: 'open' },
    orderBy: { createdAt: 'desc' },
  });
  if (open) {
    const questions = await loadSessionQuestions(open);
    if (questions.length) return { session: open, questions };
  }

  const [user, items] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.userRoadmapItem.findMany({ where: { roadmapId, status: 'completed' }, include: { lesson: true } }),
  ]);
  const lessons = items.map((i) => i.lesson);

  const questions = await assembleQuestions({
    userId,
    count: FINAL_EXAM_SIZE,
    level: user.currentLevel as CEFRLevel,
    lessonIds: lessons.map((l) => l.id),
    topics: [...new Set(lessons.map((l) => l.topic))],
    keywords: tokenize(...lessons.flatMap((l) => [l.title, l.topic, l.description, vocabTerms(l.vocabItems)])),
    focusSkills: [...new Set(lessons.map((l) => l.skill as SkillType))],
    weakSkills: await weakSkillsOf(userId),
    skillMix: { vocabulary: 0.3, reading: 0.25, listening: 0.2, writing: 0.1, speaking: 0.05 },
    maxFreeText: 3,
    field: learnerField(user),
    topic: lessons[0]?.topic ?? 'general',
    scope: `Kiểm tra cuối khóa, bao quát các bài đã học: ${lessons.map((l) => `${l.title} (${l.skill})`).join('; ')}`,
    useAiSelection: true,
  });

  const session = await createSession(userId, 'final', { roadmapId }, questions);
  return { session, questions };
}
