'use client';

import React from 'react';
import { ShieldCheck, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export function ResearchConsentModal({ isOpen, onClose, onAccept }: Props) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-soft-lg border border-[var(--color-border)] max-h-[85vh] flex flex-col"
        >
          <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-primary-900 dark:text-white">
                  Cam Kết Bảo Mật Dữ Liệu
                </h3>
                <p className="text-xs text-text-secondary">Chính sách sử dụng dữ liệu học tập</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-text-muted hover:text-text-primary hover:bg-background-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 text-xs sm:text-sm text-text-secondary dark:text-gray-300 space-y-3 leading-relaxed">
            <p>
              Chào bạn! Nền tảng <strong>English Anxiety Free</strong> thu thập một số dữ liệu học tập để cá nhân hóa trải nghiệm và cải thiện chất lượng nội dung cho bạn.
            </p>
            <h4 className="font-semibold text-text-primary dark:text-white pt-2">1. Mục đích thu thập dữ liệu:</h4>
            <p>
              Chúng tôi phân tích điểm số, thời gian làm bài và tỷ lệ đúng/sai để tối ưu lộ trình học, đề xuất bài luyện phù hợp và cải thiện chất lượng nội dung học tập.
            </p>

            <h4 className="font-semibold text-text-primary dark:text-white pt-2">2. Tính bảo mật và ẩn danh:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Mọi dữ liệu điểm số, thời gian làm bài, tỷ lệ đúng/sai đều được <strong>mã hóa và ẩn danh hóa</strong> hoàn toàn (Anonymized Data).</li>
              <li>Thông tin nhận dạng cá nhân (Họ tên, Email) được lưu trữ tách biệt và <strong>không bao giờ</strong> được chia sẻ hoặc công bố công khai.</li>
              <li>Dữ liệu chỉ được dùng để cải thiện trải nghiệm học tập, cam kết không chia sẻ với bất kỳ bên thứ ba vì mục đích thương mại.</li>
            </ul>

            <h4 className="font-semibold text-text-primary dark:text-white pt-2">3. Quyền lợi của bạn:</h4>
            <p>
              Bạn được sử dụng <strong>100% miễn phí</strong> toàn bộ tài nguyên học tập, hệ thống đề thi chuẩn hóa và trợ lý AI Tutor trong suốt thời gian sử dụng nền tảng.
            </p>
          </div>

          <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-text-secondary hover:bg-background-secondary text-xs sm:text-sm font-medium transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold transition-all shadow-soft flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Tôi hiểu và đồng ý</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
