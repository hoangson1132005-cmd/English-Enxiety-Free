import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  const [completedLessons, user] = await Promise.all([
    prisma.userLessonProgress.findMany({
      where: { userId, status: 'completed' },
      orderBy: { completedAt: 'desc' },
      take: 5,
      include: { lesson: { select: { title: true, skill: true, xpReward: true } } },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { streak: true, lastActiveAt: true } }),
  ]);

  const items = completedLessons
    .filter((p) => p.completedAt)
    .map((p) => ({
      id: p.id,
      type: 'lesson_completed' as const,
      title: `Hoàn thành bài học: ${p.lesson.title}`,
      description: p.score != null ? `Điểm: ${p.score}/100 · +${p.lesson.xpReward} XP` : `+${p.lesson.xpReward} XP`,
      created_at: p.completedAt!.toISOString(),
    }));

  const oneDayMs = 24 * 60 * 60 * 1000;
  const hasUnread = items.some((i) => Date.now() - new Date(i.created_at).getTime() < oneDayMs);

  if (user && user.streak > 0) {
    items.unshift({
      id: 'streak',
      type: 'lesson_completed',
      title: `Bạn đang giữ streak ${user.streak} ngày!`,
      description: 'Đừng bỏ lỡ hôm nay để giữ chuỗi học tập.',
      created_at: user.lastActiveAt.toISOString(),
    });
  }

  return NextResponse.json({ items, has_unread: hasUnread });
}
