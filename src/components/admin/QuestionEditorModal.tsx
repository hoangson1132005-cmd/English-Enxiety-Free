'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { CEFRLevel, QuestionBankItem, QuestionType, SkillType } from '@/types';

const LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
const TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'Trắc nghiệm',
  true_false: 'Đúng / Sai',
  fill_blank: 'Điền từ',
  matching: 'Nối cặp',
  essay: 'Tự luận (viết)',
  speaking: 'Nói',
};
const SELECTABLE_TYPES: QuestionType[] = ['multiple_choice', 'true_false', 'fill_blank', 'essay', 'speaking'];

const inputCls = 'w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none focus:border-primary-500';

interface Props {
  title: string;
  initial?: QuestionBankItem | null;
  defaultSkill: SkillType;
  defaultTopic?: string;
  // Trả về thông báo lỗi (hiện trong form) hoặc null nếu lưu thành công
  onSubmit: (payload: Record<string, unknown>) => Promise<string | null>;
  onClose: () => void;
}

export function QuestionEditorModal({ title, initial, defaultSkill, defaultTopic, onSubmit, onClose }: Props) {
  const skill = initial?.skill ?? defaultSkill;
  const [type, setType] = useState<QuestionType>(initial?.type ?? 'multiple_choice');
  const [level, setLevel] = useState<CEFRLevel>(initial?.level ?? 'B1');
  const [topic, setTopic] = useState(initial?.topic ?? defaultTopic ?? '');
  const [question, setQuestion] = useState(initial?.question ?? '');
  const [passage, setPassage] = useState(initial?.passage ?? '');
  const [optionsText, setOptionsText] = useState((initial?.options ?? []).join('\n'));
  const initialAnswer = Array.isArray(initial?.answer) ? initial!.answer.join(' | ') : initial?.answer ?? '';
  const [answer, setAnswer] = useState(initialAnswer);
  const [explanation, setExplanation] = useState(initial?.explanation ?? '');
  const [audioUrl, setAudioUrl] = useState(initial?.audio_url ?? '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const options = optionsText.split('\n').map((o) => o.trim()).filter(Boolean);
  const showPassage = skill === 'reading' || skill === 'listening' || !!passage;

  const uploadAudio = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/audio', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload thất bại');
      setAudioUrl(data.url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const answerValue = type === 'fill_blank' && answer.includes('|') ? answer.split('|').map((a) => a.trim()).filter(Boolean) : answer.trim();
    const err = await onSubmit({
      skill, type, level, topic, question, passage,
      options: type === 'multiple_choice' ? options : type === 'true_false' ? ['True', 'False'] : undefined,
      answer: answerValue,
      explanation,
      audio_url: audioUrl,
    });
    setSaving(false);
    if (err) setError(err);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-soft-lg border border-[var(--color-border)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg text-primary-900">{title}</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-xl text-text-muted hover:bg-background-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-text-primary mb-1.5">Loại câu hỏi</label>
              <select value={type} onChange={(e) => { setType(e.target.value as QuestionType); setAnswer(''); }} className={inputCls}>
                {SELECTABLE_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5">Cấp độ</label>
              <select value={level} onChange={(e) => setLevel(e.target.value as CEFRLevel)} className={inputCls}>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">Chủ đề</label>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="vd: email, meeting, travel" className={inputCls} />
          </div>

          {showPassage && (
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5">
                {skill === 'listening' ? 'Văn bản bài nghe (transcript, hệ thống sẽ đọc thành tiếng cho học viên)' : 'Đoạn văn cần đọc'}
              </label>
              <textarea rows={5} value={passage} onChange={(e) => setPassage(e.target.value)} className={`${inputCls} resize-y`} />
            </div>
          )}
          {!showPassage && (
            <button type="button" onClick={() => setPassage(' ')} className="text-xs text-primary-700 underline">+ Thêm đoạn văn / transcript cho câu hỏi này</button>
          )}

          {skill === 'listening' && (
            <div className="p-3 rounded-2xl bg-teal-50 border border-teal-100 space-y-2">
              <label className="block text-xs font-semibold text-text-primary">Âm thanh bài nghe (tùy chọn)</label>
              <p className="text-[11px] text-text-secondary">Nếu không upload, hệ thống tự đọc transcript bằng giọng đọc của trình duyệt. Upload file thật (mp3, wav, m4a, tối đa 6MB) để có giọng người thật.</p>
              {audioUrl ? (
                <div className="space-y-2">
                  <audio controls src={audioUrl} className="w-full" />
                  <button type="button" onClick={() => setAudioUrl('')} className="text-xs text-error underline">Gỡ file âm thanh</button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="audio/*"
                  disabled={uploading}
                  onChange={(e) => e.target.files?.[0] && uploadAudio(e.target.files[0])}
                  className="block w-full text-xs file:mr-3 file:px-3 file:py-2 file:rounded-xl file:border-0 file:bg-primary-600 file:text-white file:text-xs file:font-semibold"
                />
              )}
              {uploading && <p className="text-[11px] text-text-muted">Đang tải lên...</p>}
              <input
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="hoặc dán đường dẫn audio (vd: /api/audio/... của câu khác để dùng lại)"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-[var(--color-border)] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">Nội dung câu hỏi</label>
            <textarea required rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} className={`${inputCls} resize-y`} />
          </div>

          {type === 'multiple_choice' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Các lựa chọn (mỗi dòng một lựa chọn)</label>
                <textarea rows={4} value={optionsText} onChange={(e) => setOptionsText(e.target.value)} placeholder={'Lựa chọn A\nLựa chọn B\nLựa chọn C\nLựa chọn D'} className={`${inputCls} resize-y`} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Đáp án đúng</label>
                <select required value={answer} onChange={(e) => setAnswer(e.target.value)} className={inputCls}>
                  <option value="">Chọn đáp án đúng...</option>
                  {options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </>
          )}

          {type === 'true_false' && (
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5">Đáp án đúng</label>
              <select required value={answer} onChange={(e) => setAnswer(e.target.value)} className={inputCls}>
                <option value="">Chọn...</option>
                <option value="True">True (Đúng)</option>
                <option value="False">False (Sai)</option>
              </select>
            </div>
          )}

          {type === 'fill_blank' && (
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5">Đáp án đúng (nhiều đáp án chấp nhận thì ngăn cách bằng dấu |)</label>
              <input required value={answer} onChange={(e) => setAnswer(e.target.value)} className={inputCls} />
            </div>
          )}

          {(type === 'essay' || type === 'speaking' || type === 'matching') && (
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5">Bài mẫu / gợi ý chấm (AI dùng để chấm điểm)</label>
              <textarea required rows={4} value={answer} onChange={(e) => setAnswer(e.target.value)} className={`${inputCls} resize-y`} />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">Giải thích (hiện sau khi chấm)</label>
            <textarea rows={2} value={explanation} onChange={(e) => setExplanation(e.target.value)} className={`${inputCls} resize-none`} />
          </div>

          {error && <div className="p-3 rounded-xl bg-error-light text-error text-xs">{error}</div>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-text-secondary text-sm font-medium">Hủy</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold shadow-soft disabled:opacity-50">
              {saving ? 'Đang lưu...' : 'Lưu câu hỏi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
