'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Library, ClipboardList, BarChart3,
  ShieldCheck, ArrowLeftRight, Image as ImageIcon, HelpCircle, History,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Người dùng', icon: Users },
  { href: '/admin/content', label: 'Bài học', icon: Library, extraMatch: '/admin/lessons' },
  { href: '/admin/question-bank', label: 'Ngân hàng câu hỏi', icon: HelpCircle },
  { href: '/admin/quiz-sessions', label: 'Lịch sử bốc câu', icon: History },
  { href: '/admin/tests', label: 'Đề test', icon: ClipboardList },
  { href: '/admin/landing', label: 'Landing Page', icon: ImageIcon },
  { href: '/admin/reports', label: 'Báo cáo', icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, extraMatch?: string) =>
    href === '/admin'
      ? pathname === '/admin'
      : pathname.startsWith(href) || (!!extraMatch && pathname.startsWith(extraMatch));

  return (
    <aside className="hidden md:flex flex-col w-[240px] h-screen bg-white dark:bg-gray-900 border-r border-[var(--color-border)] fixed left-0 top-0 z-40 shadow-soft">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[var(--color-border)]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center flex-shrink-0 shadow-soft">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-display font-bold text-primary-700 dark:text-primary-300 text-sm leading-tight">English Anxiety Free</div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-accent-dark">Admin</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {adminNavItems.map((item) => {
          const active = isActive(item.href, item.extraMatch);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer',
                  active
                    ? 'bg-primary-50 dark:bg-primary-dark/20 text-primary-700 dark:text-primary-300 font-semibold'
                    : 'text-text-secondary hover:bg-background-secondary dark:hover:bg-gray-800 hover:text-primary-600'
                )}
              >
                <item.icon className={cn('w-4 h-4 flex-shrink-0', active && 'text-primary-600')} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Back to student app */}
      <div className="border-t border-[var(--color-border)] p-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-text-secondary hover:bg-background-secondary dark:hover:bg-gray-800 hover:text-primary-600 transition-colors text-sm font-medium"
        >
          <ArrowLeftRight className="w-4 h-4 flex-shrink-0" />
          <span>Về trang học viên</span>
        </Link>
      </div>
    </aside>
  );
}
