import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resolveTestForUser } from '@/lib/testAccess';
import { loadSessionQuestions } from '@/lib/quiz';
import { toLearnerQuestion } from '@/lib/questionBank';
import { getPassScore } from '@/lib/quizSettings';

const SKILL_TITLES: Record<string, string> = {
  vocabulary: 'Từ vựng', reading: 'Đọc hiểu', listening: 'Nghe hiểu', writing: 'Viết', speaking: 'Nói',
};
const SKILL_ORDER = ['vocabulary', 'reading', 'listening', 'writing', 'speaking'];
const MINUTES_PER_QUESTION = 1.3;

// Trả về đề cho học viên làm: đề đầu vào, đề do admin chỉ định (?test_id=), hoặc bộ câu bốc từ ngân hàng cho bài kiểm tra
// cuối chặng/cuối khóa (?session_id=). Không gửi đáp án xuống trình duyệt.
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const params = new URL(req.url).searchParams;
  const sessionId = params.get('session_id');

  if (sessionId) {
    const quiz = await prisma.quizSession.findFirst({
      where: { id: sessionId, userId: session.user.id, kind: { in: ['stage', 'final'] }, status: 'open' },
    });
    if (!quiz) return NextResponse.json({ error: 'Phiên kiểm tra không còn hiệu lực' }, { status: 404 });
    const questions = await loadSessionQuestions(quiz);

    const bySkill = new Map<string, typeof questions>();
    for (const q of questions) bySkill.set(q.skill, [...(bySkill.get(q.skill) ?? []), q]);
    const sections = SKILL_ORDER.filter((s) => bySkill.has(s)).map((skill) => ({
      id: `${quiz.id}_${skill}`,
      skill,
      title: SKILL_TITLES[skill],
      instructions: 'Trả lời các câu hỏi dựa trên những gì bạn đã học.',
      questions: bySkill.get(skill)!.map(toLearnerQuestion),
    }));

    return NextResponse.json({
      id: quiz.id,
      kind: quiz.kind === 'final' ? 'level_up' : 'stage',
      title: quiz.kind === 'final' ? 'Kiểm tra cuối khóa' : 'Kiểm tra cuối chặng',
      description:
        quiz.kind === 'final'
          ? `Bài kiểm tra tổng kết toàn bộ nội dung đã học. Đạt từ ${await getPassScore()} điểm để lên trình độ tiếp theo.`
          : 'Bài kiểm tra các bài học trong chặng vừa hoàn thành.',
      duration_minutes: Math.max(10, Math.round(questions.length * MINUTES_PER_QUESTION)),
      sections,
    });
  }

  const test = await resolveTestForUser(session.user.id, params.get('test_id'));
  if (!test) return NextResponse.json({ error: 'Chưa có đề test đang hoạt động' }, { status: 404 });

  return NextResponse.json({
    id: test.id,
    kind: test.kind,
    title: test.title,
    description: test.description,
    duration_minutes: test.durationMinutes,
    sections: [...test.sections]
      .sort((a, b) => a.order - b.order)
      .map((s) => ({
        id: s.id,
        skill: s.skill,
        title: s.title,
        instructions: s.instructions,
        time_limit_minutes: s.timeLimitMinutes ?? undefined,
        questions: s.questions.map(toLearnerQuestion),
      })),
  });
}
