'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, CheckCircle2, UserPlus, TrendingUp, Library,
  ClipboardList, BarChart3, ArrowRight, Image as ImageIcon, HelpCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { SetupChecklist } from '@/components/admin/SetupChecklist';

interface OverviewData {
  total_users: number;
  active_today: number;
  new_this_week: number;
  placement_completion_rate: number;
  signup_trend: { day_label: string; count: number }[];
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);

  useEffect(() => {
    fetch('/api/admin/reports').then((r) => r.json()).then(setData);
  }, []);

  const quickLinks = [
    { href: '/admin/users', label: 'Người dùng', desc: data ? `${data.total_users} tài khoản` : '...', icon: Users },
    { href: '/admin/content', label: 'Bài học', desc: 'Nạp giáo án, xuất bản', icon: Library },
    { href: '/admin/question-bank', label: 'Ngân hàng câu hỏi', desc: 'Nguồn câu cho mọi bài kiểm tra', icon: HelpCircle },
    { href: '/admin/tests', label: 'Đề test', desc: 'Cấu hình bài test đầu vào', icon: ClipboardList },
    { href: '/admin/landing', label: 'Landing Page', desc: 'Nội dung trang chủ & logo', icon: ImageIcon },
    { href: '/admin/reports', label: 'Báo cáo', desc: 'Phân tích chi tiết', icon: BarChart3 },
  ];

  return (
    <AdminLayout title="Tổng Quan Quản Trị" description="Theo dõi nhanh tình trạng hệ thống English Anxiety Free">
      <div className="space-y-8">
        <SetupChecklist />
        {!data ? (
          <p className="text-center text-sm text-text-muted py-10">Đang tải...</p>
        ) : (
          <>
            {/* STAT CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-serif font-bold text-text-primary">{data.total_users}</div>
                  <div className="text-xs text-text-muted">Tổng người dùng</div>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-success-light text-success flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-serif font-bold text-text-primary">{data.active_today}</div>
                  <div className="text-xs text-text-muted">Hoạt động hôm nay</div>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent-light text-accent-dark flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-serif font-bold text-text-primary">{data.placement_completion_rate}%</div>
                  <div className="text-xs text-text-muted">Hoàn thành test đầu vào</div>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-warning-light text-warning-dark flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-serif font-bold text-text-primary">{data.new_this_week}</div>
                  <div className="text-xs text-text-muted">Đăng ký mới tuần này</div>
                </div>
              </div>
            </div>

            {/* CHART */}
            <div className="p-6 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft space-y-4">
              <div>
                <h3 className="font-serif font-bold text-base text-text-primary">Đăng Ký Mới Theo Ngày</h3>
                <p className="text-xs text-text-muted">7 ngày gần nhất</p>
              </div>
              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.signup_trend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3F2EF" />
                    <XAxis dataKey="day_label" tick={{ fontSize: 11, fill: '#5F7370' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#5F7370' }} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #D6EAE7', fontSize: '12px' }} />
                    <Bar dataKey="count" fill="#2F7F7A" radius={[8, 8, 0, 0]} name="Lượt đăng ký" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* QUICK LINKS */}
        <div>
          <h3 className="font-serif font-bold text-base text-text-primary mb-3">Truy Cập Nhanh</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="p-5 rounded-3xl bg-white border border-[var(--color-border)] hover:shadow-card-hover transition-all group flex flex-col"
              >
                <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-3">
                  <link.icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-sm font-bold text-text-primary">
                  {link.label}
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:translate-x-1 group-hover:text-primary-600 transition-transform" />
                </div>
                <p className="text-xs text-text-muted mt-1">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
