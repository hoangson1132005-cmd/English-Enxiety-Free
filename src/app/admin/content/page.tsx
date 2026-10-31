'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Trash2, X, Upload, Pencil } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AiImportModal } from '@/components/admin/AiImportModal';
import type { SkillType } from '@/types';

const SKILL_LABELS: Record<SkillType, string> = {
  listening: 'Nghe',
  reading: 'Đọc',
  writing: 'Viết',
  speaking: 'Nói',
  vocabulary: 'Từ vựng',
};

interface LessonRow {
  id: string; stage_id: string; stage_title: string; order: number; title: string;
  skill: SkillType; duration_minutes: number; xp_reward: number; description: string; topic: string;
}

const inputCls = 'w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none';

export default function AdminContentPage() {
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [stages, setStages] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState<'all' | SkillType>('all');

  const [showLModal, setShowLModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [newL, setNewL] = useState({
    stage_title: '', title: '', skill: 'vocabulary' as SkillType,
    duration_minutes: 20, xp_reward: 50, topic: '', description: '',
  });

  const fetchAll = () => {
    Promise.all([
      fetch('/api/admin/lessons').then((r) => r.json()),
      fetch('/api/admin/stages').then((r) => r.json()),
    ]).then(([l, s]) => {
      setLessons(l);
      setStages(s);
      if (s[0]) setNewL((prev) => ({ ...prev, stage_title: prev.stage_title || s[0].title }));
      setLoading(false);
    });
  };

  const loadAll = () => {
    setLoading(true);
    fetchAll();
  };

  useEffect(fetchAll, []);

  const filteredLessons = useMemo(() => {
    return lessons.filter((l) => {
      const matchesSearch = !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.topic.toLowerCase().includes(search.toLowerCase());
      const matchesSkill = skillFilter === 'all' || l.skill === skillFilter;
      return matchesSearch && matchesSkill;
    });
  }, [lessons, search, skillFilter]);

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newL.title) return;
    const res = await fetch('/api/admin/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newL),
    });
    if (res.ok) {
      const created = await res.json();
      setLessons((prev) => [created, ...prev]);
      setNewL((prev) => ({ ...prev, title: '', topic: '', description: '' }));
      setShowLModal(false);
    }
  };

  const removeLesson = async (id: string) => {
    if (!confirm('Xóa bài học này?')) return;
    await fetch(`/api/admin/lessons/${id}`, { method: 'DELETE' });
    setLessons((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <AdminLayout title="Bài Học" description="Kho bài học dùng chung. AI chọn bài từ đây để tạo lộ trình riêng cho từng học viên.">
      <div className="space-y-5">
        <div className="p-4 rounded-2xl bg-cream/40 border border-cream-dark/50 text-xs text-text-secondary leading-relaxed">
          Câu hỏi kiểm tra không còn nhập riêng ở đây: các bài kiểm tra (cuối bài, cuối chặng, cuối khóa) lấy câu từ{' '}
          <Link href="/admin/question-bank" className="font-semibold text-primary-700 underline">Ngân hàng câu hỏi</Link>.
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm bài học, chủ đề..."
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white border border-[var(--color-border)] focus:border-primary-300 focus:outline-none transition-all"
              />
            </div>
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value as 'all' | SkillType)}
              className="px-3 py-2.5 text-sm rounded-xl bg-white border border-[var(--color-border)] focus:outline-none"
            >
              <option value="all">Tất cả kỹ năng</option>
              {Object.entries(SKILL_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowImport(true)}
              className="px-4 py-2.5 rounded-xl border border-primary-300 text-primary-700 hover:bg-primary-50 text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Tải giáo án lên (AI)
            </button>
            <button
              onClick={() => setShowLModal(true)}
              className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold shadow-soft transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm bài học
            </button>
          </div>
        </div>

        {loading && <p className="text-center text-sm text-text-muted py-10">Đang tải...</p>}

        {!loading && (
          <div className="rounded-3xl bg-white border border-[var(--color-border)] shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-background-secondary/50 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">
                    <th className="px-5 py-3">Bài học</th>
                    <th className="px-5 py-3">Học phần</th>
                    <th className="px-5 py-3">Kỹ năng</th>
                    <th className="px-5 py-3">Thời lượng</th>
                    <th className="px-5 py-3">XP</th>
                    <th className="px-5 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {filteredLessons.map((l) => (
                    <tr key={l.id} className="hover:bg-background-secondary/30 transition-colors">
                      <td className="px-5 py-3">
                        <Link href={`/admin/lessons/${l.id}`} className="font-medium text-text-primary hover:text-primary-700 hover:underline">
                          {l.title}
                        </Link>
                        <div className="text-xs text-text-muted">{l.topic}</div>
                      </td>
                      <td className="px-5 py-3 text-text-secondary text-xs">{l.stage_title}</td>
                      <td className="px-5 py-3 text-text-secondary">{SKILL_LABELS[l.skill]}</td>
                      <td className="px-5 py-3 text-text-secondary">{l.duration_minutes} phút</td>
                      <td className="px-5 py-3 text-text-secondary">{l.xp_reward} XP</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/lessons/${l.id}`}
                            className="p-1.5 rounded-lg text-text-muted hover:text-primary-600 hover:bg-primary-50 transition-colors inline-flex"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => removeLesson(l.id)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error-light transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredLessons.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-text-muted text-sm">Không có bài học phù hợp.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showLModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-soft-lg border border-[var(--color-border)] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-primary-900">Thêm Bài Học</h3>
              <button onClick={() => setShowLModal(false)} className="p-1 rounded-xl text-text-muted hover:bg-background-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddLesson} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Tên bài học</label>
                <input required value={newL.title} onChange={(e) => setNewL({ ...newL, title: e.target.value })} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">Học phần</label>
                  <select value={newL.stage_title} onChange={(e) => setNewL({ ...newL, stage_title: e.target.value })} className={inputCls}>
                    {stages.map((s) => <option key={s.id} value={s.title}>{s.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">Kỹ năng</label>
                  <select value={newL.skill} onChange={(e) => setNewL({ ...newL, skill: e.target.value as SkillType })} className={inputCls}>
                    {Object.entries(SKILL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">Thời lượng (phút)</label>
                  <input type="number" min={5} value={newL.duration_minutes} onChange={(e) => setNewL({ ...newL, duration_minutes: Number(e.target.value) })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">XP</label>
                  <input type="number" min={10} value={newL.xp_reward} onChange={(e) => setNewL({ ...newL, xp_reward: Number(e.target.value) })} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Chủ đề</label>
                <input value={newL.topic} onChange={(e) => setNewL({ ...newL, topic: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Mô tả</label>
                <textarea rows={2} value={newL.description} onChange={(e) => setNewL({ ...newL, description: e.target.value })} className={`${inputCls} resize-none`} />
              </div>
              <button type="submit" className="w-full mt-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold shadow-soft transition-all">
                Lưu bài học
              </button>
            </form>
          </div>
        </div>
      )}

      {showImport && (
        <AiImportModal
          title="Tải Giáo Án Lên"
          description="AI sẽ đọc file Word/PDF (giáo án) và tự tạo học phần + bài học (kèm nội dung giảng dạy, từ vựng và câu hỏi). Học phần mới ở trạng thái chưa xuất bản, xem lại ở trang Học phần trước khi công khai."
          endpoint="/api/admin/import/roadmap"
          onClose={() => setShowImport(false)}
          onSuccess={() => {
            setShowImport(false);
            loadAll();
          }}
        />
      )}
    </AdminLayout>
  );
}
