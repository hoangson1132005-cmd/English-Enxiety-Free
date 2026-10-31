'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/components/ui/BrandLogo';

const loginSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'lananh.nt@edu.vn',
      password: 'demo1234',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const res = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        addToast({
          title: 'Đăng nhập thất bại',
          description: 'Vui lòng kiểm tra lại email hoặc mật khẩu.',
          variant: 'error',
        });
        return;
      }

      addToast({
        title: 'Đăng nhập thành công!',
        description: 'Chào mừng bạn trở lại',
        variant: 'success',
      });

      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json().catch(() => null);
      router.push(session?.user?.role === 'admin' ? '/admin' : '/dashboard');
    } catch {
      addToast({
        title: 'Đăng nhập thất bại',
        description: 'Vui lòng kiểm tra lại email hoặc mật khẩu.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E3F2EF]/40 via-[#FBFDFC] to-white dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <BrandLogo className="w-12 h-12 rounded-2xl shadow-soft" />
          </Link>
          <h1 className="font-serif font-bold text-3xl text-primary-900 dark:text-white">
            Đăng Nhập Sinh Viên
          </h1>
          <p className="mt-2 text-sm text-text-secondary dark:text-gray-400">
            Nền tảng học tiếng Anh cho mọi ngành nghề
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-soft-lg border border-[var(--color-border)]">
          {/* Quick Demo Hint */}
          <div className="mb-6 p-3 rounded-2xl bg-cream/50 dark:bg-gray-800 border border-cream-dark/40 text-xs text-text-secondary dark:text-gray-300 space-y-1">
            <p><strong>Tài khoản Demo sẵn:</strong> Đã điền sẵn tài khoản sinh viên mẫu. Bấm <em>Đăng nhập ngay</em> để trải nghiệm.</p>
            <p>
              <strong>Tài khoản Admin:</strong> <code className="bg-white/60 dark:bg-gray-900/60 px-1 rounded">admin@soonolingo.local</code> / <code className="bg-white/60 dark:bg-gray-900/60 px-1 rounded">admin123</code>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary dark:text-gray-200 mb-1.5">
                Email sinh viên
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="ban@edu.vn"
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-text-primary dark:text-gray-200">
                  Mật khẩu
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary-700 dark:text-primary-400 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 rounded-2xl bg-primary-600 hover:bg-primary-hover text-white font-semibold transition-all shadow-soft flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span>Đang đăng nhập...</span>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-text-secondary">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-primary-700 dark:text-primary-400 font-semibold hover:underline">
              Đăng ký miễn phí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
