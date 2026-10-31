'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, GraduationCap, Award, MessageSquare, Clock,
  Sparkles, ArrowRight, ArrowLeft, CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { apiCompleteOnboarding, apiGetProfile } from '@/lib/api';
import { MAJORS_BY_FACULTY, JOB_INTEREST_OPTIONS, type FacultyGroup, type LearningGoal, type LogisticsArea, type DailyMinutes, type CEFRLevel } from '@/types';
import { cn } from '@/lib/utils';

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, setProfile, updateProfile } = useAuthStore();
  const { addToast } = useUIStore();

  useEffect(() => {
    if (profile) return;
    apiGetProfile().then(setProfile).catch(() => {});
  }, [profile, setProfile]);

  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<LearningGoal>(profile?.goal || 'work');
  const [interests, setInterests] = useState<LogisticsArea[]>(profile?.interests || ['documentation', 'forwarder']);
  const [dailyMinutes, setDailyMinutes] = useState<DailyMinutes>(profile?.daily_minutes || 20);
  const [level, setLevel] = useState<CEFRLevel>(profile?.self_assessed_level || 'A2');
  const [faculty, setFaculty] = useState<FacultyGroup>(profile?.faculty_group || 'engineering');
  const [major, setMajor] = useState(profile?.major || MAJORS_BY_FACULTY.engineering[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customInterest, setCustomInterest] = useState('');

  const knownInterestIds = new Set(JOB_INTEREST_OPTIONS.map((o) => o.id));
  const customInterests = interests.filter((i) => !knownInterestIds.has(i));

  const addCustomInterest = () => {
    const val = customInterest.trim();
    if (!val || interests.includes(val)) return;
    setInterests([...interests, val]);
    setCustomInterest('');
  };

  // If user doesn't have faculty_group, we include it as step 0 or 1
  const totalSteps = 4;
  const progressPercent = (step / totalSteps) * 100;

  const toggleInterest = (item: LogisticsArea) => {
    if (interests.includes(item)) {
      if (interests.length > 1) {
        setInterests(interests.filter((i) => i !== item));
      }
    } else {
      setInterests([...interests, item]);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await apiCompleteOnboarding(profile?.id ?? '', {
        goal,
        interests,
        daily_minutes: dailyMinutes,
        self_assessed_level: level,
        faculty_group: faculty,
        major,
      });

      updateProfile({
        goal,
        interests,
        daily_minutes: dailyMinutes,
        self_assessed_level: level,
        faculty_group: faculty,
        major,
        onboarding_completed: true,
      });

      addToast({
        title: 'Thiết lập thành công!',
        description: 'Bây giờ hãy làm bài kiểm tra đầu vào để xác định trình độ chính xác.',
        variant: 'success',
      });

      router.push('/placement');
    } catch {
      addToast({
        title: 'Có lỗi xảy ra',
        description: 'Vui lòng thử lại sau giây lát.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E3F2EF]/40 via-[#FBFDFC] to-white dark:bg-gray-950 py-10 px-4 sm:px-6 flex flex-col justify-center">
      <div className="max-w-xl mx-auto w-full">
        {/* Progress Bar & Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-between text-xs font-semibold text-text-secondary dark:text-gray-400 mb-2">
            <span>Bước {step} / {totalSteps}</span>
            <span>{Math.round(progressPercent)}% hoàn thành</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-10 shadow-soft-lg border border-[var(--color-border)] relative overflow-hidden">
          <AnimatePresence mode="wait">
            {/* STEP 1: MỤC TIÊU HỌC TẬP */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">Mục tiêu chính</span>
                  <h2 className="font-serif font-bold text-2xl text-primary-900 dark:text-white mt-1">
                    Mục tiêu học tiếng Anh của bạn là gì?
                  </h2>
                  <p className="text-xs text-text-secondary dark:text-gray-400 mt-1">
                    Chọn định hướng trọng tâm để hệ thống gợi ý từ vựng và tình huống sát nhất.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'internship',
                      label: 'Đi thực tập doanh nghiệp',
                      desc: 'Đọc chứng từ, viết email báo cáo',
                      icon: GraduationCap,
                    },
                    {
                      id: 'work',
                      label: 'Đi làm chính thức',
                      desc: 'Làm việc tại Forwarder, Hãng tàu',
                      icon: Briefcase,
                    },
                    {
                      id: 'certificate',
                      label: 'Thi chứng chỉ (TOEIC/FIATA)',
                      desc: 'Củng cố ngữ pháp & thuật ngữ',
                      icon: Award,
                    },
                    {
                      id: 'communication',
                      label: 'Giao tiếp với đối tác quốc tế',
                      desc: 'Gọi điện, đàm phán cước tàu',
                      icon: MessageSquare,
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGoal(item.id as LearningGoal)}
                      className={cn(
                        'p-4 rounded-2xl border-2 text-left transition-all flex flex-col',
                        goal === item.id
                          ? 'border-primary-600 bg-primary-50/60 dark:bg-primary-950/40 shadow-sm'
                          : 'border-[var(--color-border)] hover:border-primary-300 bg-background-secondary/20'
                      )}
                    >
                      <item.icon className={cn('w-6 h-6 mb-2', goal === item.id ? 'text-primary-600' : 'text-text-muted')} />
                      <span className="text-sm font-semibold text-text-primary dark:text-white">{item.label}</span>
                      <span className="text-[11px] text-text-muted mt-0.5">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: VỊ TRÍ QUAN TÂM */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">Đa ngành nghề</span>
                  <h2 className="font-serif font-bold text-2xl text-primary-900 dark:text-white mt-1">
                    Vị trí công việc bạn quan tâm?
                  </h2>
                  <p className="text-xs text-text-secondary dark:text-gray-400 mt-1">
                    Bạn có thể chọn nhiều vị trí (tối thiểu 1 vị trí), hoặc tự nhập nếu không thấy trong danh sách.
                  </p>
                </div>

                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {['Logistics & XNK', 'Ngành khác'].map((group) => (
                    <div key={group}>
                      <span className="text-[11px] font-bold text-text-muted uppercase tracking-wide">{group}</span>
                      <div className="grid grid-cols-2 gap-2.5 mt-2">
                        {JOB_INTEREST_OPTIONS.filter((o) => o.group === group).map((item) => {
                          const isSelected = interests.includes(item.id);
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => toggleInterest(item.id)}
                              className={cn(
                                'p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-2',
                                isSelected
                                  ? 'border-primary-600 bg-primary-50/60 dark:bg-primary-950/40 text-primary-800 dark:text-primary-300 font-semibold'
                                  : 'border-[var(--color-border)] hover:border-primary-300 bg-background-secondary/20 text-text-secondary'
                              )}
                            >
                              <span className="text-xs">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Nhập tay vị trí khác */}
                <div className="pt-1">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wide">Không thấy ngành của bạn?</span>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={customInterest}
                      onChange={(e) => setCustomInterest(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomInterest();
                        }
                      }}
                      placeholder="Tự nhập vị trí / ngành nghề..."
                      className="flex-1 px-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-background-secondary/30 dark:bg-gray-800 border border-[var(--color-border)] focus:border-primary-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addCustomInterest}
                      className="px-4 py-2.5 rounded-2xl bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 text-xs font-semibold transition-colors"
                    >
                      Thêm
                    </button>
                  </div>
                  {customInterests.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {customInterests.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary-50 dark:bg-primary-950/40 text-primary-800 dark:text-primary-300 px-3 py-1.5 rounded-full"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => toggleInterest(tag)}
                            className="hover:text-error"
                            aria-label={`Xóa ${tag}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 3: THỜI GIAN HỌC MỖI NGÀY */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">Thời lượng cam kết</span>
                  <h2 className="font-serif font-bold text-2xl text-primary-900 dark:text-white mt-1">
                    Bạn muốn dành bao nhiêu phút mỗi ngày?
                  </h2>
                  <p className="text-xs text-text-secondary dark:text-gray-400 mt-1">
                    Học đều đặn 15-20 phút mang lại hiệu quả cao gấp 3 lần dồn vào cuối tuần.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { val: 10, label: '10 phút', desc: 'Nhẹ nhàng' },
                    { val: 20, label: '20 phút', desc: 'Đề xuất', popular: true },
                    { val: 30, label: '30 phút', desc: 'Tập trung' },
                    { val: 45, label: '45 phút', desc: 'Bứt phá' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setDailyMinutes(item.val as DailyMinutes)}
                      className={cn(
                        'p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center relative',
                        dailyMinutes === item.val
                          ? 'border-primary-600 bg-primary-50/60 dark:bg-primary-950/40 shadow-sm'
                          : 'border-[var(--color-border)] hover:border-primary-300 bg-background-secondary/20'
                      )}
                    >
                      {item.popular && (
                        <span className="absolute -top-2.5 bg-accent text-accent-foreground text-[9px] font-bold px-2 py-0.5 rounded-full">
                          Khuyên dùng
                        </span>
                      )}
                      <Clock className={cn('w-5 h-5 mb-1', dailyMinutes === item.val ? 'text-primary-600' : 'text-text-muted')} />
                      <span className="text-sm font-bold text-text-primary dark:text-white">{item.label}</span>
                      <span className="text-[11px] text-text-muted">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 4: TỰ ĐÁNH GIÁ TRÌNH ĐỘ */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">Tự đánh giá</span>
                  <h2 className="font-serif font-bold text-2xl text-primary-900 dark:text-white mt-1">
                    Bạn tự đánh giá trình độ hiện tại thế nào?
                  </h2>
                  <p className="text-xs text-text-secondary dark:text-gray-400 mt-1">
                    Đừng lo nếu chưa tự tin, bài test đầu vào sau đây sẽ giúp đo lường chuẩn xác nhất.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'A1', title: 'Mới bắt đầu (A1)', desc: 'Chưa biết nhiều từ vựng logistics, khó đọc email tiếng Anh.' },
                    { id: 'A2', title: 'Sơ cấp (A2)', desc: 'Biết các Incoterms cơ bản (FOB, CIF), đọc hiểu thông báo đơn giản.' },
                    { id: 'B1', title: 'Trung cấp (B1)', desc: 'Đọc hiểu B/L, Invoice tốt; có thể viết email trao đổi thông thường.' },
                    { id: 'B2', title: 'Khá (B2)', desc: 'Tự tin đàm phán cước tàu, xử lý khiếu nại và hiểu quy định hải quan.' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLevel(item.id as CEFRLevel)}
                      className={cn(
                        'w-full p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between',
                        level === item.id
                          ? 'border-primary-600 bg-primary-50/60 dark:bg-primary-950/40 shadow-sm'
                          : 'border-[var(--color-border)] hover:border-primary-300 bg-background-secondary/20'
                      )}
                    >
                      <div>
                        <div className="text-sm font-semibold text-text-primary dark:text-white">{item.title}</div>
                        <div className="text-xs text-text-secondary dark:text-gray-400 mt-0.5">{item.desc}</div>
                      </div>
                      {level === item.id && (
                        <CheckCircle2 className="w-5 h-5 text-primary-600 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav Controls */}
          <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2.5 rounded-2xl border border-[var(--color-border)] text-text-secondary hover:bg-background-secondary text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold transition-all shadow-soft flex items-center gap-1.5"
              >
                <span>Tiếp tục</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinish}
                className="px-6 py-3 rounded-2xl bg-primary-600 hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold transition-all shadow-soft-lg flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Đang khởi tạo...</span>
                ) : (
                  <>
                    <span>Vào Bài Test Đầu Vào</span>
                    <Sparkles className="w-4 h-4 text-cream" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
