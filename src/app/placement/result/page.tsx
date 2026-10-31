'use client';

import React, { Suspense, useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer
} from 'recharts';
import {
  ArrowRight, CheckCircle2, AlertTriangle,
  Bot, BookOpen, Volume2, PenTool, Mic, FlipHorizontal
} from 'lucide-react';
import { apiGetTestResult } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { TestResult } from '@/types';

export default function PlacementResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-sm text-text-muted">Đang tải kết quả...</p>
        </div>
      }
    >
      <PlacementResultContent />
    </Suspense>
  );
}

function PlacementResultContent() {
  const searchParams = useSearchParams();
  const { updateProfile } = useAuthStore();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    apiGetTestResult(searchParams.get('id') ?? undefined)
      .then((r) => {
        setResult(r);
        updateProfile({ current_level: r.cefr_level, placement_completed: true });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-text-muted">Đang tải kết quả...</p>
      </div>
    );
  }

  const scores = result.scores;

  const radarData = [
    { subject: 'Nghe (Listening)', score: scores.listening, fullMark: 100 },
    { subject: 'Đọc (Reading)', score: scores.reading, fullMark: 100 },
    { subject: 'Viết (Writing)', score: scores.writing, fullMark: 100 },
    { subject: 'Nói (Speaking)', score: scores.speaking, fullMark: 100 },
    { subject: 'Từ vựng (Vocab)', score: scores.vocabulary, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E3F2EF]/50 via-[#FBFDFC] to-white dark:bg-gray-950 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-light text-success font-semibold text-xs mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{result.outcome ? 'Đã hoàn thành bài kiểm tra tổng kết' : 'Đã hoàn thành đánh giá đầu vào'}</span>
          </div>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-primary-900 dark:text-white">
            {result.outcome ? 'Kết Quả Kiểm Tra Tổng Kết' : 'Báo Cáo Năng Lực Tiếng Anh Logistics'}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary dark:text-gray-400 mt-2">
            Được phân tích bởi AI Tutor dựa trên Khung tham chiếu Châu Âu (CEFR)
          </p>
        </div>

        {result.outcome && (
          <div
            className={`p-5 rounded-3xl border text-center ${
              result.outcome === 'level_up'
                ? 'bg-success-light/50 border-success/40'
                : 'bg-warning-light/50 border-warning/40'
            }`}
          >
            <h2 className="font-serif font-bold text-lg text-primary-900">
              {result.outcome === 'level_up'
                ? `Chúc mừng! Bạn đã đạt ${result.total_score}/100 và lên trình độ ${result.cefr_level}`
                : `Bạn đạt ${result.total_score}/100, cần ${result.pass_score ?? 70} điểm để lên level`}
            </h2>
            <p className="text-xs text-text-secondary mt-1.5">
              {result.outcome === 'level_up'
                ? 'Một lộ trình mới cho trình độ này đã sẵn sàng. Từ vựng bạn đã lưu vẫn được giữ nguyên.'
                : 'Đừng lo, hệ thống đã tạo lộ trình cải thiện tập trung vào phần bạn còn yếu. Học xong bạn sẽ được thi lại.'}
            </p>
          </div>
        )}

        {/* 3 Thang Điểm Quy Đổi Cạnh Nhau */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* CEFR */}
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border-2 border-primary-500 shadow-soft-lg text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-xl uppercase tracking-wider">
              Khung chuẩn
            </div>
            <span className="text-xs font-semibold text-text-muted uppercase">Trình độ CEFR</span>
            <div className="text-5xl font-serif font-bold text-primary-700 dark:text-primary-300 my-2">
              {result.cefr_level}
            </div>
            <p className="text-xs font-medium text-text-secondary dark:text-gray-300">
              {{ A1: 'Beginner (Sơ cấp)', A2: 'Elementary (Cơ bản)', B1: 'Intermediate (Trung cấp)', B2: 'Upper-Intermediate (Trung cao cấp)', C1: 'Advanced (Cao cấp)' }[result.cefr_level]}
            </p>
          </div>

          {/* TOEIC */}
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-[var(--color-border)] shadow-soft text-center">
            <span className="text-xs font-semibold text-text-muted uppercase">Tương đương TOEIC</span>
            <div className="text-4xl font-serif font-bold text-primary-800 dark:text-gray-100 my-2">
              ~{result.toeic_equivalent}
            </div>
            <p className="text-xs font-medium text-text-secondary dark:text-gray-400">
              Điểm ước lượng quy đổi
            </p>
          </div>

          {/* IELTS */}
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-[var(--color-border)] shadow-soft text-center">
            <span className="text-xs font-semibold text-text-muted uppercase">Tương đương IELTS</span>
            <div className="text-4xl font-serif font-bold text-primary-800 dark:text-gray-100 my-2">
              ~{result.ielts_equivalent}
            </div>
            <p className="text-xs font-medium text-text-secondary dark:text-gray-400">
              Band điểm ước lượng
            </p>
          </div>
        </div>

        {/* Disclaimer note */}
        <p className="text-center text-[11px] text-text-muted italic -mt-4">
          * Lưu ý: Thang điểm TOEIC và IELTS là ước lượng dựa trên ma trận kỹ năng logistics của bài test, phục vụ định hướng học tập cá nhân.
        </p>

        {/* Radar Chart & Skill Scores Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl shadow-soft border border-[var(--color-border)]">
          {/* Radar Chart */}
          <div className="flex flex-col items-center justify-center">
            <h3 className="font-serif font-bold text-base text-text-primary dark:text-white mb-2">
              Biểu Đồ Radar Năng Lực 5 Thành Phần
            </h3>
            <div className="w-full h-64 sm:h-72">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#D6EAE7" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: '#5F7370', fontSize: 11, fontWeight: 500 }}
                    />
                    <Radar
                      name="Điểm của bạn"
                      dataKey="score"
                      stroke="#2F7F7A"
                      fill="#2F7F7A"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Skill Bars */}
          <div className="flex flex-col justify-center space-y-4">
            <h3 className="font-serif font-bold text-base text-text-primary dark:text-white">
              Chi tiết Điểm số từng Kỹ năng
            </h3>
            {[
              { label: 'Đọc hiểu Chứng từ (Reading)', score: scores.reading, icon: BookOpen },
              { label: 'Từ vựng Logistics (Vocabulary)', score: scores.vocabulary, icon: FlipHorizontal },
              { label: 'Nghe hiểu Cuộc gọi (Listening)', score: scores.listening, icon: Volume2 },
              { label: 'Viết Email Nghiệp vụ (Writing)', score: scores.writing, icon: PenTool },
              { label: 'Nói & Phát âm (Speaking)', score: scores.speaking, icon: Mic },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-text-primary dark:text-gray-200 flex items-center gap-1.5">
                    <item.icon className="w-3.5 h-3.5 text-primary-600" />
                    {item.label}
                  </span>
                  <span className="font-bold text-primary-700 dark:text-primary-300">{item.score}/100</span>
                </div>
                <div className="h-2 w-full bg-background-secondary dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 rounded-full transition-all duration-500"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Điểm mạnh */}
          <div className="p-6 rounded-3xl bg-success-light/30 dark:bg-gray-900 border border-success/30 shadow-soft">
            <h3 className="font-serif font-bold text-base text-success-dark dark:text-success flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span>Điểm mạnh ghi nhận</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-text-secondary dark:text-gray-300 leading-relaxed">
              {result.strengths.map((str, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-success font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cần cải thiện */}
          <div className="p-6 rounded-3xl bg-warning-light/30 dark:bg-gray-900 border border-warning/30 shadow-soft">
            <h3 className="font-serif font-bold text-base text-warning-dark flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <span>Điểm cần ưu tiên cải thiện</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-text-secondary dark:text-gray-300 leading-relaxed">
              {result.weaknesses.map((weak, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-warning-dark font-bold">•</span>
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AI Tutor Feedback Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary-50 via-[#FFF4CC]/30 to-white dark:bg-gray-900 border border-primary-200 dark:border-gray-800 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-soft">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-primary-900 dark:text-white">
                Nhận xét & Lời khuyên từ AI Tutor
              </h3>
              <p className="text-xs text-text-secondary">Được cá nhân hóa theo hồ sơ và kết quả thi của bạn</p>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-text-secondary dark:text-gray-300 leading-relaxed whitespace-pre-wrap border-t border-primary-100 dark:border-gray-800 pt-4">
            {result.ai_feedback}
          </div>
        </div>

        {/* Bottom CTA Button */}
        <div className="text-center pt-4 pb-12">
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-hover text-white rounded-2xl font-bold shadow-soft-lg hover:shadow-card-hover transition-all text-base"
          >
            <span>Khám phá Lộ Trình Học Cá Nhân Hóa</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
