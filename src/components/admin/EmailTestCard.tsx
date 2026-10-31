'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Mail } from 'lucide-react';

interface MailStatus {
  configured: boolean; host: string; port: number; user: string; from: string; app_url: string;
}

// Kiểm tra cấu hình email: hiện trạng thái, gửi thử một thư, và hướng dẫn cấu hình Gmail nếu chưa có.
export function EmailTestCard() {
  const [status, setStatus] = useState<MailStatus | null>(null);
  const [to, setTo] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/email-test').then((r) => r.json()).then(setStatus).catch(() => {});
  }, []);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setResult(null);
    const res = await fetch('/api/admin/email-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to }),
    });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    setResult(res.ok ? { ok: true, text: `Đã gửi thư thử tới ${to}. Kiểm tra hộp thư (cả mục Spam).` } : { ok: false, text: data.error || 'Gửi thất bại' });
  };

  return (
    <div id="email" className="p-6 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Mail className="w-4 h-4 text-primary-600" /> Gửi email (quên mật khẩu)
      </div>

      {status && (
        <div className={`flex items-start gap-2 text-xs p-3 rounded-xl ${status.configured ? 'bg-success-light text-success' : 'bg-warning-light/50 text-warning-dark'}`}>
          {status.configured ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
          <div>
            {status.configured ? (
              <>Đã cấu hình SMTP: <strong>{status.host}:{status.port}</strong>, tài khoản <strong>{status.user}</strong>, người gửi <strong>{status.from}</strong>. Link trong thư sẽ trỏ về <strong>{status.app_url || '(chưa đặt APP_URL)'}</strong>.</>
            ) : (
              <>Chưa cấu hình SMTP nên hệ thống <strong>chưa gửi được email</strong>. Người dùng quên mật khẩu hiện chỉ đặt lại được khi bạn đặt lại giúp ở mục Người dùng.</>
            )}
          </div>
        </div>
      )}

      <form onSubmit={send} className="flex flex-wrap gap-2">
        <input
          type="email" required value={to} onChange={(e) => setTo(e.target.value)} placeholder="Email nhận thư thử"
          className="flex-1 min-w-[14rem] px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none focus:border-primary-500"
        />
        <button type="submit" disabled={sending} className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold disabled:opacity-50">
          {sending ? 'Đang gửi...' : 'Gửi email thử'}
        </button>
      </form>
      {result && <div className={`p-3 rounded-xl text-xs ${result.ok ? 'bg-success-light text-success' : 'bg-error-light text-error'}`}>{result.text}</div>}

      {(!status || !status.configured) && (
        <div className="text-xs text-text-secondary leading-relaxed space-y-1.5 border-t border-[var(--color-border)] pt-3">
          <p className="font-semibold text-text-primary">Cách cấu hình bằng Gmail (miễn phí):</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Vào <a className="text-primary-700 underline" href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer">myaccount.google.com/security</a>, bật <strong>Xác minh 2 bước</strong>.</li>
            <li>Vào <a className="text-primary-700 underline" href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer">myaccount.google.com/apppasswords</a>, tạo <strong>Mật khẩu ứng dụng</strong> (16 ký tự).</li>
            <li>Mở file <code>.env</code> và điền: <code>SMTP_HOST=smtp.gmail.com</code>, <code>SMTP_PORT=587</code>, <code>SMTP_USER=&lt;gmail của bạn&gt;</code>, <code>SMTP_PASS=&lt;mật khẩu ứng dụng&gt;</code>, <code>MAIL_FROM=&quot;English Anxiety Free &lt;gmail của bạn&gt;&quot;</code>, <code>APP_URL=&lt;địa chỉ website thật&gt;</code>.</li>
            <li>Khởi động lại máy chủ rồi quay lại đây bấm <strong>Gửi email thử</strong>.</li>
          </ol>
          <p className="text-text-muted">Gmail giới hạn khoảng 500 thư/ngày. Khi có nhiều người dùng, nên chuyển sang dịch vụ gửi thư chuyên dụng (SendGrid, Mailgun, Amazon SES).</p>
        </div>
      )}
    </div>
  );
}
