import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { toAdminUserDTO } from '@/lib/serializers';

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const users = await prisma.user.findMany({ where: { role: 'student' }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(users.map(toAdminUserDTO));
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  if (!body.full_name || !body.student_id || !body.email) {
    return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) return NextResponse.json({ error: 'Email đã tồn tại' }, { status: 409 });

  const passwordHash = await bcrypt.hash('demo1234', 10);

  const user = await prisma.user.create({
    data: {
      email: body.email,
      passwordHash,
      fullName: body.full_name,
      studentId: body.student_id,
      facultyGroup: body.faculty_group ?? 'engineering',
      interests: JSON.stringify([]),
    },
  });

  return NextResponse.json(toAdminUserDTO(user), { status: 201 });
}
