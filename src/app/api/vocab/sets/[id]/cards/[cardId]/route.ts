import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, cardId } = await params;
  const set = await prisma.vocabSet.findUnique({ where: { id } });
  if (!set || set.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Bạn không có quyền sửa bộ từ này' }, { status: 403 });
  }

  await prisma.vocabCard.delete({ where: { id: cardId } });
  return NextResponse.json({ success: true });
}
