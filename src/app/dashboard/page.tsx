'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Flame, Award, Clock, ArrowRight,
  AlertTriangle, Play, FlipHorizontal, Target, Wrench, Languages
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/store/authStore';
import { apiGetDashboard } from '@/lib/api';
import { FACULTY_GROUP_LABELS } from '@/types';
import type { SkillProgress } from '@/types';

const SKILL_LABELS: Record<string, string> = {
  listening: 'Nghe', reading: 'Đọc', writing: 'Viết', speaking: 'Nói', vocabulary: 'Từ vựng',
};
const SKILL_LINKS: Record<string, string> = {
  listening: '/roadmap', reading: '/roadmap', writing: '/roadmap', speaking: '/roadmap', vocabulary: '/vocab',
};

interface DashboardData {
  weekly_stats: { daily_breakdown: { day_label: string; minutes: number; xp: number }[]; total_minutes: number };
  skill_progress: SkillProgress[];
  due_vocab: { term: string; meaning: string }[];
}

export default function DashboardPage() {
  const { profile } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    apiGetDashboard().then(setData).catch(() => {});
  }, []);

  const weeklyData = data?.weekly_stats.daily_breakdown.map((d) => ({
    name: d.day_label,
    minutes: d.minutes,
  })) ?? [];

  const skillChartData = data?.skill_progress.map((s) => ({
    name: SKILL_LABELS[s.skill] ?? s.skill,
    score: s.score,
  })) ?? [];

  const weakSkills = (data?.skill_progress ?? [])
    .filter((s) => s.score > 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, 2);

  const facultyLabel = profile?.faculty_group
    ? FACULTY_GROUP_LABELS[profile.faculty_group]
    : 'Kỹ thuật / Kinh tế';

  return (
    <AppLayout title="Tổng Quan Học Tập">
      <div className="space-y-8">
        {/* WELCOME BANNER WITH USER PROFILE & FACULTY BADGE */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white shadow-soft-lg relative overflow-hidden">

          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm text-cream flex items-center gap-1.5">
                {profile?.faculty_group === 'language' ? (
                  <Languages className="w-3.5 h-3.5" />
                ) : (
                  <Wrench className="w-3.5 h-3.5" />
                )}
                <span>Khối: {facultyLabel}</span>
              </span>
              <span className="text-xs bg-white/10 px-3 py-1 rounded-full">
                Ngành: {profile?.major || 'Logistics & Chuỗi cung ứng'}
              </span>
            </div>

            <div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl">
                Xin chào, {profile?.full_name || 'bạn'}!
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-white/90 leading-relaxed">
                Mục tiêu hôm nay: Dành <strong>{profile?.daily_minutes || 20} phút</strong> để ôn tập thuật ngữ vận đơn đường biển và nghe hội thoại booking.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/roadmap"
                className="px-6 py-3 bg-white text-primary-800 hover:bg-cream rounded-2xl font-bold text-xs sm:text-sm shadow-soft transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-primary-800" />
                <span>Tiếp tục bài học dở dang</span>
              </Link>
              <Link href="/roadmap" className="text-xs text-white/80 hover:text-white underline">
                Xem lộ trình đầy đủ
              </Link>
            </div>
          </div>
        </div>

        {/* 4 STATS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* STREAK */}
          <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-[var(--color-border)] shadow-soft flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-warning-light text-warning-dark flex items-center justify-center flex-shrink-0">
              <Flame className="w-6 h-6 fill-warning-dark" />
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-text-primary dark:text-white">
                {profile?.streak ?? 0} <span className="text-xs font-normal text-text-muted">ngày</span>
              </div>
              <div className="text-xs text-text-muted">Chuỗi học tập</div>
            </div>
          </div>

          {/* XP */}
          <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-[var(--color-border)] shadow-soft flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-text-primary dark:text-white">
                {profile?.total_xp ?? 0}
              </div>
              <div className="text-xs text-text-muted">Tổng điểm XP</div>
            </div>
          </div>

          {/* CEFR LEVEL */}
          <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-[var(--color-border)] shadow-soft flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-light text-accent-dark flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-text-primary dark:text-white">
                {profile?.current_level ?? 'A1'}
              </div>
              <div className="text-xs text-text-muted">Cấp độ CEFR</div>
            </div>
          </div>

          {/* TIME STUDIED */}
          <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-[var(--color-border)] shadow-soft flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-background-secondary text-primary-700 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-text-primary dark:text-white">
                {data?.weekly_stats.total_minutes ?? 0} <span className="text-xs font-normal text-text-muted">phút</span>
              </div>
              <div className="text-xs text-text-muted">Tuần này</div>
            </div>
          </div>
        </div>

        {/* CHARTS: WEEKLY TIME & SKILL SCORES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* BAR CHART: WEEKLY STUDY TIME */}
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-[var(--color-border)] shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-text-primary dark:text-white">
                  Thời Gian Học Trong Tuần (Phút)
                </h3>
                <p className="text-xs text-text-muted">Mục tiêu {profile?.daily_minutes || 20} phút/ngày</p>
              </div>
              <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-xl">
                Tổng: {data?.weekly_stats.total_minutes ?? 0}p
              </span>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3F2EF" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5F7370' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#5F7370' }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: '1px solid #D6EAE7',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="minutes" fill="#2F7F7A" radius={[8, 8, 0, 0]} name="Phút học" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* BAR CHART: SKILL SCORES */}
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-[var(--color-border)] shadow-soft space-y-4">
            <div>
              <h3 className="font-display font-bold text-base text-text-primary dark:text-white">
                Điểm Theo 5 Kỹ Năng
              </h3>
              <p className="text-xs text-text-muted">Dựa trên bài test đầu vào gần nhất</p>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3F2EF" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5F7370' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#5F7370' }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: '1px solid #D6EAE7',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="score" fill="#2F7F7A" radius={[8, 8, 0, 0]} name="Điểm" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: ĐIỂM YẾU CẦN ÔN & TỪ CẦN ÔN HÔM NAY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Điểm yếu cần ôn */}
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-[var(--color-border)] shadow-soft space-y-4">
            <h4 className="font-display font-bold text-base text-text-primary dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <span>Kỹ Năng Cần Ưu Tiên Ôn Luyện</span>
            </h4>

            <div className="space-y-3">
              {weakSkills.length === 0 && (
                <p className="text-xs text-text-muted">
                  Hoàn thành <Link href="/placement" className="text-primary-700 underline">bài test đầu vào</Link> để xem phân tích điểm yếu theo kỹ năng.
                </p>
              )}
              {weakSkills.map((s) => (
                <div
                  key={s.skill}
                  className="p-3.5 rounded-2xl bg-background-secondary/30 dark:bg-gray-800 border border-[var(--color-border)] flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-bold text-text-primary dark:text-white">{SKILL_LABELS[s.skill]}</h5>
                    <p className="text-[11px] text-text-secondary dark:text-gray-400 mt-0.5">Điểm hiện tại: {s.score}/100</p>
                  </div>
                  <Link
                    href={SKILL_LINKS[s.skill]}
                    className="p-2 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Flashcard cần ôn hôm nay */}
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-[var(--color-border)] shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-base text-text-primary dark:text-white flex items-center gap-2">
                <FlipHorizontal className="w-5 h-5 text-accent" />
                <span>Từ Vựng Cần Ôn Hôm Nay (SRS)</span>
              </h4>
              <Link href="/vocab" className="text-xs text-primary-700 dark:text-primary-300 font-semibold hover:underline">
                Xem tất cả
              </Link>
            </div>

            <div className="space-y-3">
              {(!data || data.due_vocab.length === 0) && (
                <p className="text-xs text-text-muted">Không có từ nào cần ôn hôm nay.</p>
              )}
              {data?.due_vocab.map((card, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-cream/40 dark:bg-gray-800 border border-cream-dark/50 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-primary-900 dark:text-cream">{card.term}</div>
                    <div className="text-[11px] text-text-secondary dark:text-gray-300 mt-0.5">{card.meaning}</div>
                  </div>
                  <span className="text-[10px] font-bold bg-warning-light text-warning-dark px-2 py-0.5 rounded-full">
                    Hôm nay
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
