import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { recordActivity } from '@/lib/progress';
import { gradeFreeTextAnswer } from '@/lib/grading';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const lessonId = body.lesson_id as string;
  const answers = (body.answers ?? []) as { question_id: string; answer: string | string[] }[];
  const timeSpentSeconds = body.time_spent_seconds ?? 0;

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { questions: true } });
  if (!lesson) return NextResponse.json({ error: 'Không tìm thấy bài học' }, { status: 404 });

  const answerByQuestion = new Map(answers.map((a) => [a.question_id, a.answer]));
  let scoreSum = 0;
  const results: { question_id: string; score: number; feedback: string }[] = [];

  for (const q of lesson.questions) {
    const given = answerByQuestion.get(q.id);
    let questionScore: number;
    let feedback = q.explanation;

    if (q.type === 'essay' || q.type === 'speaking') {
      const givenText = typeof given === 'string' ? given : '';
      const correctAnswer = JSON.parse(q.answer) as string | string[];
      const modelAnswer = `${Array.isArray(correctAnswer) ? correctAnswer.join('; ') : correctAnswer}\n${q.explanation}`;
      const graded = await gradeFreeTextAnswer(q.question, modelAnswer, givenText);
      questionScore = graded.score;
      feedback = graded.feedback;
    } else {
      const correctAnswer = JSON.parse(q.answer) as string | string[];
      const givenNorm = typeof given === 'string' ? given.trim().toLowerCase() : '';
      const isCorrect = Array.isArray(correctAnswer)
        ? correctAnswer.some((a) => a.trim().toLowerCase() === givenNorm)
        : correctAnswer.trim().toLowerCase() === givenNorm;
      questionScore = isCorrect ? 100 : 0;
    }
    scoreSum += questionScore;
    results.push({ question_id: q.id, score: questionScore, feedback });
  }

  const score = lesson.questions.length > 0 ? Math.round(scoreSum / lesson.questions.length) : 100;

  await prisma.userLessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId: lesson.id } },
    update: { status: 'completed', score, completedAt: new Date() },
    create: {
      userId: session.user.id,
      lessonId: lesson.id,
      status: 'completed',
      score,
      completedAt: new Date(),
    },
  });

  const { new_total_xp, new_streak } = await recordActivity(session.user.id, {
    xpEarned: lesson.xpReward,
    minutesStudied: Math.round(timeSpentSeconds / 60),
    lessonCompleted: true,
    skill: lesson.skill,
    score,
  });

  return NextResponse.json({ xp_earned: lesson.xpReward, new_total_xp, new_streak, score, results });
}
