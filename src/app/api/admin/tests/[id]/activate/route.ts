import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  await prisma.$transaction([
    prisma.test.updateMany({ where: { isActive: true }, data: { isActive: false } }),
    prisma.test.update({ where: { id }, data: { isActive: true } }),
  ]);

  return NextResponse.json({ success: true });
}
