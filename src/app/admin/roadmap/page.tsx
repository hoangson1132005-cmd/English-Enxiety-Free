'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, X, Map } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import type { SkillType } from '@/types';
import { cn } from '@/lib/utils';

const SKILL_LABELS: Record<SkillType, string> = {
  listening: 'Nghe', reading: 'Đọc', writing: 'Viết', speaking: 'Nói', vocabulary: 'Từ vựng',
};
const ALL_SKILLS = Object.keys(SKILL_LABELS) as SkillType[];

interface StageRow {
  id: string; order: number; title: string; description: string;
  focus_skills: SkillType[]; weeks: number[]; has_midterm: boolean; has_final: boolean;
  why_this_stage?: string; is_published: boolean; lesson_count: number;
}

export default function AdminRoadmapPage() {
  const [stages, setStages] = useState<StageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newStage, setNewStage] = useState({
    title: '', description: '', weeksText: '', focus_skills: [] as SkillType[],
    has_midterm: false, has_final: false, why_this_stage: '',
  });

  const fetchStages = () => {
    fetch('/api/admin/stages').then((r) => r.json()).then((data) => { setStages(data); setLoading(false); });
  };

  const load = () => {
    setLoading(true);
    fetchStages();
  };

  useEffect(fetchStages, []);

  const togglePublish = async (stage: StageRow) => {
    const res = await fetch(`/api/admin/stages/${stage.id}/publish`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !stage.is_published }),
    });
    if (res.ok) setStages((prev) => prev.map((s) => (s.id === stage.id ? { ...s, is_published: !s.is_published } : s)));
  };

  const removeStage = async (id: string, title: string) => {
    if (!confirm(`Xóa học phần "${title}"? Toàn bộ bài học trong học phần cũng sẽ bị xóa.`)) return;
    const res = await fetch(`/api/admin/stages/${id}`, { method: 'DELETE' });
    if (res.ok) setStages((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleSkill = (sk: SkillType) => {
    setNewStage((prev) => ({
      ...prev,
      focus_skills: prev.focus_skills.includes(sk) ? prev.focus_skills.filter((s) => s !== sk) : [...prev.focus_skills, sk],
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStage.title) return;
    const weeks = newStage.weeksText
      .split(',')
      .map((w) => parseInt(w.trim(), 10))
      .filter((n) => !isNaN(n));
    const res = await fetch('/api/admin/stages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newStage.title,
        description: newStage.description,
        weeks,
        focus_skills: newStage.focus_skills,
        has_midterm: newStage.has_midterm,
        has_final: newStage.has_final,
        why_this_stage: newStage.why_this_stage,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setStages((prev) => [...prev, created].sort((a, b) => a.order - b.order));
      setNewStage({ title: '', description: '', weeksText: '', focus_skills: [], has_midterm: false, has_final: false, why_this_stage: '' });
      setShowModal(false);
    }
  };

  return (
    <AdminLayout title="Học Phần (Kho Nội Dung)" description={`${stages.length} học phần · nhóm bài dùng chung, AI chọn bài từ đây để lập lộ trình riêng cho từng học viên`}>
      <div className="space-y-5">
        <div className="flex justify-end">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold shadow-soft transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm học phần mới
          </button>
        </div>

        {loading && <p className="text-center text-sm text-text-muted py-10">Đang tải...</p>}

        <div className="space-y-3">
          {stages.map((s) => (
            <div key={s.id} className="p-5 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <Map className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-text-primary">Học phần {s.order}: {s.title}</span>
                      <span className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0',
                        s.is_published ? 'bg-success-light text-success' : 'bg-warning-light text-warning-dark'
                      )}>
                        {s.is_published ? 'Đã xuất bản' : 'Nháp'}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">{s.description}</p>
                    <div className="text-xs text-text-muted flex items-center gap-3 mt-1.5 flex-wrap">
                      <span>{s.lesson_count} bài học</span>
                      {s.weeks.length > 0 && <span>Tuần {s.weeks.join(', ')}</span>}
                      <span>{s.focus_skills.map((sk) => SKILL_LABELS[sk]).join(', ')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => togglePublish(s)}
                    title={s.is_published ? 'Ẩn (chuyển về nháp)' : 'Xuất bản'}
                    className="p-2 rounded-xl text-text-muted hover:text-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    {s.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => removeStage(s.id, s.title)}
                    className="p-2 rounded-xl text-text-muted hover:text-error hover:bg-error-light transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!loading && stages.length === 0 && (
            <p className="text-center text-sm text-text-muted py-10">Chưa có học phần nào.</p>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-soft-lg border border-[var(--color-border)] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-primary-900">Thêm Học Phần</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-xl text-text-muted hover:bg-background-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Tên học phần</label>
                <input required value={newStage.title} onChange={(e) => setNewStage({ ...newStage, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Mô tả</label>
                <textarea rows={2} value={newStage.description} onChange={(e) => setNewStage({ ...newStage, description: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Các tuần (cách nhau bởi dấu phẩy, VD: 1,2,3)</label>
                <input value={newStage.weeksText} onChange={(e) => setNewStage({ ...newStage, weeksText: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-2">Kỹ năng trọng tâm</label>
                <div className="grid grid-cols-3 gap-2">
                  {ALL_SKILLS.map((sk) => (
                    <label key={sk} className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
                      <input type="checkbox" checked={newStage.focus_skills.includes(sk)} onChange={() => toggleSkill(sk)} className="rounded text-primary-600" />
                      {SKILL_LABELS[sk]}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
                  <input type="checkbox" checked={newStage.has_midterm} onChange={(e) => setNewStage({ ...newStage, has_midterm: e.target.checked })} className="rounded text-primary-600" />
                  Có bài giữa học phần
                </label>
                <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
                  <input type="checkbox" checked={newStage.has_final} onChange={(e) => setNewStage({ ...newStage, has_final: e.target.checked })} className="rounded text-primary-600" />
                  Có bài cuối học phần
                </label>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Mô tả mục đích học phần (tùy chọn)</label>
                <textarea rows={2} value={newStage.why_this_stage} onChange={(e) => setNewStage({ ...newStage, why_this_stage: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none resize-none" />
              </div>
              <button type="submit" className="w-full mt-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold shadow-soft transition-all">
                Tạo học phần
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
