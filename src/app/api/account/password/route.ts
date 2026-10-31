import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isThrottled, recordFailure, clearFailures } from '@/lib/loginThrottle';

// Người dùng đang đăng nhập tự đổi mật khẩu (cần nhập đúng mật khẩu hiện tại).
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json().catch(() => ({}));
  const current = String(body.current_password ?? '');
  const next = String(body.new_password ?? '');
  if (next.length < 8) return NextResponse.json({ error: 'Mật khẩu mới phải từ 8 ký tự trở lên' }, { status: 400 });
  if (next === current) return NextResponse.json({ error: 'Mật khẩu mới phải khác mật khẩu hiện tại' }, { status: 400 });

  const key = `change-password:${userId}`;
  if (isThrottled(key, 'self')) {
    return NextResponse.json({ error: 'Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.' }, { status: 429 });
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!(await bcrypt.compare(current, user.passwordHash))) {
    recordFailure(key, 'self');
    return NextResponse.json({ error: 'Mật khẩu hiện tại không đúng' }, { status: 400 });
  }
  clearFailures(key, 'self');

  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(next, 10) } });
  return NextResponse.json({ success: true });
}
