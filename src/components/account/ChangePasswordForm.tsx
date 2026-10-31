'use client';

import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';

// Form đổi mật khẩu dùng chung cho học viên (trang Hồ sơ) và quản trị viên (trang Tài khoản).
export function ChangePasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (next !== confirm) {
      setMessage({ ok: false, text: 'Mật khẩu xác nhận không khớp' });
      return;
    }
    setSaving(true);
    const res = await fetch('/api/account/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: current, new_password: next }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) {
      setMessage({ ok: true, text: 'Đã đổi mật khẩu. Lần đăng nhập sau hãy dùng mật khẩu mới.' });
      setCurrent('');
      setNext('');
      setConfirm('');
    } else {
      setMessage({ ok: false, text: data.error || 'Không đổi được mật khẩu' });
    }
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-2xl text-sm bg-background-secondary/50 dark:bg-gray-800 border border-[var(--color-border)] focus:border-primary-500 focus:outline-none';

  return (
    <form onSubmit={submit} className="space-y-3 max-w-md">
      <div className="flex items-center gap-2 text-sm font-semibold text-text-primary dark:text-white">
        <KeyRound className="w-4 h-4 text-primary-600" /> Đổi mật khẩu
      </div>
      <input type="password" autoComplete="current-password" required placeholder="Mật khẩu hiện tại" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputCls} />
      <input type="password" autoComplete="new-password" required minLength={8} placeholder="Mật khẩu mới (từ 8 ký tự)" value={next} onChange={(e) => setNext(e.target.value)} className={inputCls} />
      <input type="password" autoComplete="new-password" required placeholder="Nhập lại mật khẩu mới" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} />
      {message && (
        <div className={`p-3 rounded-xl text-xs ${message.ok ? 'bg-success-light text-success' : 'bg-error-light text-error'}`}>{message.text}</div>
      )}
      <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold shadow-soft disabled:opacity-50">
        {saving ? 'Đang lưu...' : 'Đổi mật khẩu'}
      </button>
    </form>
  );
}
