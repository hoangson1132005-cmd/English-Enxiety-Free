'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, ArrowRight, AlertTriangle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string; title: string; desc: string; done: boolean; href: string; label: string; optional?: boolean; external?: boolean;
}
interface Attention {
  text: string; href: string; label: string;
}

// "Bắt đầu nhanh" cho admin: các bước thiết lập theo thứ tự, mỗi bước có trạng thái thật (lấy từ dữ liệu) và link bấm ngay.
export function SetupChecklist() {
  const [data, setData] = useState<{ steps: Step[]; attention: Attention[] } | null>(null);

  useEffect(() => {
    fetch('/api/admin/setup-status').then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  if (!data) return null;
  const required = data.steps.filter((s) => !s.optional);
  const done = required.filter((s) => s.done).length;
  const percent = Math.round((done / required.length) * 100);
  const nextStep = required.find((s) => !s.done);

  return (
    <div className="space-y-4">
      {data.attention.length > 0 && (
        <div className="p-4 rounded-2xl bg-warning-light/40 border border-warning/30 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-warning-dark">
            <AlertTriangle className="w-4 h-4" /> Cần chú ý
          </div>
          <ul className="space-y-1.5">
            {data.attention.map((a) => (
              <li key={a.text} className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
                <span>{a.text}</span>
                <Link href={a.href} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-warning/40 text-[11px] font-semibold text-warning-dark hover:bg-warning-light transition-colors">
                  {a.label} <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="p-6 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-base text-text-primary">Bắt đầu nhanh</h3>
            <p className="text-xs text-text-muted mt-0.5">
              {percent === 100 ? 'Hệ thống đã sẵn sàng để đón học viên.' : nextStep ? `Bước tiếp theo: ${nextStep.title}` : ''}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-serif font-bold text-primary-700">{done}/{required.length}</div>
            <div className="text-[11px] text-text-muted">bước bắt buộc đã xong</div>
          </div>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-500 to-accent transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>

        <ol className="divide-y divide-[var(--color-border)]">
          {data.steps.map((s, i) => (
            <li key={s.id} className="py-3 flex items-start gap-3">
              {s.done ? (
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className={cn('w-5 h-5 flex-shrink-0 mt-0.5', s.optional ? 'text-gray-300' : 'text-warning')} />
              )}
              <div className="flex-1 min-w-0">
                <div className={cn('text-sm font-semibold', s.done ? 'text-text-secondary' : 'text-text-primary')}>
                  {i + 1}. {s.title} {s.optional && <span className="ml-1 text-[10px] font-medium text-text-muted">(tùy chọn)</span>}
                </div>
                <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
              {s.external ? (
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-primary-200 text-[11px] font-semibold text-primary-700 hover:bg-primary-50 flex-shrink-0">
                  {s.label} <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <Link href={s.href} className={cn('inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-[11px] font-semibold flex-shrink-0 transition-colors',
                  s.done ? 'border-[var(--color-border)] text-text-secondary hover:bg-background-secondary' : 'border-primary-300 bg-primary-50 text-primary-700 hover:bg-primary-100')}>
                  {s.label} <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
