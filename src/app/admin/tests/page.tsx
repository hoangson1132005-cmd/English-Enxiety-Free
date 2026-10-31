'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Upload, Trash2, CheckCircle2, FileText } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AiImportModal } from '@/components/admin/AiImportModal';
import { cn } from '@/lib/utils';

interface TestSummary {
  id: string; title: string; description: string; duration_minutes: number;
  is_active: boolean; created_at: string; created_via: string; question_count: number;
}

export default function AdminTestsListPage() {
  const router = useRouter();
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/admin/tests').then((r) => r.json()).then((data) => { setTests(data); setLoading(false); });
  };

  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const res = await fetch('/api/admin/tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    });
    if (res.ok) {
      const created = await res.json();
      router.push(`/admin/tests/${created.id}`);
    }
  };

  const handleActivate = async (id: string) => {
    await fetch(`/api/admin/tests/${id}/activate`, { method: 'PATCH' });
    load();
  };

  const handleDelete = async (t: TestSummary) => {
    if (t.is_active) { alert('Không thể xóa đề đang dùng. Hãy kích hoạt đề khác trước.'); return; }
    if (!confirm(`Xóa đề "${t.title}"?`)) return;
    const res = await fetch(`/api/admin/tests/${t.id}`, { method: 'DELETE' });
    if (res.ok) setTests((prev) => prev.filter((x) => x.id !== t.id));
    else alert((await res.json()).error || 'Xóa thất bại');
  };

  return (
    <AdminLayout title="Quản Lý Đề Test" description={`${tests.length} đề test · lưu toàn bộ lịch sử`}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="px-4 py-2.5 rounded-xl border border-primary-300 text-primary-700 hover:bg-primary-50 text-sm font-semibold transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Tải file lên (AI tạo đề)
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold shadow-soft transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tạo đề mới
          </button>
        </div>

        {loading && <p className="text-center text-sm text-text-muted py-10">Đang tải...</p>}

        <div className="space-y-3">
          {tests.map((t) => (
            <div key={t.id} className="rounded-3xl bg-white border border-[var(--color-border)] shadow-soft p-5 flex items-center justify-between gap-4">
              <Link href={`/admin/tests/${t.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary truncate">{t.title}</span>
                    {t.is_active && (
                      <span className="text-[10px] font-bold bg-success-light text-success px-2 py-0.5 rounded-full flex-shrink-0">Đang dùng</span>
                    )}
                  </div>
                  <div className="text-xs text-text-muted flex items-center gap-3 mt-0.5">
                    <span>{t.question_count} câu hỏi</span>
                    <span>{t.duration_minutes} phút</span>
                    <span>{t.created_via === 'ai_import' ? 'Tạo bằng AI' : 'Tạo thủ công'}</span>
                    <span>{new Date(t.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </Link>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {!t.is_active && (
                  <button
                    onClick={() => handleActivate(t.id)}
                    title="Kích hoạt"
                    className="p-2 rounded-xl text-text-muted hover:text-success hover:bg-success-light transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(t)}
                  title="Xóa"
                  className={cn(
                    'p-2 rounded-xl transition-colors',
                    t.is_active ? 'text-text-muted/30 cursor-not-allowed' : 'text-text-muted hover:text-error hover:bg-error-light'
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {!loading && tests.length === 0 && (
            <p className="text-center text-sm text-text-muted py-10">Chưa có đề test nào. Tạo đề mới hoặc tải file lên để AI tạo tự động.</p>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-soft-lg border border-[var(--color-border)]">
            <h3 className="font-display font-bold text-lg text-primary-900 mb-4">Tạo Đề Test Mới</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Tên đề test</label>
                <input
                  required autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-text-secondary text-sm font-medium">
                  Hủy
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold shadow-soft">
                  Tạo & sửa đề
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImport && (
        <AiImportModal
          title="Tải File Tạo Đề Test"
          description="AI sẽ đọc file Word/PDF và tự tạo đề test với các phần thi + câu hỏi tương ứng. Đề mới sẽ ở trạng thái nháp, bạn xem lại trước khi kích hoạt."
          endpoint="/api/admin/import/test"
          onClose={() => setShowImport(false)}
          onSuccess={(data) => {
            const { test_id } = data as { test_id: string };
            router.push(`/admin/tests/${test_id}`);
          }}
        />
      )}
    </AdminLayout>
  );
}
