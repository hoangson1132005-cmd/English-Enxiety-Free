import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail, MailNotConfiguredError } from '@/lib/mail';

const schema = z.object({ email: z.string().email() });
const TOKEN_TTL_MS = 30 * 60 * 1000;

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  // Luôn trả về thành công để không lộ email nào đã đăng ký.
  if (user && user.status === 'active') {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
    });

    const baseUrl = process.env.APP_URL || new URL(req.url).origin;
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    try {
      await sendPasswordResetEmail(user.email, user.fullName, resetUrl);
    } catch (err) {
      // Chưa cấu hình gửi email: khi phát triển (không phải production) in liên kết ra console máy chủ và trả về
      // để thử nghiệm; production thì báo lỗi rõ ràng để quản trị viên cấu hình SMTP.
      if (err instanceof MailNotConfiguredError && process.env.NODE_ENV !== 'production') {
        console.warn(`[DEV] Chưa cấu hình SMTP. Liên kết đặt lại mật khẩu cho ${user.email}: ${resetUrl}`);
        return NextResponse.json({ success: true, dev_reset_url: resetUrl });
      }
      console.error('Gửi email đặt lại mật khẩu thất bại:', err);
      return NextResponse.json({ error: 'Không thể gửi email lúc này' }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
