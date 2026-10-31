import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getOrCreateExam } from '@/lib/exam';
import { isRoadmapDone } from '@/lib/roadmap';

// Mở bài kiểm tra tổng kết khi học viên đã hoàn thành toàn bộ bài trong lộ trình.
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
    const test = await getOrCreateExam(session.user.id, roadmap.id);
    return NextResponse.json({ test_id: test.id });
  } catch (err) {
    console.error('Create exam failed:', err);
    return NextResponse.json({ error: 'Không tạo được bài kiểm tra. Vui lòng liên hệ quản trị viên.' }, { status: 500 });
  }
}
