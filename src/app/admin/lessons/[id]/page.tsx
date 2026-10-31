'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Pencil } from 'lucide-react';
import { QuestionEditorModal } from '@/components/admin/QuestionEditorModal';
import { AdminLayout } from '@/components/layout/AdminLayout';
import type { SkillType, CEFRLevel, QuestionBankItem } from '@/types';

const SKILL_LABELS: Record<SkillType, string> = {
  listening: 'Nghe', reading: 'Đọc', writing: 'Viết', speaking: 'Nói', vocabulary: 'Từ vựng',
};
const LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

interface LessonFull {
  id: string; stage_id: string; stage_title: string; order: number; title: string; skill: SkillType;
  duration_minutes: number; xp_reward: number; description: string; topic: string; content: string;
  level: CEFRLevel | null;
  vocab_items: { term: string; definition: string; definition_vi?: string; example?: string }[];
  questions: QuestionBankItem[];
}

export default function AdminLessonDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-sm text-text-muted">Đang tải...</p></div>}>
      <AdminLessonDetailContent />
    </Suspense>
  );
}

function AdminLessonDetailContent() {
  const params = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<LessonFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const [qEditor, setQEditor] = useState<{ q: QuestionBankItem | null } | null>(null);

  const [vocabText, setVocabText] = useState('');

  const fetchLesson = () => {
    fetch(`/api/admin/lessons/${params.id}`)
      .then((r) => r.json())
      .then((data: LessonFull) => {
        setLesson(data);
        setVocabText(
          (data.vocab_items ?? [])
            .map((v) => [v.term, v.definition_vi ?? '', v.definition ?? '', v.example ?? ''].join(' | '))
            .join('\n')
        );
      })
      .finally(() => setLoading(false));
  };

  const load = () => {
    setLoading(true);
    fetchLesson();
  };

  useEffect(fetchLesson, [params.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesson) return;
    await fetch(`/api/admin/lessons/${lesson.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: lesson.title,
        skill: lesson.skill,
        duration_minutes: lesson.duration_minutes,
        xp_reward: lesson.xp_reward,
        description: lesson.description,
        topic: lesson.topic,
        content: lesson.content,
        level: lesson.level ?? '',
        vocab_items: vocabText
          .split('\n')
          .map((l) => l.split('|').map((x) => x.trim()))
          .filter((p) => p[0])
          .map((p) => ({ term: p[0], definition_vi: p[1] || '', definition: p[2] || p[1] || '', example: p[3] || undefined })),
      }),
    });
    setSavedAt(new Date().toLocaleTimeString('vi-VN'));
  };

  const saveQuestion = async (payload: Record<string, unknown>): Promise<string | null> => {
    if (!lesson || !qEditor) return null;
    const editing = qEditor.q;
    const res = await fetch(
      editing ? `/api/admin/lessons/${lesson.id}/questions/${editing.id}` : `/api/admin/lessons/${lesson.id}/questions`,
      { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    );
    const data = await res.json();
    if (!res.ok) return data.error || 'Lưu thất bại';
    setLesson({
      ...lesson,
      questions: editing ? lesson.questions.map((x) => (x.id === editing.id ? data : x)) : [...lesson.questions, data],
    });
    setQEditor(null);
    return null;
  };

  const removeQuestion = async (qid: string) => {
    if (!lesson || !confirm('Xóa câu hỏi này?')) return;
    await fetch(`/api/admin/lessons/${lesson.id}/questions/${qid}`, { method: 'DELETE' });
    setLesson({ ...lesson, questions: lesson.questions.filter((q) => q.id !== qid) });
  };

  if (loading || !lesson) {
    return (
      <AdminLayout title="Bài Học" description="Đang tải...">
        <p className="text-center text-sm text-text-muted py-10">Đang tải...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={lesson.title} description={`Chặng: ${lesson.stage_title}`}>
      <div className="space-y-6 max-w-3xl">
        <Link href="/admin/content" className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary-600">
          <ArrowLeft className="w-3.5 h-3.5" /> Về Câu hỏi & Bài học
        </Link>

        <form onSubmit={handleSave} className="space-y-6">
          {/* META */}
          <div className="p-6 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft space-y-4">
            <h3 className="font-display font-bold text-base text-text-primary">Thông Tin Bài Học</h3>
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5">Tên bài học</label>
              <input value={lesson.title} onChange={(e) => setLesson({ ...lesson, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none focus:border-primary-500" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Kỹ năng</label>
                <select value={lesson.skill} onChange={(e) => setLesson({ ...lesson, skill: e.target.value as SkillType })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none">
                  {Object.entries(SKILL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Thời lượng (phút)</label>
                <input type="number" min={5} value={lesson.duration_minutes} onChange={(e) => setLesson({ ...lesson, duration_minutes: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">XP</label>
                <input type="number" min={10} value={lesson.xp_reward} onChange={(e) => setLesson({ ...lesson, xp_reward: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5">Trình độ phù hợp (dùng để AI xếp bài vào lộ trình)</label>
              <select value={lesson.level ?? ''} onChange={(e) => setLesson({ ...lesson, level: (e.target.value || null) as CEFRLevel | null })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none">
                <option value="">Chưa xác định</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5">Chủ đề</label>
              <input value={lesson.topic} onChange={(e) => setLesson({ ...lesson, topic: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5">Mô tả ngắn</label>
              <textarea rows={2} value={lesson.description} onChange={(e) => setLesson({ ...lesson, description: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none resize-none" />
            </div>
          </div>

          {/* CONTENT */}
          <div className="p-6 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft space-y-3">
            <h3 className="font-display font-bold text-base text-text-primary">Nội Dung Giảng Dạy</h3>
            <p className="text-xs text-text-muted">Kiến thức thật sẽ hiển thị cho học viên trước phần luyện tập. Hỗ trợ **in đậm** và xuống dòng.</p>
            <textarea
              rows={16}
              value={lesson.content}
              onChange={(e) => setLesson({ ...lesson, content: e.target.value })}
              placeholder="Viết nội dung bài giảng ở đây: từ vựng, ngữ pháp, ví dụ thực tế, hội thoại mẫu..."
              className="w-full p-4 rounded-2xl text-xs sm:text-sm bg-background-secondary/30 border border-[var(--color-border)] focus:border-primary-500 focus:outline-none resize-y leading-relaxed font-mono"
            />
          </div>

          {/* VOCAB */}
          <div className="p-6 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft space-y-3">
            <h3 className="font-display font-bold text-base text-text-primary">Từ Vựng Trong Bài</h3>
            <p className="text-xs text-text-muted">Mỗi dòng một từ, dạng: <code>từ | nghĩa tiếng Việt | nghĩa tiếng Anh | ví dụ</code>. Học viên sẽ thấy các từ này trong bài và tự lưu vào kho từ của mình.</p>
            <textarea
              rows={8}
              value={vocabText}
              onChange={(e) => setVocabText(e.target.value)}
              placeholder="deadline | hạn chót | the latest time something must be finished | We must meet the deadline."
              className="w-full p-4 rounded-2xl text-xs sm:text-sm bg-background-secondary/30 border border-[var(--color-border)] focus:border-primary-500 focus:outline-none resize-y leading-relaxed font-mono"
            />
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold shadow-soft transition-all">
              Lưu bài học
            </button>
            {savedAt && <span className="text-xs text-success font-medium">Đã lưu lúc {savedAt}</span>}
          </div>
        </form>

        {/* QUESTIONS */}
        <div className="p-6 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-text-primary">Câu Hỏi Ôn Cuối Bài</h3>
              <p className="text-xs text-text-muted">Học viên làm sau khi đọc nội dung giảng dạy ở trên.</p>
            </div>
            <button
              onClick={() => setQEditor({ q: null })}
              className="px-3 py-2 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm câu hỏi
            </button>
          </div>

          <div className="space-y-2">
            {lesson.questions.map((q, idx) => (
              <div key={q.id} className="p-3.5 rounded-2xl bg-background-secondary/30 border border-[var(--color-border)] flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-text-primary">{idx + 1}. {q.question}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{q.type} · {q.level}{q.passage ? ' · có đoạn văn/transcript' : ''}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => setQEditor({ q })} title="Sửa" className="p-1.5 rounded-lg text-text-muted hover:text-primary-600 hover:bg-primary-50 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeQuestion(q.id)} title="Xóa" className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error-light transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {lesson.questions.length === 0 && (
              <p className="text-xs text-text-muted text-center py-6">Chưa có câu hỏi ôn cuối bài nào.</p>
            )}
          </div>
        </div>
      </div>

      {qEditor && (
        <QuestionEditorModal
          title={qEditor.q ? 'Sửa Câu Hỏi' : 'Thêm Câu Hỏi'}
          initial={qEditor.q}
          defaultSkill={lesson.skill}
          defaultTopic={lesson.topic}
          onSubmit={saveQuestion}
          onClose={() => setQEditor(null)}
        />
      )}
    </AdminLayout>
  );
}
