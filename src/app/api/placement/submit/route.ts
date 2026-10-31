import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { recordActivity } from '@/lib/progress';
import { gradeFreeTextAnswer } from '@/lib/grading';
import { resolveTestForUser } from '@/lib/testAccess';
import { generateRoadmap, nextLevel, PASS_SCORE } from '@/lib/roadmap';
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

// Nộp bài test đầu vào (xếp trình độ + tạo lộ trình đầu tiên) hoặc bài kiểm tra tổng kết
// (đạt -> lên level, chưa đạt -> lộ trình cải thiện).
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json();
  const answers = (body.answers ?? []) as { question_id: string; answer: string | string[] }[];
  const timeSpentSeconds = body.time_spent_seconds ?? 0;

  const test = await resolveTestForUser(userId, body.test_id ?? null);
  if (!test) return NextResponse.json({ error: 'Chưa có đề test đang hoạt động' }, { status: 404 });
  const isExam = test.kind === 'level_up';

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

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const passedExam = isExam && totalScore >= PASS_SCORE;
  const cefrLevel: CEFRLevel = isExam
    ? passedExam ? nextLevel(user.currentLevel as CEFRLevel) : (user.currentLevel as CEFRLevel)
    : levelFromScore(totalScore);

  // Chỉ xét kỹ năng thực sự có câu hỏi trong đề.
  const scoredSkills = Object.entries(skillScores).filter(([skill]) => perSkill[skill]);
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

  const aiFeedback = isExam
    ? passedExam
      ? `Chúc mừng! Bạn đạt ${totalScore}/100 trong bài kiểm tra tổng kết${cefrLevel !== user.currentLevel ? ` và được nâng lên trình độ ${cefrLevel}` : ''}.${
          strengths.length ? ` Điểm mạnh: ${strengths.join(', ')}.` : ''
        } Lộ trình mới đã được tạo cho trình độ này.`
      : `Bạn đạt ${totalScore}/100, chưa đủ ${PASS_SCORE} điểm để lên trình độ tiếp theo.${
          weaknesses.length ? ` Cần cải thiện: ${weaknesses.join(', ')}.` : ''
        } Hệ thống đã tạo lộ trình cải thiện tập trung vào phần còn yếu.`
    : `Bạn đạt ${totalScore}/100 điểm, tương đương trình độ ${cefrLevel} theo khung CEFR.${
        strengths.length ? ` Điểm mạnh: ${strengths.join(', ')}.` : ''
      }${weaknesses.length ? ` Cần cải thiện: ${weaknesses.join(', ')}.` : ''} Lộ trình học cá nhân hóa đã được thiết kế dựa trên kết quả này.`;

  const activeRoadmap = isExam ? await prisma.userRoadmap.findFirst({ where: { userId, status: 'active' } }) : null;

  const result = await prisma.testResult.create({
    data: {
      userId,
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
      facultyGroup: user.facultyGroup,
      outcome: isExam ? (passedExam ? 'level_up' : 'improve') : null,
      roadmapId: activeRoadmap?.id ?? null,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: isExam ? { currentLevel: cefrLevel } : { placementCompleted: true, currentLevel: cefrLevel },
  });

  if (activeRoadmap) {
    await prisma.userRoadmap.update({
      where: { id: activeRoadmap.id },
      data: { status: 'completed', completedAt: new Date() },
    });
  }

  await recordActivity(userId, {
    xpEarned: isExam ? (passedExam ? 200 : 50) : 100,
    minutesStudied: Math.round(timeSpentSeconds / 60),
  });

  // Tạo lộ trình kế tiếp: lần đầu / lên level / cải thiện. Lỗi tạo không làm mất kết quả bài thi
  // (lộ trình sẽ được tạo lại khi học viên mở trang Lộ trình).
  try {
    await generateRoadmap(userId, { kind: isExam ? (passedExam ? 'level_up' : 'improve') : 'initial' });
  } catch (err) {
    console.error('Roadmap generation after test failed:', err);
  }

  return NextResponse.json({ result_id: result.id });
}
