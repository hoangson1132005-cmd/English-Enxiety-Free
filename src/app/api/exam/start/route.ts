import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { findAdminExam } from '@/lib/exam';
import { isRoadmapDone } from '@/lib/roadmap';
import { createFinalSession } from '@/lib/quiz';

// Mở bài kiểm tra cuối khóa khi học viên đã hoàn thành toàn bộ bài trong lộ trình.
// Trả về test_id (đề do admin chỉ định cho level này) hoặc session_id (bộ ~30 câu bốc từ ngân hàng).
export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const roadmap = await prisma.userRoadmap.findFirst({
    where: { userId: session.user.id, status: 'active' },
    include: { items: true },
  });
  if (!roadmap) return NextResponse.json({ error: 'Chưa có lộ trình' }, { status: 404 });
  if (!isRoadmapDone(roadmap.items)) {
    return NextResponse.json({ error: 'Hãy hoàn thành tất cả bài học trong lộ trình trước khi làm bài tổng kết' }, { status: 403 });
  }

  try {
    const adminExam = await findAdminExam(session.user.id);
    if (adminExam) return NextResponse.json({ test_id: adminExam.id });

    const { session: quiz, questions } = await createFinalSession(session.user.id, roadmap.id);
    if (!questions.length) {
      return NextResponse.json({ error: 'Ngân hàng câu hỏi chưa có câu phù hợp. Vui lòng liên hệ quản trị viên.' }, { status: 503 });
    }
    return NextResponse.json({ session_id: quiz.id });
  } catch (err) {
    console.error('Create final exam failed:', err);
    return NextResponse.json({ error: 'Không tạo được bài kiểm tra. Vui lòng thử lại.' }, { status: 500 });
  }
}
