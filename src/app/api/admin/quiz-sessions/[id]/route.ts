import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { getPassScore } from '@/lib/quizSettings';

// Chi tiết một lượt kiểm tra: danh sách câu hỏi đã được bốc (kèm cấp độ, kỹ năng, chủ đề, nguồn) và kết quả từng câu.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const quiz = await prisma.quizSession.findUnique({ where: { id }, include: { user: { select: { fullName: true, email: true, currentLevel: true } } } });
  if (!quiz) return NextResponse.json({ error: 'Không tìm thấy lượt kiểm tra' }, { status: 404 });

  const ids = JSON.parse(quiz.questionIds) as string[];
  const rows = await prisma.question.findMany({ where: { id: { in: ids } } });
  const byId = new Map(rows.map((q) => [q.id, q]));
  const resultByQ = new Map(
    (quiz.results ? (JSON.parse(quiz.results) as { question_id: string; score: number }[]) : []).map((r) => [r.question_id, r.score])
  );

  const lesson = quiz.lessonId ? await prisma.lesson.findUnique({ where: { id: quiz.lessonId }, select: { id: true, title: true, topic: true, level: true } }) : null;

  return NextResponse.json({
    id: quiz.id,
    kind: quiz.kind,
    status: quiz.status,
    score: quiz.score,
    pass_score: await getPassScore(),
    created_at: quiz.createdAt.toISOString(),
    submitted_at: quiz.submittedAt?.toISOString() ?? null,
    user: { name: quiz.user.fullName, email: quiz.user.email, level: quiz.user.currentLevel },
    lesson,
    questions: ids.map((qid, idx) => {
      const q = byId.get(qid);
      return q
        ? {
            order: idx + 1,
            id: q.id,
            question: q.question,
            skill: q.skill,
            level: q.level,
            topic: q.topic,
            type: q.type,
            // nguồn câu hỏi: ngân hàng (nhập tay / import / AI tạo) hoặc câu gắn riêng với bài học
            origin: q.inBank ? q.source : q.lessonId ? 'lesson' : 'test',
            lesson_id: q.lessonId,
            in_bank: q.inBank,
            score: resultByQ.get(qid) ?? null,
          }
        : { order: idx + 1, id: qid, question: '(câu hỏi đã bị xóa)', skill: '', level: '', topic: '', type: '', origin: 'deleted', score: null };
    }),
  });
}
