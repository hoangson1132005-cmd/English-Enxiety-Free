import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { recordActivity } from '@/lib/progress';
import { gradeQuestion, buildReviewSummary } from '@/lib/grading';
import { getLessonContext, isRoadmapDone } from '@/lib/roadmap';
import { getPassScore } from '@/lib/quizSettings';
import { getLessonVocab, saveWordsForUser } from '@/lib/lessonVocab';
import { loadSessionQuestions } from '@/lib/quiz';
import { recordQuestionResults } from '@/lib/questionBank';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;
  const PASS_SCORE = await getPassScore();

  const body = await req.json();
  const lessonId = body.lesson_id as string;
  const answers = (body.answers ?? []) as { question_id: string; answer: string | string[] }[];
  const timeSpentSeconds = Number(body.time_spent_seconds) || 0;

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ error: 'Không tìm thấy bài học' }, { status: 404 });

  const ctx = await getLessonContext(userId, lessonId);
  if (!ctx.item) return NextResponse.json({ error: 'Bài học này không nằm trong lộ trình của bạn' }, { status: 403 });
  if (ctx.locked) return NextResponse.json({ error: 'Bài học chưa được mở' }, { status: 403 });
  const item = ctx.item;

  // Chỉ chấm đúng bộ câu của phiên kiểm tra đang mở (học viên không tự chọn được câu để chấm)
  const quiz = await prisma.quizSession.findFirst({
    where: { id: String(body.session_id ?? ''), userId, kind: 'lesson', lessonId, status: 'open' },
  });
  if (!quiz) return NextResponse.json({ error: 'Phiên làm bài không còn hiệu lực. Hãy tải lại bài học.' }, { status: 409 });
  const questions = await loadSessionQuestions(quiz);

  const answerByQuestion = new Map(answers.map((a) => [a.question_id, a.answer]));
  let scoreSum = 0;
  const results: { question_id: string; score: number; feedback: string; correct_answer: string; given: string }[] = [];
  const mistakes: { question: string; given: string; correct: string; explanation: string }[] = [];

  for (const q of questions) {
    const graded = await gradeQuestion(q, answerByQuestion.get(q.id));
    scoreSum += graded.score;
    results.push({ question_id: q.id, score: graded.score, feedback: graded.feedback, correct_answer: graded.correctText, given: graded.givenText });
    if (graded.score < PASS_SCORE) {
      mistakes.push({ question: q.question, given: graded.givenText, correct: graded.correctText, explanation: graded.feedback });
    }
  }

  const score = questions.length > 0 ? Math.round(scoreSum / questions.length) : 100;
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
  await prisma.quizSession.update({
    where: { id: quiz.id },
    data: {
      status: 'submitted',
      submittedAt: new Date(),
      score,
      results: JSON.stringify(results.map((r) => ({ question_id: r.question_id, score: r.score }))),
    },
  });
  await recordQuestionResults(userId, results.map((r) => ({ questionId: r.question_id, score: r.score })));

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
