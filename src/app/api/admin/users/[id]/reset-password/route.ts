import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

// Admin đặt lại mật khẩu cho người dùng (khi chưa có email, hoặc người dùng không tự khôi phục được).
// Trả về mật khẩu tạm ngẫu nhiên, chỉ hiển thị một lần.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true } });
  if (!user) return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });

  const tempPassword = crypto.randomBytes(6).toString('base64url');
  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(tempPassword, 10) } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: id } }),
  ]);
  return NextResponse.json({ email: user.email, temp_password: tempPassword });
}
