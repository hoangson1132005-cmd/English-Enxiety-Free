'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Search, Plus, Trash2, Pencil, Upload, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AiImportModal } from '@/components/admin/AiImportModal';
import { QuestionEditorModal } from '@/components/admin/QuestionEditorModal';
import { cn } from '@/lib/utils';
import type { CEFRLevel, QuestionBankItem, SkillType } from '@/types';

const SKILL_LABELS: Record<string, string> = {
  vocabulary: 'Từ vựng', reading: 'Đọc', listening: 'Nghe', writing: 'Viết', speaking: 'Nói',
};
const TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'Trắc nghiệm', true_false: 'Đúng/Sai', fill_blank: 'Điền từ', essay: 'Tự luận', speaking: 'Nói', matching: 'Nối cặp',
};
const SOURCE_LABELS: Record<string, string> = { manual: 'Nhập tay', import: 'Import file', ai: 'AI tạo' };
const LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

interface BankItem extends QuestionBankItem {
  source: string; is_active: boolean; used_count: number; accuracy: number | null; created_at: string;
}
interface Facets {
  levels: { value: string; count: number }[];
  skills: { value: string; count: number }[];
  topics: { value: string; count: number }[];
}

const selectCls = 'px-3 py-2.5 text-sm rounded-xl bg-white border border-[var(--color-border)] focus:outline-none';

export default function QuestionBankPage() {
  const [items, setItems] = useState<BankItem[]>([]);
  const [total, setTotal] = useState(0);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [level, setLevel] = useState('all');
  const [skill, setSkill] = useState('all');
  const [type, setType] = useState('all');
  const [topic, setTopic] = useState('all');
  const [source, setSource] = useState('all');
  const [active, setActive] = useState('all');
  const [sort, setSort] = useState('newest');
  const initialQuery = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('q') ?? '' : '';
  const [search, setSearch] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ total_sessions: number; sessions: { id: string; scope: string; user: string; status: string; created_at: string }[] } | null>(null);
  const toggleExpand = (id: string) => {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    setUsage(null);
    fetch(`/api/admin/questions/${id}/usage`).then((r) => r.json()).then(setUsage);
  };
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editor, setEditor] = useState<{ q: BankItem | null } | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const pageSize = 25;

  const load = useCallback(() => {
    const p = new URLSearchParams({ level, skill, type, topic, source, active, sort, page: String(page), pageSize: String(pageSize) });
    if (query) p.set('q', query);
    fetch(`/api/admin/questions?${p}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
        setFacets(data.facets);
        setLoading(false);
      });
  }, [level, skill, type, topic, source, active, sort, page, query]);

  useEffect(load, [load]);

  // Đổi bộ lọc thì quay về trang 1
  const setFilter = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
    setSelected(new Set());
  };

  const saveQuestion = async (payload: Record<string, unknown>): Promise<string | null> => {
    if (!editor) return null;
    const editing = editor.q;
    const res = await fetch(editing ? `/api/admin/questions/${editing.id}` : '/api/admin/questions', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return data.error || 'Lưu thất bại';
    setEditor(null);
    load();
    return null;
  };

  const removeOne = async (id: string) => {
    if (!confirm('Xóa câu hỏi này khỏi ngân hàng?')) return;
    await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
    load();
  };

  const bulk = async (body: Record<string, unknown>) => {
    const res = await fetch('/api/admin/questions/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...selected], ...body }),
    });
    const data = await res.json();
    setNotice(res.ok ? `Đã cập nhật ${data.affected} câu hỏi.` : data.error || 'Thao tác thất bại');
    setSelected(new Set());
    load();
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const bankTotal = facets?.levels.reduce((s, l) => s + l.count, 0) ?? 0;

  return (
    <AdminLayout title="Ngân Hàng Câu Hỏi" description={`${bankTotal} câu · dùng cho bài kiểm tra cuối bài, cuối chặng và cuối khóa của mọi học viên`}>
      <div className="space-y-5">
        <div className="p-4 rounded-2xl bg-cream/40 border border-cream-dark/50 text-xs text-text-secondary leading-relaxed space-y-1">
          <p>
            Khi học viên làm bài kiểm tra, hệ thống bốc câu từ đây theo <strong>cấp độ</strong>, <strong>chủ đề</strong> và <strong>kỹ năng</strong> của bài, ưu tiên câu họ chưa gặp.
            Cuối bài 5-10 câu, cuối chặng 15-20 câu, cuối khóa khoảng 30 câu.
          </p>
          <p className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" /> Nếu không đủ câu phù hợp, AI tự sinh thêm và lưu vào đây (nguồn “AI tạo”) để dùng lại cho người khác. Bạn nên xem lại các câu này.
          </p>
        </div>

        {/* Thống kê theo cấp độ (bấm để lọc) */}
        <div className="grid grid-cols-5 gap-3">
          {(facets?.levels ?? LEVELS.map((l) => ({ value: l, count: 0 }))).map((l) => (
            <button
              key={l.value}
              onClick={() => setFilter(setLevel)(level === l.value ? 'all' : l.value)}
              className={cn(
                'p-3 rounded-2xl border text-center transition-all',
                level === l.value ? 'border-primary-500 bg-primary-50' : 'border-[var(--color-border)] bg-white hover:border-primary-300'
              )}
            >
              <div className="text-xl font-serif font-bold text-primary-700">{l.count}</div>
              <div className="text-[11px] font-semibold text-text-muted">{l.value}</div>
            </button>
          ))}
        </div>

        {/* Bộ lọc */}
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2 flex-1">
            <form
              onSubmit={(e) => { e.preventDefault(); setQuery(search); setPage(1); }}
              className="relative flex-1 min-w-[12rem] max-w-xs"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm câu hỏi, chủ đề... (Enter)"
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white border border-[var(--color-border)] focus:border-primary-300 focus:outline-none"
              />
            </form>
            <select value={skill} onChange={(e) => setFilter(setSkill)(e.target.value)} className={selectCls}>
              <option value="all">Mọi kỹ năng</option>
              {Object.entries(SKILL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={type} onChange={(e) => setFilter(setType)(e.target.value)} className={selectCls}>
              <option value="all">Mọi loại câu</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={topic} onChange={(e) => setFilter(setTopic)(e.target.value)} className={selectCls}>
              <option value="all">Mọi chủ đề</option>
              {facets?.topics.map((t) => <option key={t.value} value={t.value}>{t.value} ({t.count})</option>)}
            </select>
            <select value={source} onChange={(e) => setFilter(setSource)(e.target.value)} className={selectCls}>
              <option value="all">Mọi nguồn</option>
              {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={active} onChange={(e) => setFilter(setActive)(e.target.value)} className={selectCls}>
              <option value="all">Hiện + tạm ẩn</option>
              <option value="yes">Đang dùng</option>
              <option value="no">Tạm ẩn</option>
            </select>
            <select value={sort} onChange={(e) => setFilter(setSort)(e.target.value)} className={selectCls}>
              <option value="newest">Mới nhất</option>
              <option value="level">Theo cấp độ A1 → C1</option>
              <option value="used">Dùng nhiều nhất</option>
              <option value="accuracy">Tỷ lệ đúng thấp nhất</option>
            </select>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowImport(true)}
              className="px-4 py-2.5 rounded-xl border border-primary-300 text-primary-700 hover:bg-primary-50 text-sm font-semibold flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> Tải file lên (AI)
            </button>
            <button
              onClick={() => setEditor({ q: null })}
              className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold shadow-soft flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Thêm câu hỏi
            </button>
          </div>
        </div>

        {notice && (
          <div className="p-3 rounded-xl bg-success-light text-success text-sm flex justify-between gap-3">
            <span className="whitespace-pre-wrap">{notice}</span>
            <button onClick={() => setNotice(null)} className="underline text-xs flex-shrink-0">Đóng</button>
          </div>
        )}

        {selected.size > 0 && (
          <div className="p-3 rounded-2xl bg-primary-50 border border-primary-200 flex flex-wrap items-center gap-3 text-sm">
            <strong>{selected.size} câu đã chọn</strong>
            <select
              defaultValue=""
              onChange={(e) => e.target.value && bulk({ action: 'update', level: e.target.value })}
              className="px-3 py-1.5 rounded-lg text-xs bg-white border border-[var(--color-border)]"
            >
              <option value="">Đổi cấp độ...</option>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <button onClick={() => bulk({ action: 'set_active', active: false })} className="px-3 py-1.5 rounded-lg text-xs border border-primary-300 text-primary-700 font-semibold">Tạm ẩn</button>
            <button onClick={() => bulk({ action: 'set_active', active: true })} className="px-3 py-1.5 rounded-lg text-xs border border-primary-300 text-primary-700 font-semibold">Hiện lại</button>
            <button
              onClick={() => confirm(`Xóa ${selected.size} câu hỏi đã chọn?`) && bulk({ action: 'delete' })}
              className="px-3 py-1.5 rounded-lg text-xs bg-error text-white font-semibold"
            >
              Xóa các câu đã chọn
            </button>
            <button onClick={() => setSelected(new Set())} className="text-xs underline">Bỏ chọn</button>
          </div>
        )}

        {loading && <p className="text-center text-sm text-text-muted py-10">Đang tải...</p>}

        {!loading && (
          <div className="rounded-3xl bg-white border border-[var(--color-border)] shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-background-secondary/50 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">
                    <th className="px-4 py-3 w-8">
                      <input
                        type="checkbox"
                        checked={items.length > 0 && items.every((i) => selected.has(i.id))}
                        onChange={(e) => setSelected(e.target.checked ? new Set(items.map((i) => i.id)) : new Set())}
                      />
                    </th>
                    <th className="px-4 py-3">Câu hỏi</th>
                    <th className="px-4 py-3">Cấp độ</th>
                    <th className="px-4 py-3">Kỹ năng</th>
                    <th className="px-4 py-3">Loại</th>
                    <th className="px-4 py-3">Nguồn</th>
                    <th className="px-4 py-3">Đã dùng / đúng</th>
                    <th className="px-4 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {items.map((q) => (
                    <React.Fragment key={q.id}>
                      <tr className="hover:bg-background-secondary/30 transition-colors">
                        <td className="px-4 py-3"><input type="checkbox" checked={selected.has(q.id)} onChange={() => toggle(q.id)} /></td>
                        <td className="px-4 py-3 max-w-md">
                          <div className={cn('font-medium truncate', q.is_active ? 'text-text-primary' : 'text-text-muted line-through')}>
                            {!q.is_active && <span className="mr-1.5 no-underline text-[10px] font-bold bg-gray-200 text-text-secondary px-1.5 py-0.5 rounded">TẠM ẨN</span>}
                            {q.question}
                          </div>
                          <div className="text-xs text-text-muted">{q.topic}{q.passage ? ' · có đoạn văn/transcript' : ''}{q.audio_url ? ' · có audio' : ''}</div>
                        </td>
                        <td className="px-4 py-3"><span className="text-xs font-bold bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full">{q.level}</span></td>
                        <td className="px-4 py-3 text-text-secondary">{SKILL_LABELS[q.skill]}</td>
                        <td className="px-4 py-3 text-text-secondary text-xs">{TYPE_LABELS[q.type] ?? q.type}</td>
                        <td className="px-4 py-3">
                          <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full', q.source === 'ai' ? 'bg-warning-light text-warning-dark' : 'bg-gray-100 text-text-secondary')}>
                            {SOURCE_LABELS[q.source] ?? q.source}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-text-secondary">
                          {q.used_count} lần{q.accuracy != null ? <> · <strong className={q.accuracy < 40 ? 'text-error' : ''}>{q.accuracy}% đúng</strong></> : ''}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => toggleExpand(q.id)} className="p-1.5 rounded-lg text-text-muted hover:text-primary-600 hover:bg-primary-50">
                              {expanded === q.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            <button onClick={() => setEditor({ q })} className="p-1.5 rounded-lg text-text-muted hover:text-primary-600 hover:bg-primary-50"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => removeOne(q.id)} className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error-light"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                      {expanded === q.id && (
                        <tr className="bg-background-secondary/30">
                          <td colSpan={8} className="px-6 py-4 text-xs text-text-secondary leading-relaxed space-y-1.5">
                            {q.passage && <p className="whitespace-pre-wrap p-3 rounded-xl bg-white border border-[var(--color-border)]"><strong>Đoạn văn / transcript:</strong> {q.passage}</p>}
                            {q.options && <p><strong>Lựa chọn:</strong> {q.options.join(' | ')}</p>}
                            <p><strong>Đáp án:</strong> {Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}</p>
                            <p><strong>Giải thích:</strong> {q.explanation || '—'}</p>
                            <div className="pt-2 border-t border-[var(--color-border)]">
                              <strong>Đã được bốc vào:</strong>{' '}
                              {!usage ? 'đang tải...' : usage.total_sessions === 0 ? 'chưa lượt kiểm tra nào.' : `${usage.total_sessions} lượt kiểm tra (10 lượt gần nhất):`}
                              {usage && usage.sessions.length > 0 && (
                                <ul className="mt-1 space-y-0.5">
                                  {usage.sessions.map((s) => (
                                    <li key={s.id}>
                                      {s.scope} · {s.user} · {s.status === 'submitted' ? 'đã nộp' : 'đang làm'} · {new Date(s.created_at).toLocaleDateString('vi-VN')}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {items.length === 0 && (
                    <tr><td colSpan={8} className="px-5 py-10 text-center text-text-muted text-sm">Chưa có câu hỏi phù hợp bộ lọc. Hãy thêm câu hỏi hoặc tải file lên.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)] text-xs text-text-secondary">
              <span>{total} câu · trang {page}/{totalPages}</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="p-1.5 rounded-lg border border-[var(--color-border)] disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="p-1.5 rounded-lg border border-[var(--color-border)] disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        )}
      </div>

      {editor && (
        <QuestionEditorModal
          title={editor.q ? 'Sửa Câu Hỏi' : 'Thêm Câu Hỏi Vào Ngân Hàng'}
          initial={editor.q}
          defaultSkill={(skill !== 'all' ? skill : 'vocabulary') as SkillType}
          allowSkillChoice={!editor.q}
          onSubmit={saveQuestion}
          onClose={() => setEditor(null)}
        />
      )}

      {showImport && (
        <AiImportModal
          title="Tải Ngân Hàng Câu Hỏi Lên"
          description="AI đọc file Word/PDF, tách từng câu hỏi và tự gắn cấp độ (A1 đến C1), kỹ năng, chủ đề nếu file chưa ghi rõ. File dài sẽ được xử lý theo từng phần. Câu không hợp lệ (thiếu đáp án, đáp án không khớp lựa chọn, bài đọc/nghe thiếu đoạn văn) sẽ được bỏ qua và báo lại."
          endpoint="/api/admin/import/questions"
          onClose={() => setShowImport(false)}
          onSuccess={(data) => {
            const { created, skipped } = data as { created: number; skipped: string[] };
            setShowImport(false);
            setNotice(`Đã thêm ${created} câu vào ngân hàng.${skipped.length ? `\nBỏ qua ${skipped.length} câu:\n- ${skipped.slice(0, 8).join('\n- ')}${skipped.length > 8 ? '\n...' : ''}` : ''}`);
            setPage(1);
            load();
          }}
        />
      )}
    </AdminLayout>
  );
}
