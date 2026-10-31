'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2, Lock, PlayCircle, Clock, Sparkles, ArrowRight, BookOpen, Volume2, PenTool, Mic,
  FlipHorizontal, HelpCircle, Trophy, Plus, X, History, Target,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { apiGetRoadmap, apiRespondSuggestion, apiStartExam } from '@/lib/api';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import type { SkillType, RoadmapItemStatus, RoadmapItemView, RoadmapView } from '@/types';

const SKILL_LABELS: Record<SkillType, string> = {
  listening: 'Nghe', reading: 'Đọc', writing: 'Viết', speaking: 'Nói', vocabulary: 'Từ vựng',
};

const KIND_LABELS: Record<string, string> = {
  initial: 'Lộ trình đầu tiên',
  level_up: 'Lộ trình sau khi lên level',
  improve: 'Lộ trình cải thiện',
};

function SkillIcon({ skill }: { skill: SkillType }) {
  switch (skill) {
    case 'listening': return <Volume2 className="w-4 h-4 text-teal-600" />;
    case 'reading': return <BookOpen className="w-4 h-4 text-blue-600" />;
    case 'writing': return <PenTool className="w-4 h-4 text-purple-600" />;
    case 'speaking': return <Mic className="w-4 h-4 text-pink-600" />;
    case 'vocabulary': return <FlipHorizontal className="w-4 h-4 text-amber-600" />;
  }
}

function StatusBadge({ status, score }: { status: RoadmapItemStatus; score: number | null }) {
  switch (status) {
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success bg-success-light px-2.5 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3" /> Đã xong{score != null ? ` • ${score}đ` : ''}
        </span>
      );
    case 'in_progress':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full">
          <PlayCircle className="w-3 h-3" /> Đang học{score != null ? ` • tốt nhất ${score}đ` : ''}
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
}

export default function RoadmapPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const [data, setData] = useState<RoadmapView | null>(null);
  const [failed, setFailed] = useState(false);
  const [startingExam, setStartingExam] = useState(false);

  const load = useCallback(() => {
    apiGetRoadmap().then(setData).catch(() => setFailed(true));
  }, []);

  useEffect(load, [load]);

  const respond = async (itemId: string, action: 'accept' | 'dismiss') => {
    try {
      await apiRespondSuggestion(itemId, action);
      addToast({ title: action === 'accept' ? 'Đã thêm vào lộ trình' : 'Đã bỏ qua đề xuất', variant: 'success' });
      load();
    } catch {
      addToast({ title: 'Có lỗi xảy ra', description: 'Vui lòng thử lại.', variant: 'error' });
    }
  };

  const startExam = async () => {
    setStartingExam(true);
    try {
      const { test_id } = await apiStartExam();
      router.push(`/placement?exam=${test_id}`);
    } catch (err) {
      addToast({ title: 'Chưa mở được bài kiểm tra', description: (err as Error).message, variant: 'error' });
      setStartingExam(false);
    }
  };

  if (failed) {
    return (
      <AppLayout title="Lộ Trình Cá Nhân Hóa">
        <p className="text-center text-sm text-text-muted py-20">Không tải được lộ trình. Vui lòng tải lại trang.</p>
      </AppLayout>
    );
  }
  if (!data) {
    return (
      <AppLayout title="Lộ Trình Cá Nhân Hóa">
        <p className="text-center text-sm text-text-muted py-20">Đang tải lộ trình...</p>
      </AppLayout>
    );
  }

  const { roadmap, progress, stages, suggestions, all_done: allDone } = data;
  const allItems = stages.flatMap((s) => s.items);
  const nextItem: RoadmapItemView | undefined = allItems.find((i) => i.item_id === data.next_item_id);
  const isEmpty = allItems.length === 0;

  return (
    <AppLayout title="Lộ Trình Cá Nhân Hóa">
      <div className="space-y-8">
        {/* Tổng quan lộ trình */}
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-[var(--color-border)] shadow-soft space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-800 uppercase tracking-wider">
                  Chu kỳ {roadmap.cycle} • Trình độ {data.user_level}
                </span>
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-cream text-primary-900 border border-cream-dark">
                  {KIND_LABELS[roadmap.kind] ?? roadmap.kind}
                </span>
                <span className="text-[11px] text-text-muted">
                  {roadmap.generated_by === 'admin' ? 'Do giáo viên điều chỉnh' : roadmap.generated_by === 'ai' ? 'AI thiết kế riêng cho bạn' : 'Thiết kế theo giáo trình'}
                </span>
              </div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-text-primary dark:text-white mt-2">
                Lộ trình học của bạn
              </h2>
            </div>
            <div className="flex items-center gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-700">{progress.done}/{progress.total}</div>
                <div className="text-[11px] text-text-muted">bài hoàn thành</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-700">{progress.avg_score ?? '—'}</div>
                <div className="text-[11px] text-text-muted">điểm trung bình</div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-text-secondary mb-1.5">
              <span>Tiến độ</span>
              <span>{progress.percent}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-500 to-accent transition-all" style={{ width: `${progress.percent}%` }} />
            </div>
          </div>

          {roadmap.rationale && (
            <div className="p-3.5 rounded-2xl bg-primary-50/50 dark:bg-gray-800/40 border border-primary-100 dark:border-gray-800 flex items-start gap-2.5 text-xs text-primary-900 dark:text-primary-200">
              <HelpCircle className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Vì sao lộ trình này phù hợp với bạn:</strong> {roadmap.rationale}
                {roadmap.focus_skills.length > 0 && (
                  <span className="inline-flex items-center gap-1 ml-2">
                    <Target className="w-3 h-3" /> Trọng tâm: {roadmap.focus_skills.map((s) => SKILL_LABELS[s]).join(', ')}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Đã học xong: làm bài kiểm tra tổng kết */}
        {allDone && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-accent/90 to-primary-700 text-white shadow-soft-lg">
            <div className="flex items-start gap-4">
              <Trophy className="w-10 h-10 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="font-display font-bold text-xl">Bạn đã hoàn thành lộ trình!</h2>
                <p className="text-sm text-white/90 mt-1 leading-relaxed">
                  Hãy làm bài kiểm tra tổng kết để xem bạn đã sẵn sàng lên trình độ tiếp theo chưa. Đạt từ 70 điểm bạn sẽ lên level, nếu chưa đạt hệ thống sẽ tạo lộ trình cải thiện đúng phần còn yếu.
                </p>
                <button
                  type="button"
                  onClick={startExam}
                  disabled={startingExam}
                  className="mt-4 px-6 py-3 bg-white text-primary-800 hover:bg-cream rounded-2xl font-bold text-sm shadow-soft transition-all flex items-center gap-2 disabled:opacity-60"
                >
                  <span>{startingExam ? 'Đang chuẩn bị đề...' : 'Làm bài kiểm tra tổng kết'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hôm nay học gì */}
        {nextItem && !allDone && (
          <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden shadow-soft-lg">
            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream text-primary-900 text-xs font-bold mb-3 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>{nextItem.status === 'in_progress' ? 'Tiếp tục bài đang học' : 'Hôm nay học gì?'}</span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl leading-tight">{nextItem.title}</h2>
              <p className="mt-2 text-xs sm:text-sm text-white/90 leading-relaxed">{nextItem.description}</p>
              {nextItem.reason && <p className="mt-2 text-xs text-white/75 italic">Vì sao chọn bài này: {nextItem.reason}</p>}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link
                  href={`/learn/${nextItem.lesson_id}`}
                  className="px-6 py-3 bg-white text-primary-800 hover:bg-cream rounded-2xl font-bold text-xs sm:text-sm shadow-soft transition-all flex items-center gap-2"
                >
                  <span>Bắt đầu bài học ({nextItem.duration_minutes} phút)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <Clock className="w-4 h-4" />
                  <span>Đạt từ 70 điểm để qua bài, thưởng +{nextItem.xp_reward} XP</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bài học mới được đề xuất */}
        {suggestions.length > 0 && (
          <div className="p-6 rounded-3xl bg-cream/40 dark:bg-gray-900 border border-cream-dark shadow-soft space-y-3">
            <h3 className="font-display font-bold text-base text-primary-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" /> Bài học mới dành cho bạn
            </h3>
            <p className="text-xs text-text-secondary">Giáo viên vừa thêm các bài này. Bạn có thể thêm vào lộ trình hoặc bỏ qua.</p>
            <div className="space-y-2">
              {suggestions.map((s) => (
                <div key={s.item_id} className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-gray-800 border border-[var(--color-border)]">
                  <div className="flex items-center gap-2 min-w-0">
                    <SkillIcon skill={s.skill} />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-text-primary dark:text-white truncate">{s.title}</div>
                      <div className="text-[11px] text-text-muted">{SKILL_LABELS[s.skill]} • {s.duration_minutes} phút</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => respond(s.item_id, 'accept')} className="px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Thêm
                    </button>
                    <button type="button" onClick={() => respond(s.item_id, 'dismiss')} className="px-3 py-1.5 rounded-xl border border-[var(--color-border)] text-text-secondary text-xs font-medium flex items-center gap-1">
                      <X className="w-3.5 h-3.5" /> Bỏ qua
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isEmpty && (
          <p className="text-center text-sm text-text-muted py-10">
            Chưa có bài học nào trong lộ trình. Giáo viên cần xuất bản nội dung học, sau đó lộ trình của bạn sẽ được tạo.
          </p>
        )}

        {/* Các chặng */}
        <div className="space-y-6">
          {stages.map((stage) => {
            const done = stage.items.filter((i) => i.status === 'completed').length;
            const isCurrent = stage.items.some((i) => i.item_id === data.next_item_id);
            return (
              <div
                key={stage.stage_id + stage.items[0]?.item_id}
                className={cn(
                  'p-6 sm:p-8 rounded-3xl border transition-all',
                  isCurrent
                    ? 'bg-white dark:bg-gray-900 border-primary-500 shadow-soft-lg ring-1 ring-primary-500/30'
                    : 'bg-white/70 dark:bg-gray-900/60 border-[var(--color-border)] shadow-soft'
                )}
              >
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-[var(--color-border)]">
                  <h3 className="font-serif font-bold text-lg text-primary-900 dark:text-white">{stage.title}</h3>
                  <span className="text-xs font-semibold text-text-muted">{done}/{stage.items.length} bài</span>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {stage.items.map((item) => {
                    const isLocked = item.status === 'locked';
                    return (
                      <div
                        key={item.item_id}
                        className={cn(
                          'p-4 rounded-2xl border transition-all flex flex-col justify-between',
                          item.status === 'in_progress'
                            ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-950/30'
                            : 'border-[var(--color-border)] bg-background-secondary/20 dark:bg-gray-800/20',
                          isLocked && 'opacity-70'
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <span className="flex items-center gap-1.5 text-xs text-text-muted">
                              <SkillIcon skill={item.skill} />
                              <span>{SKILL_LABELS[item.skill]} • Tuần {item.week}</span>
                            </span>
                            <StatusBadge status={item.status} score={item.best_score} />
                          </div>
                          <h4 className="text-sm font-semibold text-text-primary dark:text-white leading-snug">{item.title}</h4>
                          <p className="text-xs text-text-secondary dark:text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                          {item.reason && <p className="text-[11px] text-primary-700 dark:text-primary-300 mt-1.5 italic line-clamp-2">{item.reason}</p>}
                        </div>

                        <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
                          <span className="text-text-muted flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {item.duration_minutes} phút • +{item.xp_reward} XP
                          </span>
                          {!isLocked ? (
                            <Link href={`/learn/${item.lesson_id}`} className="font-semibold text-primary-700 dark:text-primary-300 hover:underline flex items-center gap-1">
                              <span>{item.status === 'completed' ? 'Xem lại / Cải thiện điểm' : item.status === 'in_progress' ? 'Học tiếp' : 'Vào học'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          ) : (
                            <span className="text-text-muted flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Hoàn thành bài trước để mở
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

        {/* Lịch sử các chu kỳ */}
        {data.history.length > 0 && (
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-[var(--color-border)] shadow-soft">
            <h3 className="font-display font-bold text-base text-text-primary dark:text-white flex items-center gap-2 mb-3">
              <History className="w-4 h-4" /> Các lộ trình đã hoàn thành
            </h3>
            <div className="space-y-2">
              {data.history.map((h) => (
                <div key={h.id} className="flex flex-wrap items-center justify-between gap-2 text-xs p-3 rounded-xl bg-background-secondary/40">
                  <span className="font-semibold">Chu kỳ {h.cycle} • Trình độ {h.level}</span>
                  <span className="text-text-secondary">
                    {h.exam_score != null ? `Kiểm tra tổng kết: ${h.exam_score}đ` : 'Chưa có điểm tổng kết'}
                    {h.outcome === 'level_up' ? ' → Đã lên level' : h.outcome === 'improve' ? ' → Học cải thiện' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
