import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  tutorOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  toasts: Toast[];
  
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTutorOpen: (open: boolean) => void;
  toggleTutor: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
  duration?: number;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      tutorOpen: false,
      theme: 'light',
      toasts: [],

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setTutorOpen: (open) => set({ tutorOpen: open }),
      toggleTutor: () => set((s) => ({ tutorOpen: !s.tutorOpen })),
      setTheme: (theme) => set({ theme }),

      addToast: (toast) => {
        const id = Math.random().toString(36).slice(2);
        set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
        setTimeout(() => {
          set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
        }, toast.duration ?? 4000);
      },

      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: 'uth-ui-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
