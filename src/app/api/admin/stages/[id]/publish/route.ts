import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const stage = await prisma.stage.update({
    where: { id },
    data: { isPublished: !!body.is_published },
  });

  return NextResponse.json({ id: stage.id, is_published: stage.isPublished });
}
