'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, ShieldCheck, Languages, Wrench, Sparkles, Check, Eye, EyeOff, Briefcase, GraduationCap } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { signIn } from 'next-auth/react';
import { MAJORS_BY_FACULTY, OTHER_MAJOR_VALUE, type FacultyGroup, type EmploymentStatus } from '@/types';
import { apiRegister } from '@/lib/api';
import { useUIStore } from '@/store/uiStore';
import { ResearchConsentModal } from '@/components/features/auth/ResearchConsentModal';
import { cn } from '@/lib/utils';

const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Vui lòng nhập họ và tên đầy đủ'),
    student_id: z.string().optional().default(''),
    email: z.string().email('Email không đúng định dạng'),
    password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
    employment_status: z.enum(['student', 'employed']),
    faculty_group: z.string().min(1, 'Vui lòng chọn khối ngành'),
    major: z.string().min(1, 'Vui lòng chọn hoặc nhập ngành học'),
    study_year: z.number().min(1).max(3),
    research_consent: z.boolean().refine((val) => val === true, {
      message: 'Bạn cần đồng ý cho phép sử dụng dữ liệu học tập ẩn danh để tiếp tục',
    }),
  })
  .refine(
    (data) => data.employment_status !== 'student' || (data.student_id?.length ?? 0) >= 8,
    { message: 'MSSV phải có ít nhất 8 ký tự', path: ['student_id'] }
  );

interface RegisterFormData {
  full_name: string;
  student_id: string;
  email: string;
  password: string;
  employment_status: EmploymentStatus;
  faculty_group: string;
  major: string;
  study_year: number;
  research_consent: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomMajor, setIsCustomMajor] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema) as Resolver<RegisterFormData>,
    defaultValues: {
      employment_status: 'student',
      faculty_group: 'engineering',
      study_year: 1,
      major: MAJORS_BY_FACULTY.engineering[0],
      research_consent: true,
    },
  });

  const selectedFaculty = watch('faculty_group') as FacultyGroup;
  const employmentStatus = watch('employment_status');
  const password = watch('password') || '';
  const consent = watch('research_consent');

  // Calculate password strength
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = calculateStrength(password);
  const strengthLabels = ['Quá ngắn', 'Yếu', 'Trung bình', 'Khá', 'Mạnh', 'Rất mạnh'];
  const strengthColors = ['bg-gray-200', 'bg-error', 'bg-warning', 'bg-warning', 'bg-success', 'bg-success'];

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await apiRegister({
        full_name: data.full_name,
        student_id: data.student_id || '',
        email: data.email,
        password: data.password,
        employment_status: data.employment_status,
        faculty_group: data.faculty_group,
        major: data.major,
        study_year: data.employment_status === 'student' ? data.study_year : 1,
        research_consent: data.research_consent,
      });

      const res = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (res?.error) throw new Error(res.error);

      addToast({
        title: 'Đăng ký thành công!',
        description: 'Chào mừng bạn đến với English Anxiety Free.',
        variant: 'success',
      });

      router.push('/onboarding');
    } catch {
      addToast({
        title: 'Đăng ký thất bại',
        description: 'Vui lòng kiểm tra lại thông tin và thử lại.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E3F2EF]/40 via-[#FBFDFC] to-white dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <BrandLogo className="w-12 h-12 rounded-2xl shadow-soft" />
          </Link>
          <h1 className="font-serif font-bold text-3xl text-primary-900 dark:text-white">
            Tạo Tài Khoản Học Viên
          </h1>
          <p className="mt-2 text-sm text-text-secondary dark:text-gray-400">
            Nền tảng miễn phí giúp bạn luyện tiếng Anh chuyên ngành Logistics
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-10 shadow-soft-lg border border-[var(--color-border)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary dark:text-gray-200 mb-1.5">
                  Họ và tên sinh viên *
                </label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  {...register('full_name')}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-2xl text-sm bg-background-secondary dark:bg-gray-800 border focus:outline-none transition-all',
                    errors.full_name ? 'border-error' : 'border-transparent focus:border-primary-500'
                  )}
                />
                {errors.full_name && (
                  <p className="text-xs text-error mt-1">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary dark:text-gray-200 mb-1.5">
                  {employmentStatus === 'employed' ? 'Mã số nhân viên (nếu có)' : 'Mã số sinh viên (MSSV) *'}
                </label>
                <input
                  type="text"
                  placeholder={employmentStatus === 'employed' ? 'Không bắt buộc' : '215106xxxx'}
                  {...register('student_id')}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-2xl text-sm bg-background-secondary dark:bg-gray-800 border focus:outline-none transition-all',
                    errors.student_id ? 'border-error' : 'border-transparent focus:border-primary-500'
                  )}
                />
                {errors.student_id && (
                  <p className="text-xs text-error mt-1">{errors.student_id.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary dark:text-gray-200 mb-1.5">
                Email trường hoặc cá nhân *
              </label>
              <input
                type="email"
                placeholder="tensv.mssv@student.uth.edu.vn"
                {...register('email')}
                className={cn(
                  'w-full px-4 py-2.5 rounded-2xl text-sm bg-background-secondary dark:bg-gray-800 border focus:outline-none transition-all',
                  errors.email ? 'border-error' : 'border-transparent focus:border-primary-500'
                )}
              />
              {errors.email && (
                <p className="text-xs text-error mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-text-primary dark:text-gray-200 mb-1.5">
                Mật khẩu *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 6 ký tự"
                  {...register('password')}
                  className={cn(
                    'w-full px-4 py-2.5 pr-10 rounded-2xl text-sm bg-background-secondary dark:bg-gray-800 border focus:outline-none transition-all',
                    errors.password ? 'border-error' : 'border-transparent focus:border-primary-500'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full transition-all duration-300', strengthColors[strength])}
                      style={{ width: `${(strength / 5) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-text-secondary text-right">
                    Độ mạnh: <span className="font-semibold">{strengthLabels[strength]}</span>
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="text-xs text-error mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* TRẠNG THÁI: SINH VIÊN HAY ĐÃ ĐI LÀM */}
            <div>
              <label className="block text-xs font-semibold text-text-primary dark:text-gray-200 mb-2">
                Bạn đang là sinh viên hay đã đi làm? *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'student', label: 'Sinh viên', icon: GraduationCap },
                  { id: 'employed', label: 'Đã đi làm', icon: Briefcase },
                ].map((item) => {
                  const isSelected = employmentStatus === item.id;
                  return (
                    <label
                      key={item.id}
                      onClick={() => setValue('employment_status', item.id as EmploymentStatus)}
                      className={cn(
                        'relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-2.5',
                        isSelected
                          ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/40 shadow-sm'
                          : 'border-[var(--color-border)] hover:border-primary-300 bg-background-secondary/30 dark:bg-gray-800/40'
                      )}
                    >
                      <item.icon className={cn('w-4 h-4', isSelected ? 'text-primary-600' : 'text-text-muted')} />
                      <span className="text-sm font-semibold text-text-primary dark:text-white">{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* KHỐI NGÀNH - RADIO CARDS */}
            <div>
              <label className="block text-xs font-semibold text-text-primary dark:text-gray-200 mb-2">
                Khối ngành của bạn * (Giúp cá nhân hóa lộ trình học)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'engineering',
                    label: 'Kỹ thuật / Kinh tế',
                    desc: 'Logistics, Vận tải biển, QTKD',
                    icon: Wrench,
                  },
                  {
                    id: 'language',
                    label: 'Ngôn ngữ',
                    desc: 'Ngôn ngữ Anh, Trung, Nhật',
                    icon: Languages,
                  },
                  {
                    id: 'other',
                    label: 'Khối ngành khác',
                    desc: 'CNTT, Tài chính, Du lịch...',
                    icon: Sparkles,
                  },
                ].map((item) => {
                  const isSelected = selectedFaculty === item.id;
                  return (
                    <label
                      key={item.id}
                      onClick={() => {
                        setValue('faculty_group', item.id as FacultyGroup);
                        setValue('major', MAJORS_BY_FACULTY[item.id as FacultyGroup][0]);
                      }}
                      className={cn(
                        'relative p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-start',
                        isSelected
                          ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/40 shadow-sm'
                          : 'border-[var(--color-border)] hover:border-primary-300 bg-background-secondary/30 dark:bg-gray-800/40'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center mb-2',
                        isSelected
                          ? 'bg-primary-600 text-white'
                          : 'bg-white dark:bg-gray-700 text-text-secondary'
                      )}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-text-primary dark:text-white">
                        {item.label}
                      </span>
                      <span className="text-[11px] text-text-muted mt-0.5">
                        {item.desc}
                      </span>
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
              {errors.faculty_group && (
                <p className="text-xs text-error mt-1">{errors.faculty_group.message}</p>
              )}
            </div>

            {/* Ngành học & Năm học */}
            <div className={cn('grid gap-4', employmentStatus === 'student' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1')}>
              <div>
                <label className="block text-xs font-semibold text-text-primary dark:text-gray-200 mb-1.5">
                  Ngành học cụ thể *
                </label>
                {!isCustomMajor ? (
                  <select
                    value={watch('major')}
                    onChange={(e) => {
                      if (e.target.value === OTHER_MAJOR_VALUE) {
                        setIsCustomMajor(true);
                        setValue('major', '');
                      } else {
                        setValue('major', e.target.value);
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-2xl text-sm bg-background-secondary dark:bg-gray-800 border border-transparent focus:border-primary-500 focus:outline-none"
                  >
                    {MAJORS_BY_FACULTY[selectedFaculty || 'engineering'].map((maj) => (
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
                      placeholder="Nhập ngành học của bạn..."
                      {...register('major')}
                      className={cn(
                        'w-full px-4 py-2.5 rounded-2xl text-sm bg-background-secondary dark:bg-gray-800 border focus:outline-none transition-all',
                        errors.major ? 'border-error' : 'border-transparent focus:border-primary-500'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomMajor(false);
                        setValue('major', MAJORS_BY_FACULTY[selectedFaculty || 'engineering'][0]);
                      }}
                      className="text-[11px] text-primary-700 dark:text-primary-400 hover:underline"
                    >
                      ← Chọn từ danh sách có sẵn
                    </button>
                  </div>
                )}
                {errors.major && (
                  <p className="text-xs text-error mt-1">{errors.major.message}</p>
                )}
              </div>

              {employmentStatus === 'student' && (
                <div>
                  <label className="block text-xs font-semibold text-text-primary dark:text-gray-200 mb-1.5">
                    Sinh viên năm thứ *
                  </label>
                  <select
                    {...register('study_year', { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 rounded-2xl text-sm bg-background-secondary dark:bg-gray-800 border border-transparent focus:border-primary-500 focus:outline-none"
                  >
                    <option value={1}>Năm 1</option>
                    <option value={2}>Năm 2</option>
                    <option value={3}>Năm 3</option>
                  </select>
                </div>
              )}
            </div>

            {/* Checkbox Nghiên cứu Khoa học */}
            <div className="p-4 rounded-2xl bg-cream/40 dark:bg-gray-800/60 border border-cream-dark/50 dark:border-gray-700">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('research_consent')}
                  className="mt-1 w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                />
                <div className="text-xs text-text-secondary dark:text-gray-300 leading-relaxed">
                  Tôi đồng ý cho phép sử dụng dữ liệu học tập <strong>ẩn danh hoàn toàn</strong> để cải thiện trải nghiệm và nội dung học tập.{' '}
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="text-primary-700 dark:text-primary-400 font-semibold underline hover:text-primary-800 inline-flex items-center gap-0.5"
                  >
                    Xem chi tiết cam kết bảo mật & quyền lợi
                  </button>
                </div>
              </label>
              {errors.research_consent && (
                <p className="text-xs text-error mt-1 pl-7">{errors.research_consent.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !consent}
              className="w-full py-3.5 px-6 rounded-2xl bg-primary-600 hover:bg-primary-hover text-white font-semibold transition-all shadow-soft flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Đang khởi tạo tài khoản...</span>
              ) : (
                <>
                  <span>Hoàn tất đăng ký & Tiếp tục</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer link to login */}
          <div className="mt-6 text-center text-xs text-text-secondary">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-primary-700 dark:text-primary-400 font-semibold hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>

      <ResearchConsentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAccept={() => setValue('research_consent', true)}
      />
    </div>
  );
}
