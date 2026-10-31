'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, FlipHorizontal, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileNavItems = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/roadmap', label: 'Lộ trình', icon: Map },
  { href: '/vocab', label: 'Từ vựng', icon: FlipHorizontal },
  { href: '/tutor', label: 'AI Tutor', icon: Bot },
  { href: '/profile', label: 'Hồ sơ', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white dark:bg-gray-900 border-t border-[var(--color-border)] bottom-nav">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNavItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all min-w-0',
                active
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-text-muted hover:text-primary-500'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <item.icon className={cn('w-5 h-5', active && 'text-primary-600')} />
              <span className={cn('text-[10px] font-medium truncate', active && 'font-semibold')}>
                {item.label}
              </span>
              {active && (
                <div className="w-1 h-1 rounded-full bg-primary-500 absolute bottom-1" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
