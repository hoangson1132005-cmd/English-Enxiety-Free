'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowUp, ArrowDown, Plus, Trash2, Sparkles, RefreshCw } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { cn } from '@/lib/utils';
import type { SkillType } from '@/types';

const SKILL_LABELS: Record<SkillType, string> = {
  listening: 'Nghe', reading: 'Đọc', writing: 'Viết', speaking: 'Nói', vocabulary: 'Từ vựng',
};
const STATUS_LABELS: Record<string, string> = {
  pending: 'Chưa học', in_progress: 'Đang học', completed: 'Đã xong', suggested: 'Đề xuất', dismissed: 'Đã bỏ qua',
};
const GENERATED_LABELS: Record<string, string> = { ai: 'AI tạo', heuristic: 'Tạo theo giáo trình', admin: 'Đã chỉnh bởi giáo viên' };

interface View {
  user: { id: string; full_name: string; email: string; current_level: string; daily_minutes: number; goal: string | null };
  roadmap: { id: string; cycle: number; kind: string; level: string; generated_by: string; rationale: string; created_at: string };
  items: {
    item_id: string; lesson_id: string; title: string; skill: SkillType; level: string | null; stage_title: string;
    duration_minutes: number; order: number; week: number; status: string; source: string; reason: string;
    best_score: number | null; attempt_count: number;
  }[];
  catalog: { lesson_id: string; title: string; skill: SkillType; level: string | null; stage_title: string; duration_minutes: number }[];
  history: { id: string; cycle: number; kind: string; level: string; status: string; created_at: string }[];
}

export default function AdminUserRoadmapPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-sm text-text-muted">Đang tải...</p></div>}>
      <Content />
    </Suspense>
  );
}

function Content() {
  const params = useParams<{ id: string }>();
  const [view, setView] = useState<View | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pick, setPick] = useState('');

  const load = useCallback(() => {
    fetch(`/api/admin/users/${params.id}/roadmap`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || 'Lỗi');
        setView(await r.json());
      })
      .catch((e: Error) => setError(e.message));
  }, [params.id]);

  useEffect(load, [load]);

  const call = async (method: 'POST' | 'PATCH', body: object) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${params.id}/roadmap`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Thao tác thất bại');
      setView(data);
      setPick('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const regenerate = (keep: boolean) => {
    const msg = keep
      ? 'AI sẽ tạo lại phần còn lại của lộ trình, giữ nguyên các bài học viên đã hoàn thành. Tiếp tục?'
      : 'AI sẽ tạo lộ trình MỚI hoàn toàn (lộ trình cũ được lưu trữ). Tiếp tục?';
    if (confirm(msg)) call('POST', { keep_completed: keep });
  };

  if (!view) {
    return (
      <AdminLayout title="Lộ trình của học viên">
        <p className="text-center text-sm text-text-muted py-10">{error ?? 'Đang tải...'}</p>
      </AdminLayout>
    );
  }

  const core = view.items.filter((i) => i.status !== 'suggested' && i.status !== 'dismissed');
  const side = view.items.filter((i) => i.status === 'suggested' || i.status === 'dismissed');

  return (
    <AdminLayout title={`Lộ trình: ${view.user.full_name}`} description={`${view.user.email} • Trình độ ${view.user.current_level}`}>
      <div className="space-y-6">
        <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary-600">
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách người dùng
        </Link>

        {error && <div className="p-3 rounded-xl bg-error-light text-error text-sm">{error}</div>}

        <div className="p-6 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-primary-700 uppercase tracking-wider">
                Chu kỳ {view.roadmap.cycle} • {view.roadmap.level} • {GENERATED_LABELS[view.roadmap.generated_by] ?? view.roadmap.generated_by}
              </div>
              <p className="text-xs text-text-secondary mt-1 max-w-2xl">{view.roadmap.rationale}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button disabled={busy} onClick={() => regenerate(true)} className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
                <Sparkles className="w-4 h-4" /> AI tạo lại (giữ bài đã xong)
              </button>
              <button disabled={busy} onClick={() => regenerate(false)} className="px-4 py-2.5 rounded-xl border border-primary-300 text-primary-700 text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
                <RefreshCw className="w-4 h-4" /> Tạo lộ trình mới
              </button>
            </div>
          </div>
          {busy && <p className="text-xs text-text-muted">Đang xử lý... AI có thể mất vài giây.</p>}
        </div>

        <div className="rounded-3xl bg-white border border-[var(--color-border)] shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-background-secondary/50 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Bài học</th>
                  <th className="px-4 py-3">Kỹ năng</th>
                  <th className="px-4 py-3">Tuần</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Điểm tốt nhất</th>
                  <th className="px-4 py-3 text-right">Chỉnh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {core.map((i, idx) => (
                  <tr key={i.item_id}>
                    <td className="px-4 py-3 text-text-muted">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-text-primary">{i.title}</div>
                      <div className="text-[11px] text-text-muted">{i.stage_title}{i.level ? ` • ${i.level}` : ''}{i.reason ? ` • ${i.reason}` : ''}</div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{SKILL_LABELS[i.skill]}</td>
                    <td className="px-4 py-3 text-text-secondary">{i.week}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-[11px] font-semibold px-2.5 py-0.5 rounded-full', i.status === 'completed' ? 'bg-success-light text-success' : i.status === 'in_progress' ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 text-text-muted')}>
                        {STATUS_LABELS[i.status] ?? i.status}
                      </span>
                      {i.source === 'admin' && <span className="ml-1.5 text-[10px] text-accent font-bold">GV thêm</span>}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{i.best_score != null ? `${i.best_score} (${i.attempt_count} lần)` : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button disabled={busy || idx === 0} onClick={() => call('PATCH', { action: 'move', item_id: i.item_id, direction: 'up' })} className="p-1.5 rounded-lg text-text-muted hover:bg-primary-50 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                        <button disabled={busy || idx === core.length - 1} onClick={() => call('PATCH', { action: 'move', item_id: i.item_id, direction: 'down' })} className="p-1.5 rounded-lg text-text-muted hover:bg-primary-50 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                        <button
                          disabled={busy || i.status === 'completed'}
                          onClick={() => confirm(`Bỏ bài "${i.title}" khỏi lộ trình của học viên?`) && call('PATCH', { action: 'remove', item_id: i.item_id })}
                          className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error-light disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {core.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-text-muted text-sm">Lộ trình chưa có bài nào. Hãy xuất bản chặng học trong mục Nội dung, rồi bấm “AI tạo lại”.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft space-y-3">
          <h3 className="font-display font-bold text-base text-text-primary">Thêm bài học cho học viên này</h3>
          <div className="flex flex-wrap gap-2">
            <select value={pick} onChange={(e) => setPick(e.target.value)} className="flex-1 min-w-[16rem] px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none">
              <option value="">Chọn bài trong kho nội dung...</option>
              {view.catalog.map((l) => (
                <option key={l.lesson_id} value={l.lesson_id}>
                  [{SKILL_LABELS[l.skill]}{l.level ? ` ${l.level}` : ''}] {l.title} — {l.stage_title}
                </option>
              ))}
            </select>
            <button disabled={!pick || busy} onClick={() => call('PATCH', { action: 'add', lesson_id: pick })} className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-40">
              <Plus className="w-4 h-4" /> Thêm vào cuối lộ trình
            </button>
          </div>
        </div>

        {side.length > 0 && (
          <div className="p-6 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft">
            <h3 className="font-display font-bold text-base text-text-primary mb-2">Bài đã đề xuất cho học viên</h3>
            <ul className="text-xs text-text-secondary space-y-1">
              {side.map((i) => <li key={i.item_id}>{i.title} — <strong>{STATUS_LABELS[i.status]}</strong></li>)}
            </ul>
          </div>
        )}

        {view.history.length > 0 && (
          <div className="p-6 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft">
            <h3 className="font-display font-bold text-base text-text-primary mb-2">Lịch sử lộ trình</h3>
            <ul className="text-xs text-text-secondary space-y-1">
              {view.history.map((h) => (
                <li key={h.id}>Chu kỳ {h.cycle} • {h.level} • {h.kind} • {h.status === 'completed' ? 'Đã hoàn thành' : 'Đã lưu trữ'} • {new Date(h.created_at).toLocaleDateString('vi-VN')}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
