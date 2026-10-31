import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { suggestStageToLearners } from '@/lib/roadmap';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const before = await prisma.stage.findUnique({ where: { id }, select: { isPublished: true } });
  const stage = await prisma.stage.update({
    where: { id },
    data: { isPublished: !!body.is_published },
  });

  // Vừa xuất bản: đề xuất các bài trong chặng cho học viên đang học (họ tự chọn thêm hoặc bỏ qua).
  let suggested = 0;
  if (stage.isPublished && !before?.isPublished) suggested = await suggestStageToLearners(id);

  return NextResponse.json({ id: stage.id, is_published: stage.isPublished, suggested_count: suggested });
}
