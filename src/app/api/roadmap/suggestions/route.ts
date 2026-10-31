import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Học viên chấp nhận (thêm vào lộ trình) hoặc bỏ qua một bài học được đề xuất.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { item_id, action } = await req.json();
  if (!['accept', 'dismiss'].includes(action)) {
    return NextResponse.json({ error: 'Hành động không hợp lệ' }, { status: 400 });
  }

  const item = await prisma.userRoadmapItem.findFirst({
    where: { id: item_id, status: 'suggested', roadmap: { userId: session.user.id, status: 'active' } },
  });
  if (!item) return NextResponse.json({ error: 'Không tìm thấy đề xuất' }, { status: 404 });

  if (action === 'dismiss') {
    await prisma.userRoadmapItem.update({ where: { id: item.id }, data: { status: 'dismissed' } });
  } else {
    // Xếp bài được chấp nhận vào cuối lộ trình chính.
    const last = await prisma.userRoadmapItem.aggregate({
      where: { roadmapId: item.roadmapId, status: { notIn: ['suggested', 'dismissed'] } },
      _max: { order: true },
    });
    await prisma.userRoadmapItem.update({
      where: { id: item.id },
      data: { status: 'pending', source: 'suggested', order: (last._max.order ?? 0) + 1 },
    });
  }
  return NextResponse.json({ success: true });
}
