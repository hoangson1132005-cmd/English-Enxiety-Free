'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Clock, FileText, Plus, Trash2, ChevronDown, ChevronUp, X, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import type { SkillType, TestSection } from '@/types';

const SKILL_LABELS: Record<SkillType, string> = {
  listening: 'Nghe', reading: 'Đọc', writing: 'Viết', speaking: 'Nói', vocabulary: 'Từ vựng',
};

export default function AdminTestDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-sm text-text-muted">Đang tải...</p></div>}>
      <AdminTestDetailContent />
    </Suspense>
  );
}

function AdminTestDetailContent() {
  const params = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(45);
  const [kind, setKind] = useState('placement');
  const [targetLevel, setTargetLevel] = useState('A2');
  const [sections, setSections] = useState<TestSection[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [newSection, setNewSection] = useState({ title: '', skill: 'vocabulary' as SkillType, time_limit_minutes: 10, instructions: '' });

  const fetchTest = () => {
    fetch(`/api/admin/tests/${params.id}`)
      .then(async (r) => {
        if (!r.ok) { setNotFound(true); return; }
        const data = await r.json();
        setIsActive(data.is_active);
        setTitle(data.title);
        setDescription(data.description);
        setDuration(data.duration_minutes);
        setKind(data.kind ?? 'placement');
        setTargetLevel(data.target_level ?? 'A2');
        setSections(data.sections);
      })
      .finally(() => setLoading(false));
  };

  const load = () => {
    setLoading(true);
    fetchTest();
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(fetchTest, [params.id]);

  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/admin/tests/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, duration_minutes: duration, kind, target_level: targetLevel }),
    });
    setSavedAt(new Date().toLocaleTimeString('vi-VN'));
  };

  const handleActivate = async () => {
    await fetch(`/api/admin/tests/${params.id}/activate`, { method: 'PATCH' });
    setIsActive(true);
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSection.title) return;
    const res = await fetch(`/api/admin/tests/${params.id}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSection),
    });
    if (res.ok) {
      const created = await res.json();
      setSections((prev) => [...prev, created]);
      setNewSection({ title: '', skill: 'vocabulary', time_limit_minutes: 10, instructions: '' });
      setShowModal(false);
    }
  };

  const removeSection = async (id: string) => {
    if (!confirm('Xóa phần thi này?')) return;
    await fetch(`/api/admin/tests/sections/${id}`, { method: 'DELETE' });
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  if (loading) {
    return (
      <AdminLayout title="Đề Test" description="Đang tải...">
        <p className="text-center text-sm text-text-muted py-10">Đang tải...</p>
      </AdminLayout>
    );
  }

  if (notFound) {
    return (
      <AdminLayout title="Đề Test" description="Không tìm thấy">
        <p className="text-center text-sm text-text-muted py-10">Không tìm thấy đề test này.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={title} description={isActive ? 'Đề đang được dùng cho học viên' : 'Đề nháp — chưa kích hoạt'}>
      <div className="space-y-6">
        <Link href="/admin/tests" className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary-600">
          <ArrowLeft className="w-3.5 h-3.5" /> Về danh sách đề test
        </Link>

        {!isActive && (
          <div className="p-4 rounded-2xl bg-warning-light/50 border border-warning/30 flex items-center justify-between gap-4">
            <p className="text-xs text-warning-dark">Đề này chưa được kích hoạt — học viên chưa thấy đề này ở trang Test đầu vào.</p>
            <button
              onClick={handleActivate}
              className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-xs font-semibold shadow-soft flex items-center gap-1.5 flex-shrink-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Kích hoạt đề này
            </button>
          </div>
        )}

        {/* TEST META */}
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft space-y-4">
          <h3 className="font-display font-bold text-base text-text-primary">Thông Tin Đề Test</h3>
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">Tên đề test</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">Mô tả</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none focus:border-primary-500 resize-none" />
          </div>

            <div className="">
              <label className="block text-xs font-semibold text-text-primary mb-1.5">Loại đề</label>
              <select value={kind} onChange={(e) => setKind(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none">
                <option value="placement">Đề đầu vào (xếp trình độ)</option>
                <option value="level_up">Đề tổng kết lộ trình (xét lên level)</option>
              </select>
            </div>
            {kind === 'level_up' && (
              <div className="">
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Dành cho học viên đang ở level</label>
                <select value={targetLevel} onChange={(e) => setTargetLevel(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none">
                  {['A1', 'A2', 'B1', 'B2', 'C1'].map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            )}
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-[160px]">
              <label className="block text-xs font-semibold text-text-primary mb-1.5">Thời gian (phút)</label>
              <input type="number" min={5} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none focus:border-primary-500" />
            </div>
            <div className="flex-1 flex items-end gap-3">
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold shadow-soft transition-all">
                Lưu thay đổi
              </button>
              {savedAt && <span className="text-xs text-success font-medium">Đã lưu lúc {savedAt}</span>}
            </div>
          </div>
        </form>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[var(--color-border)] shadow-soft text-center">
            <div className="text-xl font-display font-bold text-primary-700">{sections.length}</div>
            <div className="text-xs text-text-muted">Phần thi</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[var(--color-border)] shadow-soft text-center">
            <div className="text-xl font-display font-bold text-primary-700">{totalQuestions}</div>
            <div className="text-xs text-text-muted">Câu hỏi</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[var(--color-border)] shadow-soft text-center">
            <div className="text-xl font-display font-bold text-primary-700">{duration} phút</div>
            <div className="text-xs text-text-muted">Tổng thời gian</div>
          </div>
        </div>

        {/* SECTIONS */}
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-base text-text-primary">Các Phần Thi</h3>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold shadow-soft transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm phần thi
          </button>
        </div>

        <div className="space-y-3">
          {sections.map((s) => (
            <div key={s.id} className="rounded-3xl bg-white border border-[var(--color-border)] shadow-soft overflow-hidden">
              <div className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-text-primary truncate">{s.title}</div>
                    <div className="text-xs text-text-muted flex items-center gap-3 mt-0.5">
                      <span>{SKILL_LABELS[s.skill]}</span>
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {s.questions.length} câu</span>
                      {s.time_limit_minutes && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {s.time_limit_minutes} phút</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                    className="p-2 rounded-xl text-text-muted hover:text-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    {expandedId === s.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => removeSection(s.id)}
                    className="p-2 rounded-xl text-text-muted hover:text-error hover:bg-error-light transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {expandedId === s.id && (
                <div className="border-t border-[var(--color-border)] bg-background-secondary/30 px-5 py-4 space-y-2">
                  <p className="text-xs text-text-secondary mb-2">{s.instructions}</p>
                  {s.questions.length === 0 ? (
                    <p className="text-xs text-text-muted italic">Chưa có câu hỏi trong phần này.</p>
                  ) : (
                    s.questions.map((q, idx) => (
                      <div key={q.id} className="text-xs text-text-primary flex gap-2">
                        <span className="text-text-muted">{idx + 1}.</span>
                        <span className="truncate">{q.question}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
          {sections.length === 0 && (
            <p className="text-xs text-text-muted text-center py-6">Chưa có phần thi nào. Thêm phần thi hoặc tải file lên để AI tạo tự động.</p>
          )}
        </div>
      </div>

      {/* ADD SECTION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-soft-lg border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-primary-900">Thêm Phần Thi</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-xl text-text-muted hover:bg-background-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSection} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Tên phần thi</label>
                <input required value={newSection.title} onChange={(e) => setNewSection({ ...newSection, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">Kỹ năng</label>
                  <select value={newSection.skill} onChange={(e) => setNewSection({ ...newSection, skill: e.target.value as SkillType })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none">
                    {Object.entries(SKILL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">Thời gian (phút)</label>
                  <input type="number" min={5} value={newSection.time_limit_minutes} onChange={(e) => setNewSection({ ...newSection, time_limit_minutes: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Hướng dẫn</label>
                <textarea rows={2} value={newSection.instructions} onChange={(e) => setNewSection({ ...newSection, instructions: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none resize-none" />
              </div>
              <button type="submit" className="w-full mt-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold shadow-soft transition-all">
                Tạo phần thi
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
