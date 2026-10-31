'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { adminNavItems } from '@/lib/adminNav';
import { HelpNote, type HelpNoteProps } from '@/components/admin/HelpNote';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  help?: HelpNoteProps; // ghi chú hướng dẫn kèm link nhanh ở đầu trang
}

export function AdminLayout({ children, title, description, help }: AdminLayoutProps) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminSidebar />

      <div className="flex-1 flex flex-col md:pl-[240px]">
        {/* Mobile top nav */}
        <nav className="md:hidden sticky top-0 z-30 bg-white border-b border-[var(--color-border)] px-2 py-2 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {adminNavItems.map((item) => {
            const active = isActive(item.href) || ('extraMatch' in item && !!item.extraMatch && pathname.startsWith(item.extraMatch));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors',
                  active ? 'bg-primary-50 text-primary-700' : 'text-text-secondary hover:bg-background-secondary'
                )}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Topbar */}
        <header className="sticky top-0 md:top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-[var(--color-border)] px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-lg text-primary-900">{title}</h1>
              {description && <p className="text-xs text-text-secondary mt-0.5">{description}</p>}
            </div>
            <Link
              href="/"
              className="text-xs font-medium text-text-secondary hover:text-primary-600 px-3 py-1.5 rounded-xl transition-colors hidden sm:inline-flex"
            >
              Thoát khu vực quản trị
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full animate-fade-in">
          {help && <HelpNote {...help} />}
          {children}
        </main>
      </div>
    </div>
  );
}
