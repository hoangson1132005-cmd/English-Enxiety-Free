'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { FloatingAITutor } from '@/components/layout/FloatingAITutor';
import { GuidedTour } from '@/components/features/tour/GuidedTour';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { apiGetProfile } from '@/lib/api';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const { sidebarOpen } = useUIStore();
  const { data: session } = useSession();
  const { setProfile, setUser } = useAuthStore();

  // Load the real profile for the signed-in user (middleware already
  // guarantees a session on every route that renders AppLayout).
  useEffect(() => {
    if (!session?.user) return;
    apiGetProfile()
      .then((profile) => {
        setProfile(profile);
        setUser(profile, 'session');
      })
      .catch(() => {});
  }, [session?.user?.id, setProfile, setUser]);

  return (
    <div className="min-h-screen bg-background dark:bg-gray-950 flex flex-col">
      <Sidebar />
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-200',
          sidebarOpen ? 'md:pl-[240px]' : 'md:pl-[72px]'
        )}
      >
        <Topbar title={title} />
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-12 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
      <BottomNav />
      <FloatingAITutor />
      <GuidedTour />
    </div>
  );
}
