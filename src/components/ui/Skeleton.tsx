import React from 'react';
import { cn } from '@/lib/utils';

// Khung chờ khi đang tải dữ liệu: giữ bố cục ổn định thay vì dòng chữ "Đang tải..." trơ trọi.
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-gray-200/70 dark:bg-gray-800', className)} aria-hidden="true" />;
}

export function RoadmapSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Đang tải lộ trình">
      <Skeleton className="h-44 rounded-3xl" />
      <Skeleton className="h-40 rounded-3xl" />
      <div className="grid sm:grid-cols-2 gap-3">
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
    </div>
  );
}

export function LessonSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-5" role="status" aria-label="Đang tải bài học">
      <Skeleton className="h-3 w-full rounded-full" />
      <Skeleton className="h-28 rounded-3xl" />
      <Skeleton className="h-64 rounded-3xl" />
      <Skeleton className="h-12 w-56 mx-auto" />
    </div>
  );
}
