import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; qid: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { qid } = await params;
  await prisma.question.delete({ where: { id: qid } });
  return NextResponse.json({ success: true });
}
