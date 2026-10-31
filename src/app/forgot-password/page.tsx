'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GraduationCap, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { apiForgotPassword } from '@/lib/api';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

const forgotSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { addToast } = useUIStore();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setIsLoading(true);
    try {
      await apiForgotPassword(data.email);
      setIsSubmitted(true);
      addToast({
        title: 'Đã gửi hướng dẫn',
        description: 'Vui lòng kiểm tra hòm thư của bạn.',
        variant: 'success',
      });
    } catch {
      addToast({
        title: 'Lỗi',
        description: 'Không thể gửi email lúc này. Vui lòng thử lại sau.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            Quên Mật Khẩu
          </h1>
          <p className="mt-2 text-sm text-text-secondary dark:text-gray-400">
            Nhập email sinh viên để nhận liên kết đặt lại mật khẩu
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-soft-lg border border-[var(--color-border)]">
          {isSubmitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-success-light text-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-serif font-bold text-lg text-text-primary dark:text-white">
                Kiểm tra email của bạn
              </h3>
              <p className="text-xs text-text-secondary dark:text-gray-300 leading-relaxed">
                Chúng tôi đã gửi đường dẫn đặt lại mật khẩu. Nếu không thấy trong hộp thư đến, hãy kiểm tra thư mục Spam/Junk.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary dark:text-gray-200 mb-1.5">
                  Email đã đăng ký
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="mssv@student.uth.edu.vn"
                    {...register('email')}
                    className={cn(
                      'w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm bg-background-secondary dark:bg-gray-800 border focus:outline-none transition-all',
                      errors.email ? 'border-error' : 'border-transparent focus:border-primary-500'
                    )}
                  />
                  <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                {errors.email && (
                  <p className="text-xs text-error mt-1">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-2xl bg-primary-600 hover:bg-primary-hover text-white font-semibold transition-all shadow-soft disabled:opacity-50"
              >
                {isLoading ? 'Đang gửi...' : 'Gửi liên kết khôi phục'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary-700 dark:hover:text-primary-400 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại trang Đăng nhập</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
