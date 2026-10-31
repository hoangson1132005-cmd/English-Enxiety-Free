'use client';

import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ChangePasswordForm } from '@/components/account/ChangePasswordForm';

export default function AdminAccountPage() {
  return (
    <AdminLayout
      title="Tài Khoản Của Tôi"
      description="Bảo mật tài khoản quản trị"
      help={{
        id: 'admin-account',
        title: 'Đổi mật khẩu quản trị trước khi triển khai',
        items: [
          'Mật khẩu admin mặc định của bản cài đặt mẫu là công khai trong tài liệu, nên cần đổi ngay trước khi đưa cho khách.',
          'Dùng mật khẩu dài, khó đoán. Quên mật khẩu admin? Chạy lệnh: npx tsx scripts/set-admin-password.ts <email> <mật-khẩu-mới>.',
        ],
        links: [{ href: '/admin', label: 'Về Tổng quan' }],
      }}
    >
      <div className="p-6 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft">
        <ChangePasswordForm />
      </div>
    </AdminLayout>
  );
}
