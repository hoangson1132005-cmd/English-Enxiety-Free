'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, Volume2, PenTool, Mic, MicOff, FlipHorizontal, CheckCircle2, XCircle, Award, ArrowRight, ArrowLeft,
  Clock, RotateCcw, Lightbulb, BookmarkPlus, Eye, EyeOff, Play, Trophy, Lock,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { apiGetLesson, apiSubmitLesson, apiSaveLessonWords } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import type { LessonDetail, LessonQuestion, LessonSubmitResult, SkillType } from '@/types';

const SKILL_LABELS: Record<SkillType, string> = {
  listening: 'Nghe', reading: 'Đọc', writing: 'Viết', speaking: 'Nói', vocabulary: 'Từ vựng',
};
const SKILL_ICONS: Record<SkillType, React.ElementType> = {
  listening: Volume2, reading: BookOpen, writing: PenTool, speaking: Mic, vocabulary: FlipHorizontal,
};
const SKILL_HINTS: Record<SkillType, string> = {
  listening: 'Nghe nội dung rồi trả lời. Bạn có thể nghe lại và đổi tốc độ.',
  reading: 'Đọc kỹ đoạn văn bên trái rồi trả lời các câu hỏi.',
  writing: 'Viết câu trả lời bằng tiếng Anh. AI sẽ chấm và nhận xét chi tiết.',
  speaking: 'Bấm nút thu âm và nói to, rõ ràng. Bạn có thể sửa lại nội dung nhận diện được.',
  vocabulary: 'Học các từ mới ở trên, sau đó làm bài kiểm tra nhanh.',
};

type Phase = 'learn' | 'practice' | 'result';

function renderLiteMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;
    const inline = (s: string) =>
      s.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
        part.startsWith('**') && part.endsWith('**') ? <strong key={j}>{part.slice(2, -2)}</strong> : part
      );
    const heading = line.match(/^#{1,4}\s+(.*)$/);
    if (heading) return <h4 key={i} className="font-bold text-text-primary dark:text-white mt-3 mb-1">{inline(heading[1])}</h4>;
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    if (bullet) return <p key={i} className="mb-1 pl-4 relative before:content-['•'] before:absolute before:left-1">{inline(bullet[1])}</p>;
    return <p key={i} className="mb-1.5">{inline(line)}</p>;
  });
}

function speak(text: string, rate = 1) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  window.speechSynthesis.speak(u);
}

interface SpeechRecognitionLike {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void; stop: () => void;
}

export default function LessonPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-sm text-text-muted">Đang tải...</p>
        </div>
      }
    >
      <LessonPageContent />
    </Suspense>
  );
}

// ---------- Câu hỏi: giao diện thay đổi theo kỹ năng ----------
function QuestionView({
  q, skill, value, onChange, disabled,
}: {
  q: LessonQuestion; skill: SkillType; value: string; onChange: (v: string) => void; disabled: boolean;
}) {
  const [showTranscript, setShowTranscript] = useState(false);
  const [rate, setRate] = useState(1);
  const [recording, setRecording] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const supportsRecognition =
    typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const isListening = skill === 'listening';
  const hasTranscriptAudio = isListening && !q.audio_url && !!q.passage;
  const passageHidden = isListening; // bài nghe: đoạn văn là transcript, ẩn cho đến khi người học chọn xem

  const toggleRecord = () => {
    if (recording) {
      recRef.current?.stop();
      return;
    }
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.continuous = true;
    rec.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0].transcript).join(' ');
      onChange(text);
    };
    rec.onend = () => setRecording(false);
    rec.onerror = () => setRecording(false);
    recRef.current = rec;
    rec.start();
    setRecording(true);
  };

  const passageBlock = q.passage && !passageHidden && (
    <div className="p-4 rounded-2xl bg-background-secondary/60 dark:bg-gray-800/60 border border-[var(--color-border)] text-xs sm:text-sm whitespace-pre-wrap leading-relaxed max-h-[28rem] overflow-y-auto">
      {q.passage}
    </div>
  );

  const answerBlock = (
    <div className="space-y-4">
      {isListening && (
        <div className="p-4 rounded-2xl bg-teal-50 dark:bg-gray-800 border border-teal-100 dark:border-gray-700 space-y-3">
          {q.audio_url && <audio controls src={q.audio_url} className="w-full" />}
          {hasTranscriptAudio && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => speak(q.passage!, rate)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> Nghe
              </button>
              {[0.75, 1, 1.25].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRate(r)}
                  className={cn('px-2.5 py-1.5 rounded-lg text-xs font-medium border', rate === r ? 'bg-teal-600 text-white border-teal-600' : 'border-teal-200 text-teal-800')}
                >
                  {r}x
                </button>
              ))}
            </div>
          )}
          {q.passage && (
            <div>
              <button type="button" onClick={() => setShowTranscript((v) => !v)} className="text-xs font-semibold text-teal-800 flex items-center gap-1.5">
                {showTranscript ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showTranscript ? 'Ẩn transcript' : 'Xem transcript'}
              </button>
              {showTranscript && <p className="mt-2 text-xs whitespace-pre-wrap leading-relaxed text-text-secondary">{q.passage}</p>}
            </div>
          )}
        </div>
      )}

      <h4 className="font-semibold text-sm sm:text-base text-text-primary dark:text-white">{q.question}</h4>

      {(q.type === 'multiple_choice' || q.type === 'true_false') && q.options && (
        <div className="space-y-2.5">
          {q.options.map((opt) => (
            <button
              key={opt}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt)}
              className={cn(
                'w-full p-3.5 rounded-2xl border-2 text-left text-xs sm:text-sm transition-all',
                value === opt
                  ? 'border-primary-600 bg-primary-50/60 font-semibold text-primary-900'
                  : 'border-[var(--color-border)] bg-background-secondary/20 hover:border-primary-300'
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {q.type === 'fill_blank' && (
        <input
          type="text"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nhập câu trả lời..."
          className="w-full p-3 rounded-2xl text-sm bg-background-secondary/30 border border-[var(--color-border)] focus:border-primary-500 focus:outline-none"
        />
      )}

      {q.type === 'speaking' && (
        <div className="space-y-3">
          {supportsRecognition ? (
            <button
              type="button"
              onClick={toggleRecord}
              className={cn(
                'px-5 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 transition-all',
                recording ? 'bg-error text-white animate-pulse' : 'bg-pink-600 hover:bg-pink-700 text-white'
              )}
            >
              {recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {recording ? 'Đang nghe... bấm để dừng' : 'Bấm để nói'}
            </button>
          ) : (
            <p className="text-xs text-text-muted">Trình duyệt này không hỗ trợ thu âm. Hãy dùng Chrome/Edge hoặc gõ nội dung bạn muốn nói.</p>
          )}
          <textarea
            rows={3}
            disabled={disabled}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Nội dung bạn nói sẽ hiện ở đây (có thể sửa)..."
            className="w-full p-4 rounded-2xl text-sm bg-background-secondary/30 border border-[var(--color-border)] focus:border-primary-500 focus:outline-none resize-y"
          />
        </div>
      )}

      {q.type === 'essay' && (
        <div>
          <textarea
            rows={7}
            disabled={disabled}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Nhập câu trả lời bằng tiếng Anh..."
            className="w-full p-4 rounded-2xl text-xs sm:text-sm bg-background-secondary/30 border border-[var(--color-border)] focus:border-primary-500 focus:outline-none resize-y leading-relaxed"
          />
          <div className="text-right text-[11px] text-text-muted mt-1">
            {value.trim() ? value.trim().split(/\s+/).length : 0} từ
          </div>
        </div>
      )}
    </div>
  );

  // Bài đọc: đoạn văn bên trái, câu hỏi bên phải.
  if (skill === 'reading' && q.passage) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="lg:sticky lg:top-24 self-start">{passageBlock}</div>
        {answerBlock}
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {!isListening && passageBlock}
      {answerBlock}
    </div>
  );
}

function LessonPageContent() {
  const params = useParams<{ lessonId: string }>();
  const { updateProfile } = useAuthStore();
  const { addToast } = useUIStore();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('learn');
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<LessonSubmitResult | null>(null);
  const [savedTerms, setSavedTerms] = useState<Set<string>>(new Set());
  const [startedAt, setStartedAt] = useState(() => Date.now());

  useEffect(() => {
    apiGetLesson(params.lessonId)
      .then(setLesson)
      .catch((err: Error) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [params.lessonId]);

  const saveWord = async (term: string) => {
    if (!lesson) return;
    try {
      await apiSaveLessonWords(lesson.id, [term]);
      setSavedTerms((prev) => new Set(prev).add(term));
      addToast({ title: 'Đã lưu vào Từ vựng của tôi', description: term, variant: 'success' });
    } catch {
      addToast({ title: 'Không lưu được từ', variant: 'error' });
    }
  };

  const saveAllWords = async () => {
    if (!lesson) return;
    try {
      const res = await apiSaveLessonWords(lesson.id);
      setSavedTerms(new Set(lesson.vocab.map((v) => v.term)));
      addToast({ title: 'Đã lưu từ vựng', description: res.added > 0 ? `Thêm ${res.added} từ mới vào kho từ của bạn.` : 'Các từ này đã có trong kho từ của bạn.', variant: 'success' });
    } catch {
      addToast({ title: 'Không lưu được từ vựng', variant: 'error' });
    }
  };

  const handleSubmit = async () => {
    if (!lesson) return;
    setSubmitting(true);
    try {
      const res = await apiSubmitLesson({
        lesson_id: lesson.id,
        session_id: lesson.session_id,
        answers: lesson.questions.map((q) => ({ question_id: q.id, answer: answers[q.id] ?? '' })),
        time_spent_seconds: Math.round((Date.now() - startedAt) / 1000),
      });
      setResult(res);
      setPhase('result');
      updateProfile({ total_xp: res.new_total_xp, streak: res.new_streak });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      addToast({ title: 'Nộp bài thất bại', description: 'Vui lòng thử lại.', variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Làm lại: lấy bộ câu hỏi MỚI từ ngân hàng (không lặp lại câu vừa làm nếu còn câu khác)
  const retry = async () => {
    if (!lesson) return;
    try {
      const fresh = await apiGetLesson(lesson.id);
      setLesson(fresh);
    } catch {
      addToast({ title: 'Không tải được bộ câu hỏi mới', variant: 'error' });
      return;
    }
    setAnswers({});
    setResult(null);
    setQIndex(0);
    setStartedAt(Date.now());
    setPhase('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <AppLayout title="Bài học">
        <p className="text-center text-sm text-text-muted py-20">Đang tải...</p>
      </AppLayout>
    );
  }

  if (!lesson) {
    return (
      <AppLayout title="Bài học">
        <div className="text-center py-20 space-y-4">
          <Lock className="w-8 h-8 mx-auto text-text-muted" />
          <p className="text-sm text-text-muted">{loadError ?? 'Không tìm thấy bài học này.'}</p>
          <Link href="/roadmap" className="inline-block px-5 py-2.5 rounded-xl bg-primary-600 text-white text-xs font-semibold">Về Lộ Trình Học</Link>
        </div>
      </AppLayout>
    );
  }

  const SkillIcon = SKILL_ICONS[lesson.skill];
  const total = lesson.questions.length;
  const answered = lesson.questions.filter((q) => (answers[q.id] ?? '').trim().length > 0).length;
  const current = lesson.questions[qIndex];
  const resultByQuestion = new Map((result?.results ?? []).map((r) => [r.question_id, r]));

  const percent = phase === 'result' ? 100 : phase === 'learn' ? 0 : total ? Math.round((answered / total) * 90) + 5 : 5;
  const steps: { key: Phase; label: string }[] = [
    { key: 'learn', label: '1. Học' },
    { key: 'practice', label: '2. Luyện tập' },
    { key: 'result', label: '3. Kết quả' },
  ];

  return (
    <AppLayout title={lesson.title}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Thanh tiến độ & các bước */}
        <div className="sticky top-0 z-10 -mx-1 px-1 pt-1 pb-2 bg-background/90 dark:bg-gray-950/90 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <div className="flex items-center gap-3">
              {steps.map((s) => (
                <span key={s.key} className={cn(phase === s.key ? 'text-primary-700' : 'text-text-muted')}>{s.label}</span>
              ))}
            </div>
            <span className="text-text-secondary">
              {phase === 'practice' && total > 0 ? `Câu ${qIndex + 1}/${total} • đã trả lời ${answered}` : `${percent}%`}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={cn('h-full transition-all duration-300', phase === 'result' ? (result?.passed ? 'bg-success' : 'bg-warning') : 'bg-gradient-to-r from-primary-500 to-accent')}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Tiêu đề bài học */}
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-[var(--color-border)] shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                <SkillIcon className="w-3.5 h-3.5" /> {SKILL_LABELS[lesson.skill]}
              </span>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-text-primary dark:text-white mt-2">{lesson.title}</h2>
              <p className="text-xs sm:text-sm text-text-secondary dark:text-gray-400 mt-1">{lesson.description}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-text-muted flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {lesson.duration_minutes} phút</span>
              <span className="text-xs font-bold bg-cream text-primary-900 px-3 py-1 rounded-full border border-cream-dark">+{lesson.xp_reward} XP</span>
            </div>
          </div>
          {lesson.best_score != null && phase !== 'result' && (
            <p className="mt-3 text-xs text-text-secondary">Điểm cao nhất của bạn: <strong>{lesson.best_score}/100</strong> • Cần từ 70 điểm để qua bài.</p>
          )}
        </div>

        {/* ===== BƯỚC 1: HỌC ===== */}
        {phase === 'learn' && (
          <>
            {lesson.content && (
              <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-[var(--color-border)] shadow-soft">
                <h3 className="font-display font-bold text-base text-text-primary dark:text-white mb-3">Nội Dung Bài Học</h3>
                <div className="text-xs sm:text-sm text-text-secondary dark:text-gray-300 leading-relaxed">{renderLiteMarkdown(lesson.content)}</div>
              </div>
            )}

            {lesson.vocab.length > 0 && (
              <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-[var(--color-border)] shadow-soft space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display font-bold text-base text-text-primary dark:text-white">Từ vựng trong bài ({lesson.vocab.length})</h3>
                  <button type="button" onClick={saveAllWords} className="px-3.5 py-2 rounded-xl border border-primary-300 text-primary-700 hover:bg-primary-50 text-xs font-semibold flex items-center gap-1.5">
                    <BookmarkPlus className="w-3.5 h-3.5" /> Lưu tất cả vào Từ vựng của tôi
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {lesson.vocab.map((v) => (
                    <div key={v.term} className="p-4 rounded-2xl bg-background-secondary/30 border border-[var(--color-border)]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-sm text-primary-900 dark:text-white">{v.term}</div>
                          {v.pronunciation && <div className="text-[11px] text-text-muted">{v.pronunciation}</div>}
                        </div>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => speak(v.term, 0.85)} title="Nghe phát âm" className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-700"><Volume2 className="w-4 h-4" /></button>
                          <button
                            type="button"
                            onClick={() => saveWord(v.term)}
                            title="Lưu từ"
                            className={cn('p-1.5 rounded-lg hover:bg-primary-50', savedTerms.has(v.term) ? 'text-success' : 'text-primary-700')}
                          >
                            {savedTerms.has(v.term) ? <CheckCircle2 className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-text-primary dark:text-gray-200 mt-1.5">{v.definition_vi || v.definition}</p>
                      {v.definition_vi && v.definition && <p className="text-[11px] text-text-muted">{v.definition}</p>}
                      {v.example && <p className="text-[11px] italic text-text-secondary mt-1.5">“{v.example}”</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!lesson.content && lesson.vocab.length === 0 && (
              <p className="text-center text-sm text-text-muted py-6">Bài học này chưa có phần lý thuyết. Hãy chuyển sang luyện tập.</p>
            )}

            <div className="p-4 rounded-2xl bg-cream/40 border border-cream-dark/50 text-xs text-text-secondary flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <span>{SKILL_HINTS[lesson.skill]}</span>
            </div>

            <div className="text-center pb-12">
              <button
                type="button"
                onClick={() => {
                  setStartedAt(Date.now());
                  setPhase('practice');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-8 py-3.5 bg-primary-600 hover:bg-primary-hover text-white rounded-2xl font-bold shadow-soft transition-all text-sm inline-flex items-center gap-2"
              >
                {total > 0 ? `Bắt đầu luyện tập (${total} câu)` : 'Hoàn thành bài học'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* ===== BƯỚC 2: LUYỆN TẬP ===== */}
        {phase === 'practice' && (
          <>
            {total === 0 ? (
              <div className="text-center pb-12">
                <button type="button" disabled={submitting} onClick={handleSubmit} className="px-8 py-3.5 bg-primary-600 hover:bg-primary-hover text-white rounded-2xl font-bold shadow-soft text-sm disabled:opacity-50">
                  {submitting ? 'Đang lưu...' : 'Đánh dấu đã học xong'}
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {lesson.questions.map((q, i) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setQIndex(i)}
                      className={cn(
                        'w-8 h-8 rounded-full text-xs font-bold border-2 transition-all',
                        i === qIndex ? 'border-primary-600 bg-primary-600 text-white' : (answers[q.id] ?? '').trim() ? 'border-primary-300 bg-primary-50 text-primary-800' : 'border-[var(--color-border)] text-text-muted'
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-[var(--color-border)] shadow-soft">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-3">Câu {qIndex + 1} / {total}</div>
                  <QuestionView
                    key={current.id}
                    q={current}
                    skill={lesson.skill}
                    value={answers[current.id] ?? ''}
                    onChange={(v) => setAnswers((prev) => ({ ...prev, [current.id]: v }))}
                    disabled={submitting}
                  />
                </div>

                <div className="flex items-center justify-between pb-12">
                  <button
                    type="button"
                    disabled={qIndex === 0}
                    onClick={() => setQIndex((i) => i - 1)}
                    className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-text-secondary text-sm font-medium flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <ArrowLeft className="w-4 h-4" /> Câu trước
                  </button>
                  {qIndex < total - 1 ? (
                    <button type="button" onClick={() => setQIndex((i) => i + 1)} className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold flex items-center gap-1.5">
                      Câu tiếp <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={answered < total || submitting}
                      onClick={handleSubmit}
                      className="px-6 py-2.5 rounded-xl bg-accent hover:opacity-90 text-white text-sm font-bold shadow-soft disabled:opacity-40"
                    >
                      {submitting ? 'Đang chấm điểm...' : answered < total ? `Còn ${total - answered} câu chưa trả lời` : 'Nộp bài & xem kết quả'}
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* ===== BƯỚC 3: KẾT QUẢ ===== */}
        {phase === 'result' && result && (
          <>
            <div className={cn('p-6 sm:p-8 rounded-3xl border text-center space-y-3', result.passed ? 'bg-success-light/40 border-success/30' : 'bg-warning-light/40 border-warning/30')}>
              <div className={cn('w-14 h-14 rounded-full text-white flex items-center justify-center mx-auto', result.passed ? 'bg-success' : 'bg-warning')}>
                {result.passed ? <Award className="w-8 h-8" /> : <RotateCcw className="w-7 h-7" />}
              </div>
              <div className="text-5xl font-serif font-bold text-primary-900">{result.score}<span className="text-xl text-text-muted">/100</span></div>
              <h3 className="font-display font-bold text-lg text-primary-900">
                {result.passed ? 'Bạn đã qua bài học!' : `Chưa đạt (cần ${result.pass_score} điểm). Hãy xem lại lỗi sai và thử lại.`}
              </h3>
              <p className="text-xs text-text-secondary">
                Lần làm thứ {result.attempt_no}
                {result.previous_best != null && (
                  result.score > result.previous_best
                    ? ` • Tiến bộ +${result.score - result.previous_best} điểm so với điểm cao nhất trước đó (${result.previous_best})`
                    : ` • Điểm cao nhất của bạn vẫn là ${Math.max(result.previous_best, result.score)}`
                )}
                {result.xp_earned > 0 && ` • +${result.xp_earned} XP`}
                {result.words_saved > 0 && ` • Đã lưu ${result.words_saved} từ mới vào Từ vựng của tôi`}
              </p>
            </div>

            {/* Rút kinh nghiệm */}
            <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-[var(--color-border)] shadow-soft flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-text-primary dark:text-white">Nhận xét & rút kinh nghiệm</h4>
                <p className="text-xs sm:text-sm text-text-secondary dark:text-gray-300 mt-1 leading-relaxed whitespace-pre-wrap">{result.review_summary}</p>
              </div>
            </div>

            {/* Xem lại từng câu */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-base text-text-primary dark:text-white">Xem lại từng câu</h3>
              {lesson.questions.map((q, idx) => {
                const r = resultByQuestion.get(q.id);
                if (!r) return null;
                const ok = r.score >= 70;
                return (
                  <div key={q.id} className={cn('p-5 rounded-2xl border', ok ? 'border-success/30 bg-success-light/20' : 'border-warning/40 bg-warning-light/20')}>
                    <div className="flex items-start gap-2">
                      {ok ? <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-warning-dark flex-shrink-0 mt-0.5" />}
                      <div className="text-xs sm:text-sm space-y-1.5">
                        <div className="font-semibold text-text-primary dark:text-white">{idx + 1}. {q.question} <span className="text-text-muted font-normal">({r.score}/100)</span></div>
                        <div><span className="text-text-muted">Bạn trả lời:</span> {r.given || <em>(bỏ trống)</em>}</div>
                        {!ok && <div><span className="text-text-muted">Đáp án / gợi ý đúng:</span> <strong>{r.correct_answer}</strong></div>}
                        {r.feedback && <div className="text-text-secondary">{r.feedback}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hành động tiếp theo */}
            <div className="flex flex-wrap justify-center gap-3 pb-12">
              <button type="button" onClick={retry} className="px-6 py-3 rounded-2xl border border-primary-300 text-primary-700 hover:bg-primary-50 text-sm font-semibold flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> {result.passed ? 'Làm lại để cải thiện điểm' : 'Làm lại bài'}
              </button>
              {result.passed && result.roadmap_done ? (
                <Link href="/roadmap" className="px-6 py-3 rounded-2xl bg-accent text-white text-sm font-bold shadow-soft flex items-center gap-2">
                  <Trophy className="w-4 h-4" /> Hoàn thành lộ trình - làm bài tổng kết
                </Link>
              ) : result.passed && result.next_lesson_id ? (
                <Link href={`/learn/${result.next_lesson_id}`} className="px-6 py-3 rounded-2xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-bold shadow-soft flex items-center gap-2">
                  Bài kế tiếp <ArrowRight className="w-4 h-4" />
                </Link>
              ) : null}
              <Link href="/roadmap" className="px-6 py-3 rounded-2xl border border-[var(--color-border)] text-text-secondary text-sm font-medium flex items-center gap-2">
                Về Lộ Trình Học
              </Link>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
