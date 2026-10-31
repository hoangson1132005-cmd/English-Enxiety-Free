'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';

interface Values {
  lessonSize: number; lessonSizeFreeText: number; stageSize: number; finalSize: number; passScore: number;
}

const FIELDS: { key: keyof Values; label: string; help: string }[] = [
  { key: 'lessonSize', label: 'Số câu cuối mỗi bài học', help: 'Bài Từ vựng / Đọc / Nghe. Gợi ý 5-10 câu.' },
  { key: 'lessonSizeFreeText', label: 'Số câu cuối bài Viết / Nói', help: 'Ít hơn vì mỗi câu tự luận mất nhiều thời gian và do AI chấm.' },
  { key: 'stageSize', label: 'Số câu kiểm tra cuối chặng', help: 'Gợi ý 15-20 câu.' },
  { key: 'finalSize', label: 'Số câu kiểm tra cuối khóa', help: 'Gợi ý khoảng 30 câu.' },
  { key: 'passScore', label: 'Điểm đạt (trên 100)', help: 'Dùng cho việc qua bài học và qua bài kiểm tra cuối khóa để lên level.' },
];

export default function QuizSettingsPage() {
  const [values, setValues] = useState<Values | null>(null);
  const [limits, setLimits] = useState<Record<string, [number, number]>>({});
  const [defaults, setDefaults] = useState<Values | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/quiz-settings')
      .then((r) => r.json())
      .then((d) => {
        setValues(d.settings);
        setDefaults(d.defaults);
        setLimits(d.limits);
      });
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch('/api/admin/quiz-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    setMessage(res.ok ? { ok: true, text: 'Đã lưu. Áp dụng cho các bài kiểm tra mở từ bây giờ.' } : { ok: false, text: data.error || 'Lưu thất bại' });
    setSaving(false);
  };

  return (
    <AdminLayout title="Cài Đặt Bài Kiểm Tra" description="Quy tắc chung cho mọi học viên và mọi lộ trình, chỉnh một lần là áp dụng toàn hệ thống">
      {!values ? (
        <p className="text-center text-sm text-text-muted py-10">Đang tải...</p>
      ) : (
        <form onSubmit={save} className="max-w-xl space-y-5">
          <div className="p-6 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft space-y-4">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-text-primary mb-1">{f.label}</label>
                <input
                  type="number"
                  min={limits[f.key]?.[0]}
                  max={limits[f.key]?.[1]}
                  value={values[f.key]}
                  onChange={(e) => setValues({ ...values, [f.key]: Number(e.target.value) })}
                  className="w-32 px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none"
                />
                <span className="ml-3 text-xs text-text-muted">
                  {limits[f.key] ? `${limits[f.key][0]}–${limits[f.key][1]}` : ''}{defaults ? ` · mặc định ${defaults[f.key]}` : ''}
                </span>
                <p className="text-xs text-text-muted mt-1">{f.help}</p>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-2xl bg-cream/40 border border-cream-dark/50 text-xs text-text-secondary leading-relaxed">
            Muốn một bài cụ thể khác mặc định (số câu riêng, chỉ dùng câu của bài): vào trang chi tiết bài học, mục “Bài Kiểm Tra Cuối Bài”.
            Muốn bỏ một câu hỏi có vấn đề: “Tạm ẩn” trong Ngân hàng câu hỏi, câu đó sẽ không còn được bốc cho bất kỳ ai.
          </div>
          {message && (
            <div className={`p-3 rounded-xl text-sm ${message.ok ? 'bg-success-light text-success' : 'bg-error-light text-error'}`}>{message.text}</div>
          )}
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold shadow-soft disabled:opacity-50">
            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </form>
      )}
    </AdminLayout>
  );
}
