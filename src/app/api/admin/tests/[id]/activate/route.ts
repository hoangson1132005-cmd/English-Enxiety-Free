import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

// Mỗi loại đề có một đề đang dùng: 1 đề đầu vào, và 1 đề tổng kết cho mỗi level.
export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const test = await prisma.test.findUnique({ where: { id } });
  if (!test) return NextResponse.json({ error: 'Không tìm thấy đề test' }, { status: 404 });
  if (test.kind === 'level_up' && !test.targetLevel) {
    return NextResponse.json({ error: 'Đề tổng kết cần chọn level áp dụng trước khi kích hoạt' }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.test.updateMany({
      where: { isActive: true, kind: test.kind, ...(test.kind === 'level_up' ? { targetLevel: test.targetLevel } : {}) },
      data: { isActive: false },
    }),
    prisma.test.update({ where: { id }, data: { isActive: true } }),
  ]);

  return NextResponse.json({ success: true });
}
