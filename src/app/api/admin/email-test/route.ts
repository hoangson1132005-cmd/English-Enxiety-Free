import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getMailStatus, sendTestEmail, MailNotConfiguredError } from '@/lib/mail';

// Trạng thái cấu hình email (không lộ mật khẩu SMTP).
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json(getMailStatus());
}

// Gửi một email thử để kiểm tra cấu hình SMTP.
export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const to = String(body.to ?? '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return NextResponse.json({ error: 'Email nhận không hợp lệ' }, { status: 400 });

  try {
    await sendTestEmail(to);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof MailNotConfiguredError) {
      return NextResponse.json({ error: 'Chưa cấu hình SMTP trong file .env (SMTP_HOST, SMTP_USER, SMTP_PASS). Xem hướng dẫn bên dưới.' }, { status: 503 });
    }
    const detail = err instanceof Error ? err.message : 'Lỗi không xác định';
    return NextResponse.json({ error: `Gửi thất bại: ${detail}` }, { status: 502 });
  }
}
