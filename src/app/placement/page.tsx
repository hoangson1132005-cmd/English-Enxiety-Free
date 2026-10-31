'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Flag, BookmarkCheck, ArrowRight, ArrowLeft,
  Volume2, Play, Pause, Mic, MicOff, AlertCircle, CheckCircle2,
  Sparkles, Bot, ShieldCheck
} from 'lucide-react';
import { apiSubmitPlacementTest, apiGetPlacementTest } from '@/lib/api';
import { useUIStore } from '@/store/uiStore';
import { formatTime, cn } from '@/lib/utils';
import type { Question, UserAnswer, SkillType, PlacementTest } from '@/types';

type TestState = 'intro' | 'testing' | 'analyzing' | 'finished';

function PlacementRunner({ test, testId }: { test: PlacementTest; testId: string | null }) {
  const router = useRouter();
  const { addToast } = useUIStore();

  const [testState, setTestState] = useState<TestState>('intro');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Time left in seconds (45 mins = 2700s)
  const [timeLeft, setTimeLeft] = useState(test.duration_minutes * 60);

  // User answers & flags
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});

  // Audio player state mock
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Voice recording mock state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);

  // AI analysis simulation step
  const [analysisStep, setAnalysisStep] = useState(0);

  // Confirm submit modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const sections = test.sections;
  const currentSection = sections[currentSectionIndex];
  const currentQuestion = currentSection.questions[currentQuestionIndex];

  // Total questions count
  const allQuestions = sections.flatMap((s) => s.questions);
  const totalQuestions = allQuestions.length;
  const answeredCount = Object.keys(answers).length;

  // Audio toggle
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = () => {
    audioRef.current?.pause();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsPlayingAudio(false);
  };

  const toggleAudio = () => {
    if (isPlayingAudio) {
      stopAudio();
      return;
    }
    if (currentQuestion.audio_url) {
      const el = new Audio(currentQuestion.audio_url);
      audioRef.current = el;
      el.onended = () => setIsPlayingAudio(false);
      el.play().catch(() => setIsPlayingAudio(false));
      setIsPlayingAudio(true);
    } else if (currentQuestion.passage && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(currentQuestion.passage);
      u.lang = 'en-US';
      u.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(u);
      setIsPlayingAudio(true);
    }
  };

  // Recording mock
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const supportsRecognition =
    typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }
    const w = window as unknown as Record<string, new () => {
      lang: string; continuous: boolean; interimResults: boolean; start: () => void; stop: () => void;
      onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
      onend: (() => void) | null; onerror: (() => void) | null;
    }>;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    const qid = currentQuestion.id;
    const rec = new Ctor();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0].transcript).join(' ');
      setRecordedAudio(text);
      setAnswers((prev) => ({ ...prev, [qid]: text }));
    };
    rec.onend = () => setIsRecording(false);
    rec.onerror = () => setIsRecording(false);
    recognitionRef.current = rec;
    rec.start();
    setIsRecording(true);
  };

  const handleSelectOption = (qId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleToggleFlag = (qId: string) => {
    setFlagged((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentQuestionIndex(sections[currentSectionIndex - 1].questions.length - 1);
    }
  };

  const handleSubmitTest = async () => {
    setShowConfirmModal(false);
    setTestState('analyzing');

    // Simulate AI multi-step analysis
    const steps = [
      'Đang chấm điểm trắc nghiệm từ vựng & đọc hiểu...',
      'AI Tutor đang phân tích bài viết của bạn...',
      'Đối chiếu dữ liệu với khung tham chiếu Châu Âu (CEFR)...',
      'Tính toán điểm quy đổi tương đương TOEIC & IELTS...',
      'Tổng hợp điểm mạnh, điểm yếu và xây dựng lộ trình học...',
    ];

    for (let i = 0; i < steps.length; i++) {
      setAnalysisStep(i);
      await new Promise((r) => setTimeout(r, 700));
    }

    try {
      const payloadAnswers: UserAnswer[] = Object.entries(answers).map(([qid, ans]) => ({
        question_id: qid,
        answer: ans,
        time_spent_seconds: 60,
      }));

      const res = await apiSubmitPlacementTest({
        answers: payloadAnswers,
        time_spent_seconds: test.duration_minutes * 60 - timeLeft,
        test_id: testId ?? undefined,
      });

      router.push(`/placement/result?id=${res.result_id}`);
    } catch {
      router.push('/placement/result');
    }
  };

  // Timer countdown
  useEffect(() => {
    if (testState !== 'testing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testState]);

  // ==========================================
  // RENDER: INTRO SCREEN
  // ==========================================
  if (testState === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#E3F2EF]/40 via-[#FBFDFC] to-white dark:bg-gray-950 py-12 px-4 sm:px-6 flex flex-col justify-center">
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-10 shadow-soft-lg border border-[var(--color-border)]">
            <div className="text-center mb-6">
              <span className="text-xs font-bold text-accent uppercase tracking-wider">{test.kind === 'level_up' ? 'Kiểm tra tổng kết lộ trình' : 'Đánh giá năng lực chuẩn xác'}</span>
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-primary-900 dark:text-white mt-1">
                {test.title}
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary dark:text-gray-400 mt-2">
                {test.description}
              </p>
            </div>

            {/* Test Structure info cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
              {[
                { label: 'Thời lượng', val: `${test.duration_minutes} Phút`, icon: Clock },
                { label: 'Tổng số câu', val: `${totalQuestions} Câu hỏi`, icon: BookmarkCheck },
                { label: 'Khung đánh giá', val: 'A1 – C1 CEFR', icon: Sparkles },
                { label: 'AI Chấm điểm', val: 'Tức thì', icon: Bot },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-background-secondary/50 dark:bg-gray-800 border border-primary-100 dark:border-gray-700 text-center">
                  <item.icon className="w-5 h-5 text-primary-600 dark:text-primary-400 mx-auto mb-1" />
                  <div className="text-xs font-bold text-text-primary dark:text-white">{item.val}</div>
                  <div className="text-[10px] text-text-muted mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Sections breakdown */}
            <div className="space-y-2.5 my-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary dark:text-gray-300">
                Cấu trúc các phần thi:
              </h3>
              {sections.map((sec, i) => (
                <div key={sec.id} className="flex items-center justify-between p-3 rounded-xl bg-background-secondary/30 dark:bg-gray-800/40 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center text-[10px]">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-text-primary dark:text-gray-200">{sec.title}</span>
                  </div>
                  <span className="text-text-muted">{sec.questions.length} câu{sec.time_limit_minutes ? ` • ${sec.time_limit_minutes} phút` : ''}</span>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div className="p-4 rounded-2xl bg-cream/40 dark:bg-gray-800 border border-cream-dark/50 text-xs text-text-secondary dark:text-gray-300 space-y-1.5 leading-relaxed">
              <div className="font-semibold text-text-primary dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary-600" />
                Lưu ý quan trọng:
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>Làm bài nghiêm túc, không tra từ điển để AI Tutor xây dựng lộ trình đúng năng lực thực tế của bạn.</li>
                <li>Phần <strong>Nói (Speaking)</strong> là tùy chọn, bạn có thể hoàn thành hoặc bấm <em>Bỏ qua</em>.</li>
                <li>Hệ thống tự động lưu nháp câu trả lời, không lo mất dữ liệu nếu rớt mạng.</li>
              </ul>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setTestState('testing')}
                className="w-full sm:w-auto px-8 py-3.5 bg-primary-600 hover:bg-primary-hover text-white rounded-2xl font-semibold shadow-soft-lg transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>Bắt đầu làm bài thi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: AI ANALYZING SCREEN
  // ==========================================
  if (testState === 'analyzing') {
    const steps = [
      'Đang chấm điểm trắc nghiệm từ vựng & đọc hiểu...',
      'AI Tutor đang phân tích bài viết của bạn...',
      'Đối chiếu dữ liệu với khung tham chiếu Châu Âu (CEFR)...',
      'Tính toán điểm quy đổi tương đương TOEIC & IELTS...',
      'Tổng hợp điểm mạnh, điểm yếu và xây dựng lộ trình học...',
    ];

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#E3F2EF]/60 via-[#FFF4CC]/30 to-white dark:bg-gray-950 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full shadow-soft-lg border border-[var(--color-border)] text-center"
        >
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-primary-100 dark:border-primary-900/40" />
            <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-primary-600">
              <Sparkles className="w-8 h-8 text-accent animate-pulse" />
            </div>
          </div>

          <h2 className="font-serif font-bold text-2xl text-primary-900 dark:text-white mb-2">
            AI đang phân tích kết quả
          </h2>
          <p className="text-xs text-text-secondary dark:text-gray-400 mb-6">
            Đang chấm bài và quy đổi sang các thang điểm quốc tế...
          </p>

          <div className="space-y-3 text-left">
            {steps.map((text, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex items-center gap-2.5 text-xs p-2.5 rounded-xl transition-all',
                  idx < analysisStep
                    ? 'text-success bg-success-light/40 dark:bg-success-dark/20 font-medium'
                    : idx === analysisStep
                    ? 'text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 font-semibold'
                    : 'text-text-muted opacity-40'
                )}
              >
                {idx < analysisStep ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-current flex-shrink-0" />
                )}
                <span>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // ==========================================
  // RENDER: TESTING SCREEN
  // ==========================================
  const wordCount = (answers[currentQuestion.id] || '').trim().split(/\s+/).filter(Boolean).length;
  const isFlagged = flagged[currentQuestion.id] || false;

  return (
    <div className="min-h-screen bg-[#FBFDFC] dark:bg-gray-950 flex flex-col">
      {/* Top Header / Progress */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-[var(--color-border)] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-text-muted">Phần {currentSectionIndex + 1}/{sections.length}: <strong className="text-text-primary dark:text-white">{currentSection.title}</strong></div>
            <div className="text-xs font-semibold text-primary-700 dark:text-primary-300">
              Câu hỏi {currentQuestionIndex + 1} / {currentSection.questions.length}
            </div>
          </div>

          {/* Timer */}
          <div className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-mono font-bold shadow-sm',
            timeLeft < 300
              ? 'bg-error-light border-error text-error animate-pulse'
              : 'bg-primary-50 dark:bg-gray-800 border-primary-200 dark:border-gray-700 text-primary-700 dark:text-primary-300'
          )}>
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          {/* Quick Submit button */}
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-xs font-semibold transition-all shadow-soft"
          >
            Nộp bài
          </button>
        </div>
      </header>

      {/* Main Question Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 pb-28">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-soft border border-[var(--color-border)]">
          {/* Section banner & Flag */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--color-border)]">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300">
              Chủ đề: {currentQuestion.topic.toUpperCase()} • Level {currentQuestion.level}
            </span>

            <button
              type="button"
              onClick={() => handleToggleFlag(currentQuestion.id)}
              className={cn(
                'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all',
                isFlagged
                  ? 'border-warning bg-warning-light text-warning-dark font-semibold'
                  : 'border-[var(--color-border)] text-text-muted hover:text-text-primary'
              )}
            >
              <Flag className={cn('w-3.5 h-3.5', isFlagged && 'fill-warning-dark')} />
              <span>{isFlagged ? 'Đã đánh dấu xem lại' : 'Đánh dấu xem lại'}</span>
            </button>
          </div>

          {/* Instructions */}
          <p className="text-xs text-text-muted italic mb-4">
            {currentSection.instructions}
          </p>

          {/* Passage if reading (bài nghe: đoạn văn là transcript nên không hiển thị) */}
          {currentQuestion.passage && currentQuestion.skill !== 'listening' && (
            <div className="p-4 rounded-2xl bg-background-secondary/60 dark:bg-gray-800/60 border border-[var(--color-border)] mb-6 text-xs sm:text-sm font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {currentQuestion.passage}
            </div>
          )}

          {/* Audio Player if listening */}
          {(currentQuestion.audio_url || (currentQuestion.skill === 'listening' && currentQuestion.passage)) && (
            <div className="p-4 rounded-2xl bg-primary-50/50 dark:bg-gray-800 border border-primary-200/60 dark:border-gray-700 mb-6 flex items-center gap-4">
              <button
                type="button"
                onClick={toggleAudio}
                className="w-12 h-12 rounded-2xl bg-primary-600 hover:bg-primary-hover text-white flex items-center justify-center shadow-soft flex-shrink-0"
              >
                {isPlayingAudio ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </button>
              <div className="flex-1">
                <div className="text-xs font-semibold text-primary-800 dark:text-primary-300 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-primary-600" />
                  <span>Bài nghe: bấm nút để nghe, bạn có thể nghe lại</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full bg-primary-500 transition-all duration-300', isPlayingAudio ? 'w-2/3' : 'w-0')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Question Text */}
          <h2 className="text-sm sm:text-base font-semibold text-text-primary dark:text-white mb-6 leading-relaxed whitespace-pre-wrap">
            {currentQuestion.question}
          </h2>

          {/* Options / Input types */}
          {currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = answers[currentQuestion.id] === opt;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(currentQuestion.id, opt)}
                    className={cn(
                      'w-full p-4 rounded-2xl border-2 text-left text-xs sm:text-sm transition-all flex items-start gap-3',
                      isSelected
                        ? 'border-primary-600 bg-primary-50/60 dark:bg-primary-950/40 font-semibold text-primary-900 dark:text-primary-200 shadow-sm'
                        : 'border-[var(--color-border)] hover:border-primary-300 bg-background-secondary/20 text-text-secondary dark:text-gray-300'
                    )}
                  >
                    <span className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5',
                      isSelected
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-gray-800 border border-[var(--color-border)] text-text-muted'
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Essay (Writing) */}
          {currentQuestion.type === 'essay' && (
            <div className="space-y-2">
              <textarea
                rows={8}
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                placeholder="Nhập câu trả lời bằng tiếng Anh của bạn tại đây..."
                className="w-full p-4 rounded-2xl text-xs sm:text-sm bg-background-secondary/50 dark:bg-gray-800 border border-[var(--color-border)] focus:border-primary-500 focus:outline-none transition-all resize-y leading-relaxed"
              />
              <div className="flex justify-between items-center text-xs text-text-muted">
                <span>Giới hạn yêu cầu: 80 - 120 từ</span>
                <span className={cn(wordCount > 120 ? 'text-warning-dark font-semibold' : '')}>
                  Đã viết: <strong>{wordCount}</strong> từ
                </span>
              </div>
            </div>
          )}

          {/* Speaking (Voice) */}
          {currentQuestion.type === 'speaking' && (
            <div className="p-6 rounded-3xl bg-background-secondary/40 dark:bg-gray-800 border border-[var(--color-border)] text-center space-y-4">
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-soft-lg',
                    isRecording ? 'bg-error animate-pulse' : 'bg-primary-600 hover:bg-primary-hover'
                  )}
                >
                  {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold text-text-primary dark:text-white">
                  {isRecording ? 'Đang nghe giọng nói của bạn... bấm lại để dừng' : recordedAudio ? 'Đã ghi nhận câu trả lời. Bạn có thể sửa lại bên dưới.' : supportsRecognition ? 'Bấm vào micro để bắt đầu nói' : 'Trình duyệt không hỗ trợ thu âm, hãy gõ câu trả lời bên dưới'}
                </p>
                <p className="text-[11px] text-text-muted mt-1">
                  Trình duyệt sẽ nhận dạng giọng nói của bạn thành văn bản để AI chấm điểm.
                </p>
              </div>

              <textarea
                rows={3}
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                placeholder="Nội dung bạn nói sẽ hiện ở đây, có thể sửa hoặc tự gõ..."
                className="w-full p-3 rounded-2xl text-xs sm:text-sm bg-white dark:bg-gray-900 border border-[var(--color-border)] focus:border-primary-500 focus:outline-none resize-y text-left"
              />

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleNext}
                  className="text-xs text-text-muted hover:text-text-primary underline"
                >
                  Bỏ qua phần Nói (Tùy chọn)
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Sticky Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-[var(--color-border)] py-3 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            type="button"
            disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
            onClick={handlePrev}
            className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-text-secondary hover:bg-background-secondary disabled:opacity-30 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Câu trước</span>
          </button>

          {/* Quick summary dot counter */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-xs text-text-muted">
              Đã làm: <strong>{answeredCount}</strong>/{totalQuestions}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-xs font-semibold transition-all shadow-soft flex items-center gap-1.5"
          >
            <span>{currentSectionIndex === sections.length - 1 && currentQuestionIndex === currentSection.questions.length - 1 ? 'Hoàn thành' : 'Câu tiếp theo'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* CONFIRM SUBMIT MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-sm w-full p-6 shadow-soft-lg border border-[var(--color-border)] text-center">
            <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mx-auto mb-3">
              <BookmarkCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-primary-900 dark:text-white">
              Xác nhận nộp bài thi?
            </h3>
            <p className="text-xs text-text-secondary dark:text-gray-300 mt-2 leading-relaxed">
              Bạn đã hoàn thành <strong>{answeredCount}/{totalQuestions}</strong> câu hỏi. Sau khi nộp, AI Tutor sẽ phân tích chi tiết kết quả.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-text-secondary text-xs font-semibold hover:bg-background-secondary"
              >
                Tiếp tục làm bài
              </button>
              <button
                type="button"
                onClick={handleSubmitTest}
                className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-xs font-semibold shadow-soft"
              >
                Nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlacementLoader() {
  const searchParams = useSearchParams();
  const testId = searchParams.get('exam');
  const [test, setTest] = useState<PlacementTest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGetPlacementTest(testId ?? undefined)
      .then(setTest)
      .catch(() => setError('Không tải được đề thi. Vui lòng liên hệ quản trị viên.'));
  }, [testId]);

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-text-muted px-6 text-center">{error}</div>;
  }
  if (!test) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-text-muted">Đang tải đề thi...</div>;
  }
  return <PlacementRunner test={test} testId={testId} />;
}

export default function PlacementTestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-text-muted">Đang tải...</div>}>
      <PlacementLoader />
    </Suspense>
  );
}
