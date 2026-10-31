'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2, Lock, PlayCircle, Clock,
  Sparkles, ArrowRight, BookOpen, Volume2, PenTool, Mic,
  FlipHorizontal, HelpCircle
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { apiGetRoadmap } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { SkillType, LessonStatus, Roadmap } from '@/types';

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);

  useEffect(() => {
    apiGetRoadmap().then(setRoadmap).catch(() => {});
  }, []);

  // Icon mapping for skills
  const getSkillIcon = (skill: SkillType) => {
    switch (skill) {
      case 'listening': return <Volume2 className="w-4 h-4 text-teal-600" />;
      case 'reading': return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'writing': return <PenTool className="w-4 h-4 text-purple-600" />;
      case 'speaking': return <Mic className="w-4 h-4 text-pink-600" />;
      case 'vocabulary': return <FlipHorizontal className="w-4 h-4 text-amber-600" />;
    }
  };

  const getStatusBadge = (status: LessonStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success bg-success-light px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Đã xong
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full animate-pulse">
            <PlayCircle className="w-3 h-3" /> Đang học
          </span>
        );
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-warning-dark bg-warning-light px-2.5 py-0.5 rounded-full">
            Sẵn sàng
          </span>
        );
      case 'locked':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-muted bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-full">
            <Lock className="w-3 h-3" /> Chưa mở
          </span>
        );
    }
  };

  const getLessonHref = (skill: SkillType, lessonId: string) => {
    if (skill === 'vocabulary') return '/vocab';
    return `/learn/${lessonId}`;
  };

  if (!roadmap) {
    return (
      <AppLayout title="Lộ Trình Cá Nhân Hóa">
        <p className="text-center text-sm text-text-muted py-20">Đang tải...</p>
      </AppLayout>
    );
  }

  const allLessons = roadmap.stages.flatMap((s) => s.lessons);
  const nextLesson =
    allLessons.find((l) => l.status === 'in_progress') ??
    allLessons.find((l) => l.status === 'available') ??
    allLessons[0];

  return (
    <AppLayout title="Lộ Trình Cá Nhân Hóa">
      <div className="space-y-8">
        {/* Banner "Hôm nay học gì" Nổi Bật */}
        {nextLesson && (
          <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden shadow-soft-lg">
            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream text-primary-900 text-xs font-bold mb-3 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Hôm nay học gì?</span>
              </div>

              <h2 className="font-display font-bold text-2xl sm:text-3xl leading-tight">
                {nextLesson.title}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-white/90 leading-relaxed">
                {nextLesson.description}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link
                  href={getLessonHref(nextLesson.skill, nextLesson.id)}
                  className="px-6 py-3 bg-white text-primary-800 hover:bg-cream rounded-2xl font-bold text-xs sm:text-sm shadow-soft transition-all flex items-center gap-2"
                >
                  <span>Bắt đầu bài học ngay ({nextLesson.duration_minutes} phút)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <Clock className="w-4 h-4" />
                  <span>Thưởng +{nextLesson.xp_reward} XP sau khi xong</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Roadmap Map Timeline */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-text-primary dark:text-white">
                Bản Đồ 4 Chặng ({roadmap.total_weeks} Tuần)
              </h2>
              <p className="text-xs text-text-secondary dark:text-gray-400 mt-0.5">
                Được điều chỉnh dựa trên kết quả test đầu vào trình độ {roadmap.cefr_level} của bạn
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {roadmap.stages.map((stage) => {
              const isCurrent = stage.status === 'in_progress';
              const isCompleted = stage.status === 'completed';

              return (
                <div
                  key={stage.id}
                  className={cn(
                    'p-6 sm:p-8 rounded-3xl border transition-all',
                    isCurrent
                      ? 'bg-white dark:bg-gray-900 border-primary-500 shadow-soft-lg ring-1 ring-primary-500/30'
                      : 'bg-white/70 dark:bg-gray-900/60 border-[var(--color-border)] shadow-soft'
                  )}
                >
                  {/* Stage Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider',
                          isCurrent
                            ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-text-muted'
                        )}>
                          Chặng {stage.order} • Tuần {stage.weeks.join(', ')}
                        </span>
                        {stage.has_final && (
                          <span className="text-[10px] font-bold bg-cream text-primary-900 px-2 py-0.5 rounded-full border border-cream-dark">
                            Có bài test cuối chặng
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif font-bold text-xl text-primary-900 dark:text-white mt-1">
                        {stage.title}
                      </h3>
                      <p className="text-xs text-text-secondary dark:text-gray-400 mt-1">
                        {stage.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {stage.focus_skills.map((sk) => (
                        <span
                          key={sk}
                          className="inline-flex items-center gap-1 text-[11px] font-medium bg-background-secondary dark:bg-gray-800 px-2.5 py-1 rounded-xl text-text-secondary"
                        >
                          {getSkillIcon(sk)}
                          <span className="capitalize">{sk}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Why this stage fits you */}
                  {stage.why_this_stage && (
                    <div className="my-4 p-3.5 rounded-2xl bg-primary-50/50 dark:bg-gray-800/40 border border-primary-100 dark:border-gray-800 flex items-start gap-2.5 text-xs text-primary-900 dark:text-primary-200">
                      <HelpCircle className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                      <p>
                        <strong>Vì sao lộ trình này phù hợp với bạn:</strong> {stage.why_this_stage}
                      </p>
                    </div>
                  )}

                  {/* Lessons list */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {stage.lessons.map((lesson) => {
                      const isLocked = lesson.status === 'locked';
                      return (
                        <div
                          key={lesson.id}
                          className={cn(
                            'p-4 rounded-2xl border transition-all flex flex-col justify-between',
                            lesson.status === 'in_progress'
                              ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-950/30'
                              : 'border-[var(--color-border)] bg-background-secondary/20 dark:bg-gray-800/20'
                          )}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="flex items-center gap-1.5 text-xs text-text-muted">
                                {getSkillIcon(lesson.skill)}
                                <span className="capitalize">{lesson.skill}</span>
                              </span>
                              {getStatusBadge(lesson.status)}
                            </div>

                            <h4 className="text-sm font-semibold text-text-primary dark:text-white leading-snug">
                              {lesson.order}. {lesson.title}
                            </h4>
                            <p className="text-xs text-text-secondary dark:text-gray-400 mt-1 line-clamp-2">
                              {lesson.description}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
                            <span className="text-text-muted flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {lesson.duration_minutes} phút • +{lesson.xp_reward} XP
                            </span>

                            {!isLocked ? (
                              <Link
                                href={getLessonHref(lesson.skill, lesson.id)}
                                className="font-semibold text-primary-700 dark:text-primary-300 hover:underline flex items-center gap-1"
                              >
                                <span>{lesson.status === 'completed' ? 'Ôn lại' : 'Vào học'}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            ) : (
                              <span className="text-text-muted flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Khóa
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
