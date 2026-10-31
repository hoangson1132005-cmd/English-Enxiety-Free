import nodemailer from 'nodemailer';

export class MailNotConfiguredError extends Error {
  constructor() {
    super('SMTP chưa được cấu hình (SMTP_HOST, SMTP_USER, SMTP_PASS)');
  }
}

function getTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) throw new MailNotConfiguredError();
  const port = Number(process.env.SMTP_PORT) || 587;
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  await getTransport().sendMail({
    from,
    to,
    subject: 'Đặt lại mật khẩu - English Anxiety Free',
    text: `Xin chào ${name},\n\nBấm vào liên kết sau để đặt lại mật khẩu (có hiệu lực 30 phút):\n${resetUrl}\n\nNếu bạn không yêu cầu, hãy bỏ qua email này.`,
    html: `<p>Xin chào ${escapeHtml(name)},</p><p>Bấm vào nút dưới đây để đặt lại mật khẩu (có hiệu lực <b>30 phút</b>):</p><p><a href="${resetUrl}" style="background:#2F7F7A;color:#fff;padding:10px 20px;border-radius:12px;text-decoration:none">Đặt lại mật khẩu</a></p><p>Hoặc mở liên kết: ${resetUrl}</p><p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>`,
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
