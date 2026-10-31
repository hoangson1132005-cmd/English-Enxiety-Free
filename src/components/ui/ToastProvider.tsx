'use client';

import React from 'react';
import { useUIStore } from '@/store/uiStore';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function ToastProvider() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-16 right-4 md:bottom-6 md:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const icons = {
            default: <Info className="w-5 h-5 text-primary-600 flex-shrink-0" />,
            success: <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />,
          };
          const variant = toast.variant || 'default';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'pointer-events-auto p-4 rounded-2xl shadow-soft-lg flex items-start gap-3 border bg-white dark:bg-gray-800',
                variant === 'success' && 'border-success/30 bg-success-light/40 dark:bg-success-dark/20',
                variant === 'error' && 'border-error/30 bg-error-light/40 dark:bg-error-dark/20',
                variant === 'warning' && 'border-warning/30 bg-warning-light/40 dark:bg-warning-dark/20',
                variant === 'default' && 'border-primary-100 dark:border-primary-900/40'
              )}
            >
              {icons[variant]}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-text-primary dark:text-gray-100">{toast.title}</h4>
                {toast.description && (
                  <p className="text-xs text-text-secondary dark:text-gray-300 mt-0.5">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-text-muted hover:text-text-primary p-0.5 rounded-lg transition-colors"
                aria-label="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
