'use client';

import React, { useState } from 'react';
import { X, UploadCloud, Sparkles } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  endpoint: string;
  onSuccess: (data: unknown) => void;
  onClose: () => void;
}

export function AiImportModal({ title, description, endpoint, onSuccess, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(endpoint, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Xử lý thất bại');
        return;
      }
      onSuccess(data);
    } catch {
      setError('Không thể kết nối tới máy chủ. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-soft-lg border border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-bold text-lg text-primary-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" /> {title}
          </h3>
          <button onClick={onClose} className="p-1 rounded-xl text-text-muted hover:bg-background-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-text-secondary mb-4">{description}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col items-center justify-center gap-2 p-8 rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50/30 cursor-pointer hover:border-primary-400 transition-colors text-center">
            <UploadCloud className="w-8 h-8 text-primary-500" />
            <span className="text-xs font-semibold text-text-primary">
              {file ? file.name : 'Chọn file .docx hoặc .pdf (tối đa 8MB)'}
            </span>
            <input
              type="file"
              accept=".docx,.pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>

          {error && <p className="text-xs text-error">{error}</p>}

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold shadow-soft transition-all disabled:opacity-40"
          >
            {uploading ? 'AI đang đọc và phân tích file...' : 'Phân tích bằng AI'}
          </button>
        </form>
      </div>
    </div>
  );
}
