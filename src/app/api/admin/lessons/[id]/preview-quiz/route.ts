import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { previewLessonQuiz } from '@/lib/quiz';
import type { CEFRLevel } from '@/types';

// Xem trước bộ câu cuối bài mà một học viên mới sẽ nhận (?level=A2 để xem theo trình độ khác).
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const level = new URL(req.url).searchParams.get('level');
  const valid = ['A1', 'A2', 'B1', 'B2', 'C1'].includes(level ?? '') ? (level as CEFRLevel) : undefined;
  try {
    const p = await previewLessonQuiz(id, valid);
    return NextResponse.json({
      count: p.count,
      level: p.level,
      mode: p.mode,
      ai_needed: p.ai_needed,
      own_count: p.picked.filter((q) => q.lessonId === id).length,
      bank_count: p.picked.filter((q) => q.inBank).length,
      questions: p.picked.map((q, i) => ({
        order: i + 1,
        id: q.id,
        question: q.question,
        skill: q.skill,
        level: q.level,
        topic: q.topic,
        type: q.type,
        origin: q.lessonId === id ? 'lesson' : q.source,
        relevant: p.relevantIds.has(q.id),
        in_bank: q.inBank,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Không tìm thấy bài học' }, { status: 404 });
  }
}
