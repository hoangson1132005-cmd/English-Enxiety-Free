'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, Volume2, PenTool, Mic, FlipHorizontal,
  CheckCircle2, XCircle, Award, ArrowRight, Clock,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { apiGetLesson, apiSubmitLesson } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import type { LessonDetail, SkillType } from '@/types';

const SKILL_LABELS: Record<SkillType, string> = {
  listening: 'Nghe', reading: 'Đọc', writing: 'Viết', speaking: 'Nói', vocabulary: 'Từ vựng',
};
const SKILL_ICONS: Record<SkillType, React.ElementType> = {
  listening: Volume2, reading: BookOpen, writing: PenTool, speaking: Mic, vocabulary: FlipHorizontal,
};

function renderLiteMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
      part.startsWith('**') && part.endsWith('**') ? <strong key={j}>{part.slice(2, -2)}</strong> : part
    );
    return (
      <p key={i} className="mb-1.5">
        {parts}
      </p>
    );
  });
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

function LessonPageContent() {
  const params = useParams<{ lessonId: string }>();
  const { updateProfile } = useAuthStore();
  const { addToast } = useUIStore();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    score: number; xp_earned: number; results: { question_id: string; score: number; feedback: string }[];
  } | null>(null);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    apiGetLesson(params.lessonId)
      .then(setLesson)
      .catch(() => addToast({ title: 'Không tìm thấy bài học', variant: 'error' }))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.lessonId]);

  const handleSubmit = async () => {
    if (!lesson) return;
    setSubmitting(true);
    try {
      const timeSpentSeconds = Math.round((Date.now() - startedAt.current) / 1000);
      const res = await apiSubmitLesson({
        lesson_id: lesson.id,
        answers: lesson.questions.map((q) => ({ question_id: q.id, answer: answers[q.id] ?? '' })),
        time_spent_seconds: timeSpentSeconds,
      });
      setSubmitResult(res);
      updateProfile({ total_xp: res.new_total_xp, streak: res.new_streak });
      addToast({
        title: 'Hoàn thành bài học!',
        description: `Điểm: ${res.score}/100. Thưởng +${res.xp_earned} XP!`,
        variant: 'success',
      });
    } catch {
      addToast({ title: 'Nộp bài thất bại', description: 'Vui lòng thử lại.', variant: 'error' });
    } finally {
      setSubmitting(false);
    }
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
        <p className="text-center text-sm text-text-muted py-20">Không tìm thấy bài học này.</p>
      </AppLayout>
    );
  }

  const SkillIcon = SKILL_ICONS[lesson.skill];
  const allAnswered = lesson.questions.every((q) => (answers[q.id] ?? '').trim().length > 0);
  const resultByQuestion = new Map((submitResult?.results ?? []).map((r) => [r.question_id, r]));

  const totalQuestions = lesson.questions.length;
  const answeredCount = lesson.questions.filter((q) => (answers[q.id] ?? '').trim().length > 0).length;
  const progressPercent = submitResult
    ? 100
    : totalQuestions > 0
      ? Math.round((answeredCount / totalQuestions) * 100)
      : 0;

  return (
    <AppLayout title={lesson.title}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* PROGRESS BAR */}
        <div className="sticky top-0 z-10 -mx-1 px-1 pt-1 pb-2 bg-background/90 dark:bg-gray-950/90 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-text-secondary dark:text-gray-400 mb-1.5">
            <span>
              {totalQuestions > 0
                ? submitResult
                  ? 'Đã hoàn thành bài học'
                  : `Đã trả lời ${answeredCount}/${totalQuestions} câu hỏi`
                : 'Đọc nội dung và đánh dấu hoàn thành'}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                submitResult ? 'bg-success' : 'bg-gradient-to-r from-primary-500 to-accent'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* HEADER */}
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-[var(--color-border)] shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                <SkillIcon className="w-3.5 h-3.5" />
                {SKILL_LABELS[lesson.skill]}
              </span>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-text-primary dark:text-white mt-2">
                {lesson.title}
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary dark:text-gray-400 mt-1">{lesson.description}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-text-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {lesson.duration_minutes} phút
              </span>
              <span className="text-xs font-bold bg-cream text-primary-900 px-3 py-1 rounded-full border border-cream-dark">
                +{lesson.xp_reward} XP
              </span>
            </div>
          </div>
        </div>

        {/* TEACHING CONTENT */}
        {lesson.content && (
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-[var(--color-border)] shadow-soft">
            <h3 className="font-display font-bold text-base text-text-primary dark:text-white mb-3">Nội Dung Bài Học</h3>
            <div className="prose-logistics text-xs sm:text-sm text-text-secondary dark:text-gray-300">
              {renderLiteMarkdown(lesson.content)}
            </div>
          </div>
        )}

        {/* QUESTIONS */}
        {lesson.questions.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg text-text-primary dark:text-white">
              Luyện Tập & Ôn Lại Kiến Thức <span className="text-text-muted text-sm font-normal">({totalQuestions} câu hỏi)</span>
            </h3>
            {lesson.questions.map((q, idx) => {
              const result = resultByQuestion.get(q.id);
              return (
                <div key={q.id} className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-[var(--color-border)] shadow-soft">
                  {q.passage && (
                    <div className="mb-4 p-4 rounded-2xl bg-background-secondary/60 dark:bg-gray-800/60 border border-[var(--color-border)] text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                      {q.passage}
                    </div>
                  )}
                  {q.audio_url && (
                    <audio controls src={q.audio_url} className="w-full mb-4" />
                  )}

                  <h4 className="font-semibold text-sm sm:text-base text-text-primary dark:text-white mb-4">
                    {idx + 1}. {q.question}
                  </h4>

                  {(q.type === 'multiple_choice' || q.type === 'true_false') && q.options && (
                    <div className="space-y-2.5">
                      {q.options.map((opt) => {
                        const isSelected = answers[q.id] === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            disabled={!!submitResult}
                            onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                            className={cn(
                              'w-full p-3.5 rounded-2xl border-2 text-left text-xs sm:text-sm transition-all',
                              isSelected
                                ? 'border-primary-600 bg-primary-50/60 font-semibold text-primary-900'
                                : 'border-[var(--color-border)] bg-background-secondary/20 hover:border-primary-300'
                            )}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {q.type === 'fill_blank' && (
                    <input
                      type="text"
                      disabled={!!submitResult}
                      value={answers[q.id] ?? ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      placeholder="Nhập câu trả lời..."
                      className="w-full p-3 rounded-2xl text-sm bg-background-secondary/30 border border-[var(--color-border)] focus:border-primary-500 focus:outline-none"
                    />
                  )}

                  {(q.type === 'essay' || q.type === 'speaking') && (
                    <textarea
                      rows={q.type === 'essay' ? 6 : 3}
                      disabled={!!submitResult}
                      value={answers[q.id] ?? ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      placeholder={q.type === 'speaking' ? 'Nhập lại nội dung bạn muốn nói (transcript)...' : 'Nhập câu trả lời bằng tiếng Anh...'}
                      className="w-full p-4 rounded-2xl text-xs sm:text-sm bg-background-secondary/30 border border-[var(--color-border)] focus:border-primary-500 focus:outline-none resize-y leading-relaxed"
                    />
                  )}

                  {result && (
                    <div
                      className={cn(
                        'mt-4 p-3 rounded-xl text-xs leading-relaxed border flex items-start gap-2',
                        result.score >= 70
                          ? 'bg-success-light/40 border-success/30 text-success-dark'
                          : 'bg-warning-light/40 border-warning/30 text-warning-dark'
                      )}
                    >
                      {result.score >= 70 ? (
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      )}
                      <span>
                        <strong>{result.score}/100.</strong> {result.feedback}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* SUBMIT / RESULT */}
        <div className="text-center pt-2 pb-12">
          {!submitResult ? (
            lesson.questions.length > 0 ? (
              <button
                type="button"
                disabled={!allAnswered || submitting}
                onClick={handleSubmit}
                className="px-8 py-3.5 bg-primary-600 hover:bg-primary-hover text-white rounded-2xl font-bold shadow-soft transition-all text-sm disabled:opacity-40"
              >
                {submitting ? 'Đang chấm điểm...' : 'Nộp bài & Nhận điểm'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-3.5 bg-primary-600 hover:bg-primary-hover text-white rounded-2xl font-bold shadow-soft transition-all text-sm"
              >
                Đánh dấu đã học xong
              </button>
            )
          ) : (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-success-light/40 via-cream/30 to-white border border-success/30 shadow-soft max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-success text-white flex items-center justify-center mx-auto">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="font-display font-bold text-lg text-primary-900">Chúc mừng bạn đã hoàn thành bài học!</h3>
              <p className="text-xs text-text-secondary">
                Điểm: <strong>{submitResult.score}/100</strong> — Đã cộng <strong>+{submitResult.xp_earned} XP</strong>.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Link
                  href="/roadmap"
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-xs shadow-soft hover:bg-primary-hover flex items-center gap-1.5"
                >
                  <span>Về Lộ Trình Học</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
