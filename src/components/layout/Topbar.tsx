'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, Flame, Bot, Bell, BookOpenCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { apiGetNotifications, type NotificationItem } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  const profile = useAuthStore((s) => s.profile);
  const { toggleTutor } = useUIStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifItems, setNotifItems] = useState<NotificationItem[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiGetNotifications()
      .then((data) => {
        setNotifItems(data.items);
        setHasUnread(data.has_unread);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!notifOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [notifOpen]);

  const handleToggleNotif = () => {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next) {
      setHasUnread(false);
      setNotifLoading(true);
      apiGetNotifications()
        .then((data) => setNotifItems(data.items))
        .finally(() => setNotifLoading(false));
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-[var(--color-border)] px-4 md:px-6 py-3">
      <div className="flex items-center gap-4">
        {/* Title */}
        {title && (
          <h1 className="font-display font-bold text-primary-800 dark:text-primary-200 text-lg hidden md:block">
            {title}
          </h1>
        )}

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="search"
              placeholder="Tìm kiếm bài học, từ vựng..."
              className={cn(
                'w-full pl-9 pr-4 py-2 text-sm rounded-xl',
                'bg-background-secondary dark:bg-gray-800',
                'border border-transparent focus:border-primary-300 focus:bg-white dark:focus:bg-gray-700',
                'text-text-primary placeholder:text-text-muted',
                'transition-all duration-200 outline-none'
              )}
              aria-label="Tìm kiếm"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Streak */}
          {profile && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-warning-light border border-warning/20">
              <Flame className="w-4 h-4 text-warning-dark" />
              <span className="text-sm font-semibold text-warning-dark">{profile.streak}</span>
            </div>
          )}

          {/* AI Tutor button */}
          <button
            onClick={toggleTutor}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all',
              'bg-primary-50 hover:bg-primary-100 dark:bg-primary-dark/20 dark:hover:bg-primary-dark/30',
              'text-primary-700 dark:text-primary-300 font-medium text-sm'
            )}
            aria-label="Mở AI Tutor"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">AI Tutor</span>
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleToggleNotif}
              className="relative p-2 rounded-xl hover:bg-background-secondary dark:hover:bg-gray-800 transition-colors"
              aria-label="Thông báo"
            >
              <Bell className="w-5 h-5 text-text-secondary" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent border-2 border-white dark:border-gray-900" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-900 border border-[var(--color-border)] rounded-2xl shadow-soft-lg z-40">
                <div className="px-4 py-3 border-b border-[var(--color-border)]">
                  <h3 className="font-display font-bold text-sm text-text-primary dark:text-white">Thông báo</h3>
                </div>
                {notifLoading ? (
                  <p className="text-xs text-text-muted text-center py-6">Đang tải...</p>
                ) : notifItems.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-6">Chưa có thông báo nào.</p>
                ) : (
                  <ul className="divide-y divide-[var(--color-border)]">
                    {notifItems.map((item) => (
                      <li key={item.id} className="px-4 py-3 flex gap-2.5">
                        <BookOpenCheck className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-text-primary dark:text-white leading-snug">{item.title}</p>
                          <p className="text-[11px] text-text-secondary dark:text-gray-400 mt-0.5">{item.description}</p>
                          <p className="text-[10px] text-text-muted mt-1">{formatDate(item.created_at)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Avatar */}
          {profile && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary-400 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {profile.full_name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
