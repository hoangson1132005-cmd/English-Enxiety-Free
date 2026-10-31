import { NextResponse } from 'next/server';
import type { Question } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { recordActivity } from '@/lib/progress';
import { gradeQuestion } from '@/lib/grading';
import { resolveTestForUser } from '@/lib/testAccess';
import { loadSessionQuestions } from '@/lib/quiz';
import { recordQuestionResults } from '@/lib/questionBank';
import { generateRoadmap, nextLevel } from '@/lib/roadmap';
import { getPassScore } from '@/lib/quizSettings';
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

// Nộp bài. Ba trường hợp:
//  - Test đầu vào: xếp trình độ + tạo lộ trình đầu tiên.
//  - Kiểm tra cuối khóa (đề admin hoặc bốc từ ngân hàng): đạt -> lên level, chưa đạt -> lộ trình cải thiện.
//  - Kiểm tra cuối chặng (bốc từ ngân hàng): chỉ ghi nhận kết quả, không đổi lộ trình.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;
  const PASS_SCORE = await getPassScore();

  const body = await req.json();
  const answers = (body.answers ?? []) as { question_id: string; answer: string | string[] }[];
  const timeSpentSeconds = body.time_spent_seconds ?? 0;

  let questions: Question[];
  let kind: 'placement' | 'level_up' | 'final' | 'stage';
  let testId: string | null = null;
  let quizId: string | null = null;
  let quizRoadmapId: string | null = null;

  if (body.session_id) {
    const quiz = await prisma.quizSession.findFirst({
      where: { id: String(body.session_id), userId, kind: { in: ['stage', 'final'] }, status: 'open' },
    });
    if (!quiz) return NextResponse.json({ error: 'Phiên kiểm tra không còn hiệu lực' }, { status: 409 });
    questions = await loadSessionQuestions(quiz);
    kind = quiz.kind as 'stage' | 'final';
    quizId = quiz.id;
    quizRoadmapId = quiz.roadmapId;
  } else {
    const test = await resolveTestForUser(userId, body.test_id ?? null);
    if (!test) return NextResponse.json({ error: 'Chưa có đề test đang hoạt động' }, { status: 404 });
    questions = test.sections.flatMap((s) => s.questions);
    kind = test.kind as 'placement' | 'level_up';
    testId = test.id;
  }

  const isExam = kind === 'level_up' || kind === 'final';
  const answerByQuestion = new Map(answers.map((a) => [a.question_id, a.answer]));

  const perSkill: Record<string, { scoreSum: number; total: number }> = {};
  const perQuestion: { questionId: string; score: number }[] = [];
  for (const q of questions) {
    perSkill[q.skill] ??= { scoreSum: 0, total: 0 };
    perSkill[q.skill].total += 1;
    const graded = await gradeQuestion(q, answerByQuestion.get(q.id));
    perSkill[q.skill].scoreSum += graded.score;
    perQuestion.push({ questionId: q.id, score: graded.score });
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
    : kind === 'stage' ? (user.currentLevel as CEFRLevel) : levelFromScore(totalScore);

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
      ? `Chúc mừng! Bạn đạt ${totalScore}/100 trong bài kiểm tra cuối khóa${cefrLevel !== user.currentLevel ? ` và được nâng lên trình độ ${cefrLevel}` : ''}.${
          strengths.length ? ` Điểm mạnh: ${strengths.join(', ')}.` : ''
        } Lộ trình mới đã được tạo cho trình độ này.`
      : `Bạn đạt ${totalScore}/100, chưa đủ ${PASS_SCORE} điểm để lên trình độ tiếp theo.${
          weaknesses.length ? ` Cần cải thiện: ${weaknesses.join(', ')}.` : ''
        } Hệ thống đã tạo lộ trình cải thiện tập trung vào phần còn yếu.`
    : kind === 'stage'
      ? `Bạn đạt ${totalScore}/100 trong bài kiểm tra cuối chặng.${strengths.length ? ` Điểm mạnh: ${strengths.join(', ')}.` : ''}${
          weaknesses.length ? ` Nên ôn lại: ${weaknesses.join(', ')}.` : ''
        } Hãy tiếp tục chặng kế tiếp trong lộ trình.`
      : `Bạn đạt ${totalScore}/100 điểm, tương đương trình độ ${cefrLevel} theo khung CEFR.${
          strengths.length ? ` Điểm mạnh: ${strengths.join(', ')}.` : ''
        }${weaknesses.length ? ` Cần cải thiện: ${weaknesses.join(', ')}.` : ''} Lộ trình học cá nhân hóa đã được thiết kế dựa trên kết quả này.`;

  const activeRoadmap = isExam
    ? await prisma.userRoadmap.findFirst({ where: { userId, status: 'active' } })
    : kind === 'stage' && quizRoadmapId
      ? await prisma.userRoadmap.findUnique({ where: { id: quizRoadmapId } })
      : null;

  const result = await prisma.testResult.create({
    data: {
      userId,
      testId,
      sessionId: quizId,
      kind,
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

  if (quizId) {
    await prisma.quizSession.update({
      where: { id: quizId },
      data: {
        status: 'submitted',
        submittedAt: new Date(),
        score: totalScore,
        results: JSON.stringify(perQuestion.map((r) => ({ question_id: r.questionId, score: r.score }))),
      },
    });
  }
  await recordQuestionResults(userId, perQuestion);

  if (kind !== 'stage') {
    await prisma.user.update({
      where: { id: userId },
      data: isExam ? { currentLevel: cefrLevel } : { placementCompleted: true, currentLevel: cefrLevel },
    });
  }

  if (isExam && activeRoadmap) {
    await prisma.userRoadmap.update({
      where: { id: activeRoadmap.id },
      data: { status: 'completed', completedAt: new Date() },
    });
  }

  await recordActivity(userId, {
    xpEarned: isExam ? (passedExam ? 200 : 50) : kind === 'stage' ? 60 : 100,
    minutesStudied: Math.round(timeSpentSeconds / 60),
  });

  // Tạo lộ trình kế tiếp: lần đầu / lên level / cải thiện. Lỗi tạo không làm mất kết quả bài thi
  // (lộ trình sẽ được tạo lại khi học viên mở trang Lộ trình).
  if (kind !== 'stage') {
    try {
      await generateRoadmap(userId, { kind: isExam ? (passedExam ? 'level_up' : 'improve') : 'initial' });
    } catch (err) {
      console.error('Roadmap generation after test failed:', err);
    }
  }

  return NextResponse.json({ result_id: result.id });
}
