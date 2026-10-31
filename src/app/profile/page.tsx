'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User, ShieldCheck, Sun, Bell, RotateCcw,
  Save, KeyRound, Clock, Target, CheckCircle2, Languages, Wrench, Sparkles, Briefcase, GraduationCap
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { apiUpdateProfile } from '@/lib/api';
import { MAJORS_BY_FACULTY, OTHER_MAJOR_VALUE, type FacultyGroup, type DailyMinutes, type LearningGoal, type EmploymentStatus } from '@/types';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { profile, updateProfile } = useAuthStore();
  const { addToast } = useUIStore();

  const [fullName, setFullName] = useState(profile?.full_name || 'Nguyễn Thị Lan Anh');
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>(profile?.employment_status || 'student');
  const [facultyGroup, setFacultyGroup] = useState<FacultyGroup>(profile?.faculty_group || 'engineering');
  const [major, setMajor] = useState(profile?.major || 'Logistics và Quản lý chuỗi cung ứng');
  const [isCustomMajor, setIsCustomMajor] = useState(
    !!profile?.major && !MAJORS_BY_FACULTY[profile.faculty_group || 'engineering'].includes(profile.major)
  );
  const [studyYear, setStudyYear] = useState<number>(profile?.study_year || 1);
  const [goal, setGoal] = useState<LearningGoal>(profile?.goal || 'work');
  const [dailyMinutes, setDailyMinutes] = useState<DailyMinutes>(profile?.daily_minutes || 20);
  const [notifications, setNotifications] = useState(profile?.notification_enabled ?? true);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (profile?.id) {
        await apiUpdateProfile(profile.id, {
          full_name: fullName,
          employment_status: employmentStatus,
          faculty_group: facultyGroup,
          major,
          study_year: (employmentStatus === 'student' ? studyYear : 1) as 1 | 2 | 3,
          goal,
          daily_minutes: dailyMinutes,
          notification_enabled: notifications,
        });
      }

      updateProfile({
        full_name: fullName,
        employment_status: employmentStatus,
        faculty_group: facultyGroup,
        major,
        study_year: (employmentStatus === 'student' ? studyYear : 1) as 1 | 2 | 3,
        goal,
        daily_minutes: dailyMinutes,
        notification_enabled: notifications,
      });

      addToast({
        title: 'Cập nhật thành công',
        description: 'Thông tin hồ sơ và cài đặt học tập đã được lưu.',
        variant: 'success',
      });
    } catch {
      addToast({
        title: 'Lỗi',
        description: 'Không thể cập nhật hồ sơ lúc này.',
        variant: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout title="Hồ Sơ Cá Nhân & Cài Đặt">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile Card Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-[var(--color-border)] shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary-600 to-accent text-white flex items-center justify-center text-2xl font-bold shadow-soft">
              {fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-xl text-text-primary dark:text-white">
                  {fullName}
                </h2>
                <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full">
                  MSSV: {profile?.student_id || '2151060001'}
                </span>
              </div>
              <p className="text-xs text-text-secondary dark:text-gray-400 mt-1">
                {profile?.email || 'lananh.2151060001@student.uth.edu.vn'}
              </p>
            </div>
          </div>

          <Link
            href="/placement"
            className="px-4 py-2.5 rounded-2xl border border-[var(--color-border)] hover:bg-background-secondary text-xs font-semibold text-text-secondary flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm lại test đầu vào</span>
          </Link>
        </div>

        {/* Form Settings */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* 1. THÔNG TIN KHỐI NGÀNH VÀ CHUYÊN NGÀNH */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-[var(--color-border)] shadow-soft space-y-4">
            <h3 className="font-serif font-bold text-base text-primary-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary-600" />
              <span>Khối Ngành & Thông Tin Học Tập</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary dark:text-gray-200 mb-1.5">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-background-secondary/50 dark:bg-gray-800 border border-[var(--color-border)] focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary dark:text-gray-200 mb-1.5">
                  Bạn đang là sinh viên hay đã đi làm?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'student', label: 'Sinh viên', icon: GraduationCap },
                    { id: 'employed', label: 'Đã đi làm', icon: Briefcase },
                  ].map((item) => {
                    const isSelected = employmentStatus === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setEmploymentStatus(item.id as EmploymentStatus)}
                        className={cn(
                          'px-3 py-2.5 rounded-2xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all',
                          isSelected
                            ? 'border-primary-600 bg-primary-50/60 dark:bg-primary-950/40 text-primary-700'
                            : 'border-[var(--color-border)] text-text-secondary hover:border-primary-300'
                        )}
                      >
                        <item.icon className="w-3.5 h-3.5" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary dark:text-gray-200 mb-1.5">
                  Khối ngành
                </label>
                <select
                  value={facultyGroup}
                  onChange={(e) => {
                    const fg = e.target.value as FacultyGroup;
                    setFacultyGroup(fg);
                    setIsCustomMajor(false);
                    setMajor(MAJORS_BY_FACULTY[fg][0]);
                  }}
                  className="w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-background-secondary/50 dark:bg-gray-800 border border-[var(--color-border)] focus:border-primary-500 focus:outline-none"
                >
                  <option value="engineering">Kỹ thuật / Kinh tế (Logistics, Vận tải)</option>
                  <option value="language">Ngôn ngữ (Tiếng Anh, Trung, Nhật)</option>
                  <option value="other">Khối ngành khác</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary dark:text-gray-200 mb-1.5">
                  Ngành học cụ thể
                </label>
                {!isCustomMajor ? (
                  <select
                    value={major}
                    onChange={(e) => {
                      if (e.target.value === OTHER_MAJOR_VALUE) {
                        setIsCustomMajor(true);
                        setMajor('');
                      } else {
                        setMajor(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-background-secondary/50 dark:bg-gray-800 border border-[var(--color-border)] focus:border-primary-500 focus:outline-none"
                  >
                    {MAJORS_BY_FACULTY[facultyGroup].map((maj) => (
                      <option key={maj} value={maj}>
                        {maj}
                      </option>
                    ))}
                    <option value={OTHER_MAJOR_VALUE}>Khác (tự nhập ngành của bạn)</option>
                  </select>
                ) : (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      autoFocus
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder="Nhập ngành học của bạn..."
                      className="w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-background-secondary/50 dark:bg-gray-800 border border-[var(--color-border)] focus:border-primary-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomMajor(false);
                        setMajor(MAJORS_BY_FACULTY[facultyGroup][0]);
                      }}
                      className="text-[11px] text-primary-700 dark:text-primary-400 hover:underline"
                    >
                      ← Chọn từ danh sách có sẵn
                    </button>
                  </div>
                )}
              </div>

              {employmentStatus === 'student' && (
                <div>
                  <label className="block text-xs font-semibold text-text-primary dark:text-gray-200 mb-1.5">
                    Sinh viên năm thứ
                  </label>
                  <select
                    value={studyYear}
                    onChange={(e) => setStudyYear(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-background-secondary/50 dark:bg-gray-800 border border-[var(--color-border)] focus:border-primary-500 focus:outline-none"
                  >
                    <option value={1}>Năm 1</option>
                    <option value={2}>Năm 2</option>
                    <option value={3}>Năm 3</option>
                  </select>
                </div>
              )}
            </div>

            {/* Trạng thái đồng ý chia sẻ dữ liệu */}
            <div className="p-3.5 rounded-2xl bg-success-light/30 border border-success/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-success-dark font-medium">
                <ShieldCheck className="w-4 h-4 text-success" />
                <span>Đã đồng ý chia sẻ dữ liệu học tập ẩn danh</span>
              </div>
              <span className="text-[10px] font-bold bg-success text-white px-2 py-0.5 rounded-full">
                ACTIVE
              </span>
            </div>
          </div>

          {/* 2. MỤC TIÊU VÀ THỜI GIAN HỌC */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-[var(--color-border)] shadow-soft space-y-4">
            <h3 className="font-serif font-bold text-base text-primary-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" />
              <span>Mục Tiêu & Kế Hoạch Học Tập</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary dark:text-gray-200 mb-1.5">
                  Mục tiêu trọng tâm
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as LearningGoal)}
                  className="w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-background-secondary/50 dark:bg-gray-800 border border-[var(--color-border)] focus:border-primary-500 focus:outline-none"
                >
                  <option value="internship">Đi thực tập doanh nghiệp</option>
                  <option value="work">Đi làm chính thức tại Forwarder / Hãng tàu</option>
                  <option value="certificate">Thi chứng chỉ (TOEIC / FIATA)</option>
                  <option value="communication">Giao tiếp với đối tác quốc tế</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary dark:text-gray-200 mb-1.5">
                  Thời lượng học mỗi ngày
                </label>
                <select
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(Number(e.target.value) as DailyMinutes)}
                  className="w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-background-secondary/50 dark:bg-gray-800 border border-[var(--color-border)] focus:border-primary-500 focus:outline-none"
                >
                  <option value={10}>10 phút / ngày</option>
                  <option value={20}>20 phút / ngày (Đề xuất)</option>
                  <option value={30}>30 phút / ngày</option>
                  <option value={45}>45 phút / ngày</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. TÙY CHỌN GIAO DIỆN & THÔNG BÁO */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-[var(--color-border)] shadow-soft space-y-4">
            <h3 className="font-serif font-bold text-base text-primary-900 dark:text-white flex items-center gap-2">
              <Sun className="w-5 h-5 text-warning" />
              <span>Giao Diện & Nhắc Nhở</span>
            </h3>

            <div className="space-y-3">
              {/* Notification toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background-secondary/30 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-primary-600" />
                  <div>
                    <div className="text-xs font-semibold text-text-primary dark:text-white">Nhắc nhở học tập hàng ngày</div>
                    <div className="text-[11px] text-text-muted">Nhận thông báo giữ streak vào 20:00 mỗi tối</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications(!notifications)}
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors relative p-0.5',
                    notifications ? 'bg-primary-600' : 'bg-gray-300'
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full bg-white transition-transform',
                      notifications ? 'translate-x-6' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end pt-2 pb-12">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 bg-primary-600 hover:bg-primary-hover text-white rounded-2xl font-bold text-xs sm:text-sm shadow-soft transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}</span>
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
