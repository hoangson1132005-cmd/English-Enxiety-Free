'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ADMIN_HELP } from '@/lib/adminHelp';
import { cn } from '@/lib/utils';

const KIND_LABELS: Record<string, string> = { lesson: 'Cuối bài', stage: 'Cuối chặng', final: 'Cuối khóa' };
const SKILL_LABELS: Record<string, string> = { vocabulary: 'Từ vựng', reading: 'Đọc', listening: 'Nghe', writing: 'Viết', speaking: 'Nói' };
const ORIGIN_LABELS: Record<string, string> = {
  manual: 'Ngân hàng (nhập tay)', import: 'Ngân hàng (import)', ai: 'Ngân hàng (AI tạo)', lesson: 'Câu gắn với bài', test: 'Câu của đề test', deleted: 'Đã xóa',
};

interface Row {
  id: string; kind: string; scope: string; user: { name: string; email: string };
  question_count: number; status: string; score: number | null; created_at: string;
}
interface Detail {
  id: string; kind: string; status: string; score: number | null; pass_score?: number; created_at: string; submitted_at: string | null;
  user: { name: string; email: string; level: string };
  lesson: { title: string; topic: string; level: string | null } | null;
  questions: { order: number; id: string; question: string; skill: string; level: string; topic: string; type: string; origin: string; score: number | null; lesson_id?: string | null; in_bank?: boolean }[];
}

export default function QuizSessionsPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [kind, setKind] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Detail | null>(null);

  const load = useCallback(() => {
    const p = new URLSearchParams({ kind, status, page: String(page) });
    if (query) p.set('q', query);
    fetch(`/api/admin/quiz-sessions?${p}`)
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items);
        setTotal(d.total);
        setLoading(false);
      });
  }, [kind, status, page, query]);

  useEffect(load, [load]);

  const open = (id: string) => fetch(`/api/admin/quiz-sessions/${id}`).then((r) => r.json()).then(setDetail);
  const totalPages = Math.max(1, Math.ceil(total / 25));
  const selectCls = 'px-3 py-2.5 text-sm rounded-xl bg-white border border-[var(--color-border)] focus:outline-none';

  return (
    <AdminLayout title="Lịch Sử Bốc Câu" description="Mỗi lượt kiểm tra của học viên đã dùng những câu hỏi nào, lấy từ đâu và kết quả ra sao" help={ADMIN_HELP.quizSessions}>
      <div className="space-y-5">
        <div className="flex flex-wrap gap-3">
          <form onSubmit={(e) => { e.preventDefault(); setQuery(search); setPage(1); }} className="relative flex-1 min-w-[12rem] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm học viên (Enter)" className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white border border-[var(--color-border)] focus:outline-none" />
          </form>
          <select value={kind} onChange={(e) => { setKind(e.target.value); setPage(1); }} className={selectCls}>
            <option value="all">Mọi loại</option>
            {Object.entries(KIND_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={selectCls}>
            <option value="all">Mọi trạng thái</option>
            <option value="open">Đang làm</option>
            <option value="submitted">Đã nộp</option>
          </select>
        </div>

        {loading && <p className="text-center text-sm text-text-muted py-10">Đang tải...</p>}

        {!loading && (
          <div className="rounded-3xl bg-white border border-[var(--color-border)] shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-background-secondary/50 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">
                    <th className="px-5 py-3">Bài kiểm tra</th>
                    <th className="px-5 py-3">Học viên</th>
                    <th className="px-5 py-3">Số câu</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3">Điểm</th>
                    <th className="px-5 py-3">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {items.map((r) => (
                    <tr key={r.id} onClick={() => open(r.id)} className="hover:bg-background-secondary/30 cursor-pointer">
                      <td className="px-5 py-3">
                        <div className="font-medium text-text-primary">{r.scope}</div>
                        <div className="text-[11px] text-text-muted">{KIND_LABELS[r.kind]}</div>
                      </td>
                      <td className="px-5 py-3 text-text-secondary text-xs">{r.user.name}<br />{r.user.email}</td>
                      <td className="px-5 py-3 text-text-secondary">{r.question_count}</td>
                      <td className="px-5 py-3">
                        <span className={cn('text-[11px] font-semibold px-2.5 py-0.5 rounded-full', r.status === 'submitted' ? 'bg-success-light text-success' : 'bg-warning-light text-warning-dark')}>
                          {r.status === 'submitted' ? 'Đã nộp' : 'Đang làm'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-text-secondary">{r.score ?? '—'}</td>
                      <td className="px-5 py-3 text-text-muted text-xs">{new Date(r.created_at).toLocaleString('vi-VN')}</td>
                    </tr>
                  ))}
                  {items.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-text-muted text-sm">Chưa có lượt kiểm tra nào.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)] text-xs text-text-secondary">
              <span>{total} lượt · trang {page}/{totalPages}</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="p-1.5 rounded-lg border border-[var(--color-border)] disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="p-1.5 rounded-lg border border-[var(--color-border)] disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        )}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-soft-lg border border-[var(--color-border)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4 gap-3">
              <div>
                <h3 className="font-display font-bold text-lg text-primary-900">
                  {KIND_LABELS[detail.kind]}{detail.lesson ? `: ${detail.lesson.title}` : ''}
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  {detail.user.name} ({detail.user.email}) · trình độ {detail.user.level} · {detail.questions.length} câu ·{' '}
                  {detail.status === 'submitted' ? `đã nộp, điểm ${detail.score}` : 'đang làm'}
                </p>
              </div>
              <button onClick={() => setDetail(null)} className="p-1 rounded-xl text-text-muted hover:bg-background-secondary"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2">
              {detail.questions.map((q) => (
                <div key={q.id + q.order} className="p-3 rounded-2xl bg-background-secondary/30 border border-[var(--color-border)] flex gap-3">
                  <div className="text-xs font-bold text-text-muted w-6">{q.order}.</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-text-primary">{q.question}</div>
                    <div className="text-[11px] text-text-muted mt-1 flex flex-wrap gap-x-3">
                      <span>{q.level}</span><span>{SKILL_LABELS[q.skill] ?? q.skill}</span><span>{q.topic}</span><span>{ORIGIN_LABELS[q.origin] ?? q.origin}</span>
                      {q.in_bank && <a href={`/admin/question-bank?q=${encodeURIComponent(q.question.slice(0, 40))}`} className="text-primary-700 underline">Sửa / ẩn trong ngân hàng</a>}
                      {!q.in_bank && q.lesson_id && <a href={`/admin/lessons/${q.lesson_id}`} className="text-primary-700 underline">Sửa trong bài học</a>}
                    </div>
                  </div>
                  {q.score != null && (
                    <span className={cn('text-xs font-bold self-start', q.score >= (detail.pass_score ?? 70) ? 'text-success' : 'text-error')}>{q.score}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
