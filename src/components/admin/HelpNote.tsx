'use client';

import React, { useCallback, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Lightbulb, ChevronDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HelpNoteProps {
  id: string; // khóa lưu trạng thái thu gọn của từng ghi chú
  title: string;
  items: React.ReactNode[];
  links?: { href: string; label: string }[];
}

const KEY_PREFIX = 'admin-help-collapsed:';
const EVENT = 'admin-help-change';

function readCollapsed(id: string) {
  try {
    return localStorage.getItem(KEY_PREFIX + id) === '1';
  } catch {
    return false; // trình duyệt chặn lưu trữ: luôn mở ghi chú
  }
}

// Ghi chú hướng dẫn ở đầu mỗi trang admin: nói trang này để làm gì, nên làm gì tiếp theo, kèm link bấm nhanh.
// Có thể thu gọn; trạng thái được nhớ trên trình duyệt.
export function HelpNote({ id, title, items, links }: HelpNoteProps) {
  const subscribe = useCallback((cb: () => void) => {
    window.addEventListener(EVENT, cb);
    window.addEventListener('storage', cb);
    return () => {
      window.removeEventListener(EVENT, cb);
      window.removeEventListener('storage', cb);
    };
  }, []);
  const collapsed = useSyncExternalStore(subscribe, () => readCollapsed(id), () => false);

  const toggle = () => {
    try {
      localStorage.setItem(KEY_PREFIX + id, collapsed ? '0' : '1');
    } catch {
      // bỏ qua
    }
    window.dispatchEvent(new Event(EVENT));
  };

  return (
    <div className="rounded-2xl border border-cream-dark/60 bg-cream/40 dark:bg-gray-900 mb-5 overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={!collapsed}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left"
      >
        <span className="w-7 h-7 rounded-lg bg-accent/15 text-accent-dark flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-4 h-4" />
        </span>
        <span className="flex-1 text-sm font-semibold text-primary-900 dark:text-white">{title}</span>
        <span className="text-[11px] text-text-muted hidden sm:inline">{collapsed ? 'Xem hướng dẫn' : 'Thu gọn'}</span>
        <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', !collapsed && 'rotate-180')} />
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 pt-0 space-y-3">
          <ul className="space-y-1.5 text-xs text-text-secondary dark:text-gray-300 leading-relaxed list-disc pl-9 pr-1">
            {items.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
          {links && links.length > 0 && (
            <div className="flex flex-wrap gap-2 pl-9">
              {links.map((l) => (
                <Link
                  key={l.href + l.label}
                  href={l.href}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-primary-200 dark:border-gray-700 text-[11px] font-semibold text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:shadow-sm transition-all"
                >
                  {l.label}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
