'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Map, FlipHorizontal, Bot, User, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { BrandLogo } from '@/components/ui/BrandLogo';

const navItems = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/roadmap', label: 'Lộ trình', icon: Map },
  { href: '/vocab', label: 'Từ vựng', icon: FlipHorizontal },
  { href: '/tutor', label: 'AI Tutor', icon: Bot },
  { href: '/profile', label: 'Hồ sơ', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { profile, logout } = useAuthStore();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const handleLogout = () => {
    logout();
    signOut({ callbackUrl: '/' });
  };

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 72 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'hidden md:flex flex-col h-screen bg-white dark:bg-gray-900',
        'border-r border-[var(--color-border)] fixed left-0 top-0 z-40',
        'shadow-soft overflow-hidden'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-[var(--color-border)]',
        !sidebarOpen && 'justify-center px-2'
      )}>
        <BrandLogo className="w-9 h-9 rounded-xl shadow-soft" />
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="font-display font-bold text-primary-700 dark:text-primary-300 text-sm leading-tight">English Anxiety Free</div>
            <div className="text-[10px] text-text-secondary font-sans">for Logistics</div>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer',
                  sidebarOpen ? '' : 'justify-center',
                  active
                    ? 'bg-primary-50 dark:bg-primary-dark/20 text-primary-700 dark:text-primary-300 font-semibold'
                    : 'text-text-secondary hover:bg-background-secondary dark:hover:bg-gray-800 hover:text-primary-600'
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-primary-600')} />
                {sidebarOpen && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {active && sidebarOpen && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      {profile && (
        <div className={cn(
          'border-t border-[var(--color-border)] p-3',
          !sidebarOpen && 'flex justify-center'
        )}>
          {sidebarOpen ? (
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary-400 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {profile.full_name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text-primary truncate">{profile.full_name.split(' ').slice(-2).join(' ')}</div>
                <div className="text-xs text-text-muted truncate">{profile.student_id}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg hover:bg-error-light text-text-muted hover:text-error transition-colors"
                aria-label="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-error-light text-text-muted hover:text-error transition-colors"
              aria-label="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'absolute -right-3 top-20 w-6 h-6 rounded-full',
          'bg-white dark:bg-gray-800 border border-[var(--color-border)]',
          'shadow-soft flex items-center justify-center',
          'hover:bg-primary-50 hover:border-primary-300 transition-all z-50'
        )}
        aria-label={sidebarOpen ? 'Thu nhỏ sidebar' : 'Mở rộng sidebar'}
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-3 h-3 text-text-secondary" />
        ) : (
          <ChevronRight className="w-3 h-3 text-text-secondary" />
        )}
      </button>
    </motion.aside>
  );
}
