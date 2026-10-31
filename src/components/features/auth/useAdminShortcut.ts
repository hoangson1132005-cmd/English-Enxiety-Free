'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const CLICKS = 5; // bấm logo 5 lần liên tiếp...
const WINDOW_MS = 2000; // ...trong 2 giây
// Lối vào ẩn cho quản trị viên (không hiển thị link công khai). Chỉ là lối tắt tiện dụng: quyền truy cập
// thật sự do middleware kiểm tra ở server (chưa đăng nhập -> trang đăng nhập; không phải admin -> về dashboard).
export function useAdminShortcut() {
  const router = useRouter();
  const clicks = useRef<number[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        router.push('/admin');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  return useCallback(
    (e: React.MouseEvent) => {
      const now = Date.now();
      clicks.current = [...clicks.current.filter((t) => now - t < WINDOW_MS), now];
      if (clicks.current.length >= CLICKS) {
        clicks.current = [];
        e.preventDefault();
        router.push('/admin');
      }
    },
    [router]
  );
}
