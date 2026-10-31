import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { toAdminUserDTO } from '@/lib/serializers';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const data: Prisma.UserUpdateInput = {};

  if (body.status !== undefined) data.status = body.status;
  if (body.faculty_group !== undefined) data.facultyGroup = body.faculty_group;
  if (body.major !== undefined) data.major = body.major;
  if (body.study_year !== undefined) data.studyYear = body.study_year;
  if (body.interests !== undefined) data.interests = JSON.stringify(body.interests);
  if (body.current_level !== undefined) data.currentLevel = body.current_level;

  const user = await prisma.user.update({ where: { id }, data });
  return NextResponse.json(toAdminUserDTO(user));
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
