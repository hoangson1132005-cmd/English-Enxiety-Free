import { create } from 'zustand';

// Phiên bản tiến độ học (không lưu trữ lâu dài): tăng mỗi khi học viên nộp bài.
// Các trang hiển thị tiến độ (Lộ trình) theo dõi số này để tải lại dữ liệu mới, kể cả khi trang được giữ nguyên
// trạng thái lúc điều hướng qua lại (Next.js cacheComponents), tránh hiện bài cũ như chưa hoàn thành.
interface ProgressState {
  version: number;
  bump: () => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  version: 0,
  bump: () => set((s) => ({ version: s.version + 1 })),
}));
