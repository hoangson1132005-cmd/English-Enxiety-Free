import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

// Thao tác hàng loạt trên ngân hàng: xóa, hoặc đổi cấp độ / chủ đề của nhiều câu cùng lúc.
export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const ids = Array.isArray(body.ids) ? (body.ids as string[]).filter((x) => typeof x === 'string') : [];
  if (!ids.length) return NextResponse.json({ error: 'Chưa chọn câu hỏi nào' }, { status: 400 });

  if (body.action === 'delete') {
    const res = await prisma.question.deleteMany({ where: { id: { in: ids }, inBank: true } });
    return NextResponse.json({ affected: res.count });
  }
  if (body.action === 'set_active') {
    const res = await prisma.question.updateMany({ where: { id: { in: ids }, inBank: true }, data: { isActive: !!body.active } });
    return NextResponse.json({ affected: res.count });
  }
  if (body.action === 'update') {
    const data: Record<string, string> = {};
    if (['A1', 'A2', 'B1', 'B2', 'C1'].includes(body.level)) data.level = body.level;
    if (typeof body.topic === 'string' && body.topic.trim()) data.topic = body.topic.trim();
    if (!Object.keys(data).length) return NextResponse.json({ error: 'Không có gì để cập nhật' }, { status: 400 });
    const res = await prisma.question.updateMany({ where: { id: { in: ids }, inBank: true }, data });
    return NextResponse.json({ affected: res.count });
  }
  return NextResponse.json({ error: 'Hành động không hợp lệ' }, { status: 400 });
}
