import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { recordActivity } from '@/lib/progress';
import { gradeFreeTextAnswer } from '@/lib/grading';
import { CEFR_TOEIC_MAP, CEFR_IELTS_MAP } from '@/types';
import type { CEFRLevel, SkillType } from '@/types';

const SKILL_LABELS: Record<SkillType, string> = {
  listening: 'Nghe',
  reading: 'Đọc',
  writing: 'Viết',
  speaking: 'Nói',
  vocabulary: 'Từ vựng',
};

function levelFromScore(score: number): CEFRLevel {
  if (score >= 85) return 'C1';
  if (score >= 70) return 'B2';
  if (score >= 50) return 'B1';
  if (score >= 30) return 'A2';
  return 'A1';
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const answers = (body.answers ?? []) as { question_id: string; answer: string | string[] }[];
  const timeSpentSeconds = body.time_spent_seconds ?? 0;

  const test = await prisma.test.findFirst({
    where: { isActive: true },
    include: { sections: { include: { questions: true } } },
  });
  if (!test) return NextResponse.json({ error: 'Chưa có đề test đang hoạt động' }, { status: 404 });

  const allQuestions = test.sections.flatMap((s) => s.questions);
  const answerByQuestion = new Map(answers.map((a) => [a.question_id, a.answer]));

  const perSkill: Record<string, { scoreSum: number; total: number }> = {};

  for (const q of allQuestions) {
    const given = answerByQuestion.get(q.id);
    perSkill[q.skill] ??= { scoreSum: 0, total: 0 };
    perSkill[q.skill].total += 1;

    let questionScore: number;
    if (q.type === 'essay' || q.type === 'speaking') {
      const givenText = typeof given === 'string' ? given : '';
      const correctAnswer = JSON.parse(q.answer) as string | string[];
      const modelAnswer = `${Array.isArray(correctAnswer) ? correctAnswer.join('; ') : correctAnswer}\n${q.explanation}`;
      const graded = await gradeFreeTextAnswer(q.question, modelAnswer, givenText);
      questionScore = graded.score;
    } else {
      const correctAnswer = JSON.parse(q.answer) as string | string[];
      const givenNorm = typeof given === 'string' ? given.trim().toLowerCase() : '';
      const isCorrect = Array.isArray(correctAnswer)
        ? correctAnswer.some((a) => a.trim().toLowerCase() === givenNorm)
        : correctAnswer.trim().toLowerCase() === givenNorm;
      questionScore = isCorrect ? 100 : 0;
    }
    perSkill[q.skill].scoreSum += questionScore;
  }

  const skillScores: Record<string, number> = {};
  for (const [skill, { scoreSum, total }] of Object.entries(perSkill)) {
    skillScores[skill] = total > 0 ? Math.round(scoreSum / total) : 0;
  }
  for (const s of ['listening', 'reading', 'writing', 'speaking', 'vocabulary']) {
    skillScores[s] ??= 0;
  }

  const totalScoreSum = Object.values(perSkill).reduce((sum, s) => sum + s.scoreSum, 0);
  const totalQuestions = Object.values(perSkill).reduce((sum, s) => sum + s.total, 0);
  const totalScore = totalQuestions > 0 ? Math.round(totalScoreSum / totalQuestions) : 0;
  const cefrLevel = levelFromScore(totalScore);

  const scoredSkills = Object.entries(skillScores).filter(([, score]) => score > 0 || totalQuestions > 0);
  const strengths = scoredSkills
    .filter(([, score]) => score >= 70)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([skill]) => SKILL_LABELS[skill as SkillType]);
  const weaknesses = scoredSkills
    .filter(([, score]) => score < 60)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([skill]) => SKILL_LABELS[skill as SkillType]);

  const aiFeedback = `Bạn đạt ${totalScore}/100 điểm, tương đương trình độ ${cefrLevel} theo khung CEFR.${
    strengths.length ? ` Điểm mạnh: ${strengths.join(', ')}.` : ''
  }${weaknesses.length ? ` Cần cải thiện: ${weaknesses.join(', ')}.` : ''} Lộ trình học cá nhân hóa đã được thiết kế dựa trên kết quả này.`;

  const result = await prisma.testResult.create({
    data: {
      userId: session.user.id,
      testId: test.id,
      scores: JSON.stringify(skillScores),
      totalScore,
      cefrLevel,
      toeicEquivalent: CEFR_TOEIC_MAP[cefrLevel],
      ieltsEquivalent: CEFR_IELTS_MAP[cefrLevel],
      strengths: JSON.stringify(strengths),
      weaknesses: JSON.stringify(weaknesses),
      aiFeedback,
      timeSpentSeconds,
      facultyGroup: (await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } })).facultyGroup,
    },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { placementCompleted: true, currentLevel: cefrLevel },
  });

  await recordActivity(session.user.id, {
    xpEarned: 100,
    minutesStudied: Math.round(timeSpentSeconds / 60),
  });

  return NextResponse.json({ result_id: result.id });
}
