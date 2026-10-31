import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { suggestLessonsToLearners } from '@/lib/roadmap';

// Xuất bản / gỡ xuất bản nhiều bài cùng lúc. Bài vừa xuất bản sẽ được ĐỀ XUẤT cho học viên đang học
// (không tự chèn vào lộ trình của họ).
export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const ids = Array.isArray(body.ids) ? (body.ids as unknown[]).filter((x): x is string => typeof x === 'string') : [];
  if (!ids.length) return NextResponse.json({ error: 'Chưa chọn bài học nào' }, { status: 400 });
  const publish = !!body.publish;

  const newly = publish
    ? (await prisma.lesson.findMany({ where: { id: { in: ids }, isPublished: false }, select: { id: true } })).map((l) => l.id)
    : [];
  const res = await prisma.lesson.updateMany({ where: { id: { in: ids } }, data: { isPublished: publish } });
  const suggested = newly.length ? await suggestLessonsToLearners(newly) : 0;

  return NextResponse.json({ affected: res.count, suggested_count: suggested });
}
