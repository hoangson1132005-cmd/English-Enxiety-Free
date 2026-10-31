'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GraduationCap, Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { apiResetPassword } from '@/lib/api';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

const resetSchema = z
  .object({
    password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { addToast } = useUIStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    try {
      await apiResetPassword(token, data.password);
      addToast({
        title: 'Thành công!',
        description: 'Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.',
        variant: 'success',
      });
      router.push('/login');
    } catch {
      addToast({
        title: 'Lỗi',
        description: 'Liên kết không hợp lệ hoặc đã hết hạn.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-soft-lg border border-[var(--color-border)]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-text-primary dark:text-gray-200 mb-1.5">
            Mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Tối thiểu 6 ký tự"
              {...register('password')}
              className={cn(
                'w-full pl-10 pr-10 py-2.5 rounded-2xl text-sm bg-background-secondary dark:bg-gray-800 border focus:outline-none transition-all',
                errors.password ? 'border-error' : 'border-transparent focus:border-primary-500'
              )}
            />
            <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-error mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-primary dark:text-gray-200 mb-1.5">
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu mới"
              {...register('confirmPassword')}
              className={cn(
                'w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm bg-background-secondary dark:bg-gray-800 border focus:outline-none transition-all',
                errors.confirmPassword ? 'border-error' : 'border-transparent focus:border-primary-500'
              )}
            />
            <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-error mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-6 rounded-2xl bg-primary-600 hover:bg-primary-hover text-white font-semibold transition-all shadow-soft disabled:opacity-50 mt-2"
        >
          {isLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu & Đăng nhập'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E3F2EF]/40 via-[#FBFDFC] to-white dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white shadow-soft">
              <GraduationCap className="w-7 h-7" />
            </div>
          </Link>
          <h1 className="font-serif font-bold text-3xl text-primary-900 dark:text-white">
            Đặt Lại Mật Khẩu
          </h1>
          <p className="mt-2 text-sm text-text-secondary dark:text-gray-400">
            Tạo mật khẩu mới cho tài khoản sinh viên của bạn
          </p>
        </div>

        <Suspense fallback={<div className="p-8 text-center text-sm">Đang tải...</div>}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
