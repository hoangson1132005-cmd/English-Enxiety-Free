'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Trash2, X, ChevronDown, ChevronUp, Upload, Pencil } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AiImportModal } from '@/components/admin/AiImportModal';
import type { QuestionBankItem, SkillType, CEFRLevel, QuestionType } from '@/types';
import { cn } from '@/lib/utils';

const SKILL_LABELS: Record<SkillType, string> = {
  listening: 'Nghe',
  reading: 'Đọc',
  writing: 'Viết',
  speaking: 'Nói',
  vocabulary: 'Từ vựng',
};

const LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
const QUESTION_TYPES: QuestionType[] = ['multiple_choice', 'fill_blank', 'true_false', 'matching', 'essay', 'speaking'];

interface LessonRow {
  id: string; stage_id: string; stage_title: string; order: number; title: string;
  skill: SkillType; duration_minutes: number; xp_reward: number; description: string; topic: string;
}

export default function AdminContentPage() {
  const [tab, setTab] = useState<'questions' | 'lessons'>('questions');
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [stages, setStages] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState<'all' | SkillType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [showQModal, setShowQModal] = useState(false);
  const [newQ, setNewQ] = useState({
    skill: 'vocabulary' as SkillType, topic: '', level: 'B1' as CEFRLevel, type: 'multiple_choice' as QuestionType,
    question: '', answer: '', explanation: '',
  });

  const [showLModal, setShowLModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [newL, setNewL] = useState({
    stage_title: '', title: '', skill: 'vocabulary' as SkillType,
    duration_minutes: 20, xp_reward: 50, topic: '', description: '',
  });

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/questions').then((r) => r.json()),
      fetch('/api/admin/lessons').then((r) => r.json()),
      fetch('/api/admin/stages').then((r) => r.json()),
    ]).then(([q, l, s]) => {
      setQuestions(q);
      setLessons(l);
      setStages(s);
      if (s[0]) setNewL((prev) => ({ ...prev, stage_title: s[0].title }));
      setLoading(false);
    });
  };

  useEffect(loadAll, []);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch = !search || q.question.toLowerCase().includes(search.toLowerCase()) || q.topic.toLowerCase().includes(search.toLowerCase());
      const matchesSkill = skillFilter === 'all' || q.skill === skillFilter;
      return matchesSearch && matchesSkill;
    });
  }, [questions, search, skillFilter]);

  const filteredLessons = useMemo(() => {
    return lessons.filter((l) => {
      const matchesSearch = !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.topic.toLowerCase().includes(search.toLowerCase());
      const matchesSkill = skillFilter === 'all' || l.skill === skillFilter;
      return matchesSearch && matchesSkill;
    });
  }, [lessons, search, skillFilter]);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQ.question || !newQ.answer) return;
    const res = await fetch('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newQ),
    });
    if (res.ok) {
      const created = await res.json();
      setQuestions((prev) => [created, ...prev]);
      setNewQ({ skill: 'vocabulary', topic: '', level: 'B1', type: 'multiple_choice', question: '', answer: '', explanation: '' });
      setShowQModal(false);
    }
  };

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

  const removeQuestion = async (id: string) => {
    if (!confirm('Xóa câu hỏi này?')) return;
    await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const removeLesson = async (id: string) => {
    if (!confirm('Xóa bài học này?')) return;
    await fetch(`/api/admin/lessons/${id}`, { method: 'DELETE' });
    setLessons((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <AdminLayout title="Câu Hỏi & Bài Học" description="Quản lý ngân hàng câu hỏi và nội dung bài học">
      <div className="space-y-5">
        {/* TABS */}
        <div className="inline-flex p-1 rounded-2xl bg-background-secondary gap-1">
          <button
            onClick={() => { setTab('questions'); setSearch(''); setSkillFilter('all'); }}
            className={cn('px-4 py-2 rounded-xl text-sm font-semibold transition-all', tab === 'questions' ? 'bg-white text-primary-700 shadow-sm' : 'text-text-secondary')}
          >
            Câu hỏi ({questions.length})
          </button>
          <button
            onClick={() => { setTab('lessons'); setSearch(''); setSkillFilter('all'); }}
            className={cn('px-4 py-2 rounded-xl text-sm font-semibold transition-all', tab === 'lessons' ? 'bg-white text-primary-700 shadow-sm' : 'text-text-secondary')}
          >
            Bài học ({lessons.length})
          </button>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tab === 'questions' ? 'Tìm câu hỏi, chủ đề...' : 'Tìm bài học, chủ đề...'}
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
            {tab === 'lessons' && (
              <button
                onClick={() => setShowImport(true)}
                className="px-4 py-2.5 rounded-xl border border-primary-300 text-primary-700 hover:bg-primary-50 text-sm font-semibold transition-all flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Tải file lên (AI)
              </button>
            )}
            <button
              onClick={() => (tab === 'questions' ? setShowQModal(true) : setShowLModal(true))}
              className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold shadow-soft transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {tab === 'questions' ? 'Thêm câu hỏi' : 'Thêm bài học'}
            </button>
          </div>
        </div>

        {loading && <p className="text-center text-sm text-text-muted py-10">Đang tải...</p>}

        {/* QUESTIONS TABLE */}
        {!loading && tab === 'questions' && (
          <div className="rounded-3xl bg-white border border-[var(--color-border)] shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-background-secondary/50 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">
                    <th className="px-5 py-3">Câu hỏi</th>
                    <th className="px-5 py-3">Kỹ năng</th>
                    <th className="px-5 py-3">Cấp độ</th>
                    <th className="px-5 py-3">Loại</th>
                    <th className="px-5 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {filteredQuestions.map((q) => (
                    <React.Fragment key={q.id}>
                      <tr className="hover:bg-background-secondary/30 transition-colors">
                        <td className="px-5 py-3 max-w-md">
                          <div className="font-medium text-text-primary truncate">{q.question}</div>
                          <div className="text-xs text-text-muted">{q.topic}</div>
                        </td>
                        <td className="px-5 py-3 text-text-secondary">{SKILL_LABELS[q.skill]}</td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-bold bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full">{q.level}</span>
                        </td>
                        <td className="px-5 py-3 text-text-secondary text-xs">{q.type}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                              className="p-1.5 rounded-lg text-text-muted hover:text-primary-600 hover:bg-primary-50 transition-colors"
                            >
                              {expandedId === q.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => removeQuestion(q.id)}
                              className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error-light transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedId === q.id && (
                        <tr className="bg-background-secondary/30">
                          <td colSpan={5} className="px-5 py-4 text-xs text-text-secondary leading-relaxed">
                            <p><strong>Đáp án:</strong> {Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}</p>
                            <p className="mt-1"><strong>Giải thích:</strong> {q.explanation}</p>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {filteredQuestions.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-text-muted text-sm">Không có câu hỏi phù hợp.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LESSONS TABLE */}
        {!loading && tab === 'lessons' && (
          <div className="rounded-3xl bg-white border border-[var(--color-border)] shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-background-secondary/50 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">
                    <th className="px-5 py-3">Bài học</th>
                    <th className="px-5 py-3">Chặng</th>
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

      {/* ADD QUESTION MODAL */}
      {showQModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-soft-lg border border-[var(--color-border)] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-primary-900">Thêm Câu Hỏi</h3>
              <button onClick={() => setShowQModal(false)} className="p-1 rounded-xl text-text-muted hover:bg-background-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddQuestion} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">Kỹ năng</label>
                  <select value={newQ.skill} onChange={(e) => setNewQ({ ...newQ, skill: e.target.value as SkillType })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none">
                    {Object.entries(SKILL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">Cấp độ</label>
                  <select value={newQ.level} onChange={(e) => setNewQ({ ...newQ, level: e.target.value as CEFRLevel })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none">
                    {LEVELS.map((lv) => <option key={lv} value={lv}>{lv}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Loại câu hỏi</label>
                <select value={newQ.type} onChange={(e) => setNewQ({ ...newQ, type: e.target.value as QuestionType })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none">
                  {QUESTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Chủ đề</label>
                <input value={newQ.topic} onChange={(e) => setNewQ({ ...newQ, topic: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Nội dung câu hỏi</label>
                <textarea required rows={2} value={newQ.question} onChange={(e) => setNewQ({ ...newQ, question: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Đáp án đúng</label>
                <input required value={newQ.answer} onChange={(e) => setNewQ({ ...newQ, answer: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Giải thích</label>
                <textarea rows={2} value={newQ.explanation} onChange={(e) => setNewQ({ ...newQ, explanation: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none resize-none" />
              </div>
              <button type="submit" className="w-full mt-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold shadow-soft transition-all">
                Lưu câu hỏi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD LESSON MODAL */}
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
                <input required value={newL.title} onChange={(e) => setNewL({ ...newL, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">Chặng</label>
                  <select value={newL.stage_title} onChange={(e) => setNewL({ ...newL, stage_title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none">
                    {stages.map((s) => <option key={s.id} value={s.title}>{s.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">Kỹ năng</label>
                  <select value={newL.skill} onChange={(e) => setNewL({ ...newL, skill: e.target.value as SkillType })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none">
                    {Object.entries(SKILL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">Thời lượng (phút)</label>
                  <input type="number" min={5} value={newL.duration_minutes} onChange={(e) => setNewL({ ...newL, duration_minutes: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">XP</label>
                  <input type="number" min={10} value={newL.xp_reward} onChange={(e) => setNewL({ ...newL, xp_reward: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Chủ đề</label>
                <input value={newL.topic} onChange={(e) => setNewL({ ...newL, topic: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Mô tả</label>
                <textarea rows={2} value={newL.description} onChange={(e) => setNewL({ ...newL, description: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none resize-none" />
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
          title="Tải File Tạo Lộ Trình"
          description="AI sẽ đọc file Word/PDF (giáo án/lộ trình giảng dạy) và tự tạo các chặng + bài học (kèm nội dung giảng dạy và câu hỏi ôn cuối bài). Chặng mới sẽ ở trạng thái chưa xuất bản, xem lại ở trang Chặng học trước khi công khai."
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
