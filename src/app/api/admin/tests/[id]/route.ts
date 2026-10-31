import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { serializeTest } from '@/lib/serializers';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const test = await prisma.test.findUnique({ where: { id }, include: { sections: { include: { questions: true } } } });
  if (!test) return NextResponse.json({ error: 'Không tìm thấy đề test' }, { status: 404 });

  return NextResponse.json(serializeTest(test));
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const test = await prisma.test.update({
    where: { id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.duration_minutes !== undefined ? { durationMinutes: body.duration_minutes } : {}),
      ...(body.kind !== undefined ? { kind: body.kind === 'level_up' ? 'level_up' : 'placement' } : {}),
      ...(body.target_level !== undefined ? { targetLevel: body.kind === 'placement' ? null : body.target_level || null } : {}),
    },
    include: { sections: { include: { questions: true } } },
  });

  return NextResponse.json(serializeTest(test));
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const test = await prisma.test.findUnique({ where: { id } });
  if (test?.isActive) {
    return NextResponse.json({ error: 'Không thể xóa đề đang được dùng. Hãy kích hoạt đề khác trước.' }, { status: 400 });
  }

  await prisma.test.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
