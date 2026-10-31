'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Save, Upload, Trash2, GraduationCap } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';

interface SiteContentForm {
  heroBadgeText: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  whyChooseTitle: string;
  whyChooseBullet1: string;
  whyChooseBullet2: string;
  whyChooseBullet3: string;
  footerTagline: string;
  logoImageBase64: string | null;
  logoMimeType: string | null;
}

const MAX_LOGO_BYTES = 1024 * 1024; // 1MB
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];

export default function AdminLandingPage() {
  const [form, setForm] = useState<SiteContentForm | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/admin/site-content').then((r) => r.json()).then(setForm);
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file || !form) return;

    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      setUploadError('Chỉ chấp nhận ảnh PNG, JPG hoặc SVG.');
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setUploadError('Ảnh logo phải nhỏ hơn 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setForm({ ...form, logoImageBase64: base64, logoMimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    if (!form) return;
    setForm({ ...form, logoImageBase64: null, logoMimeType: null });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const res = await fetch('/api/admin/site-content', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) setSavedAt(new Date().toLocaleTimeString('vi-VN'));
  };

  if (!form) {
    return (
      <AdminLayout title="Landing Page" description="Chỉnh sửa nội dung trang chủ">
        <p className="text-center text-sm text-text-muted py-10">Đang tải...</p>
      </AdminLayout>
    );
  }

  const logoSrc = form.logoImageBase64 && form.logoMimeType
    ? `data:${form.logoMimeType};base64,${form.logoImageBase64}`
    : null;

  return (
    <AdminLayout title="Landing Page" description="Chỉnh sửa nội dung trang chủ công khai">
      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        {/* LOGO */}
        <div className="p-6 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft space-y-4">
          <h3 className="font-serif font-bold text-base text-text-primary">Logo</h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white shadow-soft overflow-hidden flex-shrink-0">
              {logoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoSrc} alt="Logo" className="w-full h-full object-contain bg-white" />
              ) : (
                <GraduationCap className="w-8 h-8" />
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-text-secondary hover:bg-background-secondary text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Tải logo lên
              </button>
              {logoSrc && (
                <button
                  type="button"
                  onClick={removeLogo}
                  className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-error hover:bg-error-light text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa logo
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoChange} className="hidden" />
          </div>
          {uploadError && <p className="text-xs text-error">{uploadError}</p>}
          <p className="text-[11px] text-text-muted">PNG, JPG hoặc SVG, tối đa 1MB. Không tải lên thì giữ biểu tượng mặc định.</p>
        </div>

        {/* HERO */}
        <div className="p-6 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft space-y-4">
          <h3 className="font-serif font-bold text-base text-text-primary">Phần Giới Thiệu (Hero)</h3>
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">Badge nhỏ phía trên tiêu đề</label>
            <input value={form.heroBadgeText} onChange={(e) => setForm({ ...form, heroBadgeText: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">Cụm từ nhấn màu trong tiêu đề chính</label>
            <input value={form.heroTitleHighlight} onChange={(e) => setForm({ ...form, heroTitleHighlight: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">Mô tả ngắn (subtitle)</label>
            <textarea rows={3} value={form.heroSubtitle} onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none focus:border-primary-500 resize-none" />
          </div>
        </div>

        {/* WHY CHOOSE */}
        <div className="p-6 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft space-y-4">
          <h3 className="font-serif font-bold text-base text-text-primary">Khối &quot;Vì Sao Chọn English Anxiety Free&quot;</h3>
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">Tiêu đề khối</label>
            <input value={form.whyChooseTitle} onChange={(e) => setForm({ ...form, whyChooseTitle: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none focus:border-primary-500" />
          </div>
          {([1, 2, 3] as const).map((n) => {
            const key = `whyChooseBullet${n}` as const;
            return (
              <div key={key}>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Gạch đầu dòng {n}</label>
                <textarea rows={2} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none focus:border-primary-500 resize-none" />
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="p-6 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft space-y-4">
          <h3 className="font-serif font-bold text-base text-text-primary">Footer</h3>
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">Dòng mô tả dưới tên thương hiệu</label>
            <input value={form.footerTagline} onChange={(e) => setForm({ ...form, footerTagline: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold shadow-soft transition-all flex items-center gap-2">
            <Save className="w-4 h-4" />
            Lưu thay đổi
          </button>
          {savedAt && <span className="text-xs text-success font-medium">Đã lưu lúc {savedAt} — xem lại ở trang chủ</span>}
        </div>
      </form>
    </AdminLayout>
  );
}
