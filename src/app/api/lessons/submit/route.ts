import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { recordActivity } from '@/lib/progress';
import { gradeFreeTextAnswer, buildReviewSummary } from '@/lib/grading';
import { getLessonContext, isRoadmapDone, PASS_SCORE } from '@/lib/roadmap';
import { getLessonVocab, saveWordsForUser } from '@/lib/lessonVocab';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json();
  const lessonId = body.lesson_id as string;
  const answers = (body.answers ?? []) as { question_id: string; answer: string | string[] }[];
  const timeSpentSeconds = Number(body.time_spent_seconds) || 0;

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { questions: true } });
  if (!lesson) return NextResponse.json({ error: 'Không tìm thấy bài học' }, { status: 404 });

  const ctx = await getLessonContext(userId, lessonId);
  if (!ctx.item) return NextResponse.json({ error: 'Bài học này không nằm trong lộ trình của bạn' }, { status: 403 });
  if (ctx.locked) return NextResponse.json({ error: 'Bài học chưa được mở' }, { status: 403 });
  const item = ctx.item;

  const answerByQuestion = new Map(answers.map((a) => [a.question_id, a.answer]));
  let scoreSum = 0;
  const results: { question_id: string; score: number; feedback: string; correct_answer: string; given: string }[] = [];
  const mistakes: { question: string; given: string; correct: string; explanation: string }[] = [];

  for (const q of lesson.questions) {
    const given = answerByQuestion.get(q.id);
    const givenText = Array.isArray(given) ? given.join('; ') : (given ?? '');
    const correctAnswer = JSON.parse(q.answer) as string | string[];
    const correctText = Array.isArray(correctAnswer) ? correctAnswer.join(' / ') : correctAnswer;

    let questionScore: number;
    let feedback = q.explanation;

    if (q.type === 'essay' || q.type === 'speaking') {
      const graded = await gradeFreeTextAnswer(q.question, `${correctText}\n${q.explanation}`, givenText);
      questionScore = graded.score;
      feedback = graded.feedback;
    } else {
      const givenNorm = givenText.trim().toLowerCase();
      const isCorrect = Array.isArray(correctAnswer)
        ? correctAnswer.some((a) => a.trim().toLowerCase() === givenNorm)
        : correctAnswer.trim().toLowerCase() === givenNorm;
      questionScore = isCorrect ? 100 : 0;
    }

    scoreSum += questionScore;
    results.push({ question_id: q.id, score: questionScore, feedback, correct_answer: correctText, given: givenText });
    if (questionScore < PASS_SCORE) {
      mistakes.push({ question: q.question, given: givenText, correct: correctText, explanation: feedback });
    }
  }

  const score = lesson.questions.length > 0 ? Math.round(scoreSum / lesson.questions.length) : 100;
  const passed = score >= PASS_SCORE;
  const previousBest = item.bestScore;
  const firstTimePass = passed && item.status !== 'completed';

  const reviewSummary = await buildReviewSummary(lesson.title, mistakes);

  const attemptCount = await prisma.lessonAttempt.count({ where: { userId, lessonId } });
  await prisma.lessonAttempt.create({
    data: {
      userId, lessonId, itemId: item.id, score, passed,
      answers: JSON.stringify(Object.fromEntries(answers.map((a) => [a.question_id, a.answer]))),
      results: JSON.stringify(results),
      reviewSummary,
      timeSpentSeconds,
    },
  });

  await prisma.userRoadmapItem.update({
    where: { id: item.id },
    data: {
      bestScore: Math.max(previousBest ?? 0, score),
      status: item.status === 'completed' ? 'completed' : passed ? 'completed' : 'in_progress',
      ...(firstTimePass ? { completedAt: new Date() } : {}),
    },
  });

  if (firstTimePass) {
    await prisma.userLessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { status: 'completed', score, completedAt: new Date() },
      create: { userId, lessonId, status: 'completed', score, completedAt: new Date() },
    });
  }

  // Từ vựng gặp trong bài đạt -> tự lưu vào kho từ cá nhân (giữ qua mọi lộ trình).
  let wordsSaved = 0;
  if (passed) wordsSaved = await saveWordsForUser(userId, await getLessonVocab(lesson));

  // XP chỉ tính lần đầu qua bài; làm lại chỉ cải thiện điểm.
  const { new_total_xp, new_streak } = await recordActivity(userId, {
    xpEarned: firstTimePass ? lesson.xpReward : 0,
    minutesStudied: Math.round(timeSpentSeconds / 60),
    lessonCompleted: firstTimePass,
    skill: lesson.skill,
    score,
  });

  const refreshed = await prisma.userRoadmapItem.findMany({ where: { roadmapId: item.roadmapId } });
  const after = await getLessonContext(userId, lessonId);

  return NextResponse.json({
    score,
    passed,
    pass_score: PASS_SCORE,
    xp_earned: firstTimePass ? lesson.xpReward : 0,
    new_total_xp,
    new_streak,
    results,
    review_summary: reviewSummary,
    attempt_no: attemptCount + 1,
    previous_best: previousBest,
    words_saved: wordsSaved,
    next_lesson_id: after.nextItem?.lessonId ?? null,
    roadmap_done: isRoadmapDone(refreshed),
  });
}
