'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

interface Step {
  target?: string; // selector của phần tử cần làm nổi bật; bỏ trống = thẻ ở giữa màn hình
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    title: 'Chào mừng bạn đến với English Anxiety Free!',
    body: 'Chỉ mất 1 phút để bạn nắm cách học ở đây. Mỗi người có một lộ trình riêng do AI thiết kế dựa trên trình độ, ngành nghề và mục tiêu của bạn.',
  },
  {
    target: '[data-tour="cta"]',
    title: 'Nút “việc nên làm tiếp theo”',
    body: 'Mỗi lần vào, hãy bấm nút này: nó dẫn bạn thẳng tới bước tiếp theo (làm test đầu vào, học bài kế tiếp hoặc làm bài kiểm tra cuối khóa).',
  },
  {
    target: '[data-tour="nav-roadmap"]',
    title: 'Lộ trình của bạn',
    body: 'Bài học được chia thành các chặng riêng cho bạn. Học lần lượt từng bài: đạt điểm yêu cầu sẽ mở bài kế tiếp. Xong mỗi chặng có bài kiểm tra cuối chặng, xong cả lộ trình có bài kiểm tra cuối khóa để lên level.',
  },
  {
    target: '[data-tour="nav-vocab"]',
    title: 'Kho từ vựng của bạn',
    body: 'Từ vựng gặp trong bài được lưu tự động vào đây và ở lại mãi, kể cả khi sang lộ trình mới. Bạn có thể ôn bằng flashcard, thêm, sửa hoặc xóa tùy ý.',
  },
  {
    target: '[data-tour="nav-tutor"]',
    title: 'AI Tutor 24/7',
    body: 'Hỏi bất cứ điều gì về tiếng Anh: giải thích từ, sửa email, luyện hội thoại. Bạn cũng có thể mở nhanh bằng nút chat nổi ở góc màn hình.',
  },
  {
    target: '[data-tour="nav-profile"]',
    title: 'Hồ sơ và cài đặt',
    body: 'Cập nhật ngành nghề, mục tiêu, số phút học mỗi ngày và đổi mật khẩu tại đây. Thông tin này giúp AI chọn bài phù hợp hơn với bạn.',
  },
  {
    title: 'Mẹo để tiến bộ nhanh',
    body: 'Học đều mỗi ngày 15–20 phút tốt hơn học dồn. Bài chưa đạt cứ làm lại: mỗi lần bạn sẽ nhận bộ câu hỏi mới và xem được lời giải kèm nhận xét. Chúc bạn học vui!',
  },
];

const PADDING = 8;
const CARD_WIDTH = 340;
const doneKey = (userId: string) => `tour-done:${userId}`;

function isDone(userId: string) {
  try {
    return localStorage.getItem(doneKey(userId)) === '1';
  } catch {
    return true; // không đọc được bộ nhớ trình duyệt: không tự bật tour để khỏi làm phiền lặp lại
  }
}

// Tìm phần tử đang hiển thị (thanh bên trên máy tính, thanh dưới trên điện thoại cùng tồn tại trong DOM).
function findVisible(selector: string): HTMLElement | null {
  for (const el of Array.from(document.querySelectorAll<HTMLElement>(selector))) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

// Tour giới thiệu cho học viên mới: tự chạy lần đầu vào Tổng quan / Lộ trình, xem lại bằng /dashboard?tour=1.
export function GuidedTour() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const indexRef = useRef(0);

  const measure = useCallback((i: number) => {
    const sel = STEPS[i]?.target;
    const el = sel ? findVisible(sel) : null;
    if (!el) {
      setRect(null);
      return;
    }
    el.scrollIntoView({ block: 'center', behavior: 'auto' });
    const r = el.getBoundingClientRect();
    setRect({ top: r.top - PADDING, left: r.left - PADDING, width: r.width + PADDING * 2, height: r.height + PADDING * 2 });
  }, []);

  const goTo = useCallback((i: number) => {
    indexRef.current = i;
    setIndex(i);
    measure(i);
  }, [measure]);

  const finish = useCallback(() => {
    if (userId) {
      try {
        localStorage.setItem(doneKey(userId), '1');
      } catch {
        // bỏ qua
      }
    }
    setActive(false);
  }, [userId]);

  // Tự bật lần đầu (hoặc khi có ?tour=1). Dùng timer để chờ giao diện dựng xong.
  useEffect(() => {
    if (!userId || (pathname !== '/dashboard' && pathname !== '/roadmap')) return;
    const timer = setTimeout(() => {
      const forced = new URLSearchParams(window.location.search).get('tour') === '1';
      if (forced || !isDone(userId)) {
        setActive(true);
        goTo(0);
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [userId, pathname, goTo]);

  // Cập nhật vị trí khi đổi kích thước / cuộn; phím tắt.
  useEffect(() => {
    if (!active) return;
    const remeasure = () => {
      const sel = STEPS[indexRef.current]?.target;
      const el = sel ? findVisible(sel) : null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ top: r.top - PADDING, left: r.left - PADDING, width: r.width + PADDING * 2, height: r.height + PADDING * 2 });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (indexRef.current >= STEPS.length - 1) finish();
        else goTo(indexRef.current + 1);
      }
      if (e.key === 'ArrowLeft' && indexRef.current > 0) goTo(indexRef.current - 1);
    };
    window.addEventListener('resize', remeasure);
    window.addEventListener('scroll', remeasure, true);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', remeasure);
      window.removeEventListener('scroll', remeasure, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [active, finish, goTo]);

  if (!active) return null;

  const step = STEPS[index];
  const last = index === STEPS.length - 1;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
  const cardWidth = Math.min(CARD_WIDTH, vw - 24);

  let cardStyle: React.CSSProperties;
  if (rect) {
    const below = rect.top + rect.height + 12 + 190 < vh;
    const top = below ? rect.top + rect.height + 12 : Math.max(12, rect.top - 12 - 200);
    // Thanh bên ở sát mép trái: đặt thẻ bên phải phần tử; ngược lại căn giữa theo phần tử
    const preferRight = rect.left + rect.width + 12 + cardWidth < vw && rect.width < vw * 0.5 && rect.left < 120;
    const left = preferRight ? rect.left + rect.width + 12 : Math.min(Math.max(12, rect.left + rect.width / 2 - cardWidth / 2), vw - cardWidth - 12);
    cardStyle = { top: preferRight ? Math.max(12, Math.min(rect.top, vh - 220)) : top, left, width: cardWidth };
  } else {
    cardStyle = { top: '50%', left: '50%', width: cardWidth, transform: 'translate(-50%, -50%)' };
  }

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Hướng dẫn sử dụng">
      {/* lớp chặn thao tác + khoét sáng quanh phần tử được giới thiệu */}
      {rect ? (
        <div
          className="absolute rounded-2xl pointer-events-none transition-all duration-300"
          style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height, boxShadow: '0 0 0 9999px rgba(15, 40, 38, 0.62)' }}
        />
      ) : (
        <div className="absolute inset-0 bg-[rgba(15,40,38,0.62)]" />
      )}
      <div className="absolute inset-0" onClick={(e) => e.stopPropagation()} />

      <div className="absolute bg-white dark:bg-gray-900 rounded-3xl shadow-soft-lg border border-[var(--color-border)] p-5 animate-fade-in" style={cardStyle}>
        <button type="button" onClick={finish} aria-label="Bỏ qua hướng dẫn" className="absolute top-3 right-3 p-1 rounded-lg text-text-muted hover:bg-background-secondary">
          <X className="w-4 h-4" />
        </button>
        <div className="text-[10px] font-bold uppercase tracking-widest text-accent-dark mb-1">
          Bước {index + 1}/{STEPS.length}
        </div>
        <h3 className="font-display font-bold text-base text-primary-900 dark:text-white pr-6">{step.title}</h3>
        <p className="mt-2 text-xs sm:text-sm text-text-secondary dark:text-gray-300 leading-relaxed">{step.body}</p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex gap-1" aria-hidden="true">
            {STEPS.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-primary-600' : 'w-1.5 bg-gray-300'}`} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {index > 0 ? (
              <button type="button" onClick={() => goTo(index - 1)} className="p-2 rounded-xl border border-[var(--color-border)] text-text-secondary hover:bg-background-secondary" aria-label="Bước trước">
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={finish} className="px-3 py-2 text-xs text-text-muted hover:text-text-primary underline">Bỏ qua</button>
            )}
            <button
              type="button"
              onClick={() => (last ? finish() : goTo(index + 1))}
              className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5"
            >
              {last ? 'Bắt đầu học' : 'Tiếp theo'}
              {!last && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
