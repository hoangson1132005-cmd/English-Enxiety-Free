'use client';

import React, { useEffect, useState } from 'react';
import { Zap, Flame, CheckCircle2, UserPlus, Trophy } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ADMIN_HELP } from '@/lib/adminHelp';
import { FACULTY_GROUP_LABELS } from '@/types';
import type { AdminUser, FacultyGroup } from '@/types';

interface ReportsData {
  total_users: number;
  active_today: number;
  new_this_week: number;
  placement_completion_rate: number;
  avg_xp: number;
  avg_streak: number;
  signup_trend: { day_label: string; count: number }[];
  faculty_distribution: { faculty_group: FacultyGroup; count: number }[];
  cefr_distribution: { level: string; count: number }[];
  audience_distribution: {
    key: string; label: string; count: number; percent: number; avg_xp: number; placement_rate: number;
    levels: Record<string, number>;
  }[];
  study_year_distribution: { name: string; count: number }[];
  goal_distribution: { name: string; count: number }[];
  interest_distribution: { name: string; count: number }[];
  major_distribution: { name: string; count: number }[];
  top_users: AdminUser[];
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);

  useEffect(() => {
    fetch('/api/admin/reports').then((r) => r.json()).then(setData);
  }, []);

  if (!data) {
    return (
      <AdminLayout title="Báo Cáo & Phân Tích" description="Thống kê tổng hợp toàn hệ thống">
        <p className="text-center text-sm text-text-muted py-10">Đang tải...</p>
      </AdminLayout>
    );
  }

  const facultyData = data.faculty_distribution.map((f) => ({
    name: FACULTY_GROUP_LABELS[f.faculty_group],
    count: f.count,
  }));

  return (
    <AdminLayout title="Báo Cáo & Phân Tích" description="Thống kê tổng hợp toàn hệ thống" help={ADMIN_HELP.reports}>
      <div className="space-y-6">
        {/* STAT CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-text-primary">{data.avg_xp}</div>
              <div className="text-xs text-text-muted">XP trung bình/người</div>
            </div>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-warning-light text-warning-dark flex items-center justify-center flex-shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-text-primary">{data.avg_streak}</div>
              <div className="text-xs text-text-muted">Streak trung bình</div>
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
            <div className="w-12 h-12 rounded-2xl bg-background-secondary text-primary-700 flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-text-primary">{data.new_this_week}</div>
              <div className="text-xs text-text-muted">Đăng ký mới tuần này</div>
            </div>
          </div>
        </div>

        {/* SIGNUP TREND */}
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

        {/* NHÓM ĐỐI TƯỢNG */}
        <div className="p-6 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft space-y-4">
          <div>
            <h3 className="font-serif font-bold text-base text-text-primary">Người dùng theo nhóm đối tượng</h3>
            <p className="text-xs text-text-muted mt-0.5">Sinh viên theo khối ngành và người đã đi làm, cùng trình độ và mức độ hoàn thành test đầu vào của từng nhóm.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.audience_distribution} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E3F2EF" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#5F7370' }} />
                  <YAxis type="category" dataKey="label" width={150} tick={{ fontSize: 11, fill: '#5F7370' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #D6EAE7', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#2F7F7A" radius={[0, 8, 8, 0]} name="Người dùng" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-text-secondary uppercase tracking-wide">
                    <th className="py-2 pr-3">Nhóm</th>
                    <th className="py-2 pr-3">SL</th>
                    <th className="py-2 pr-3">Tỷ lệ</th>
                    <th className="py-2 pr-3">XP TB</th>
                    <th className="py-2 pr-3">Đã test</th>
                    <th className="py-2">A1 / A2 / B1 / B2 / C1</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {data.audience_distribution.map((a) => (
                    <tr key={a.key}>
                      <td className="py-2 pr-3 font-semibold text-text-primary">{a.label}</td>
                      <td className="py-2 pr-3">{a.count}</td>
                      <td className="py-2 pr-3">{a.percent}%</td>
                      <td className="py-2 pr-3">{a.avg_xp}</td>
                      <td className="py-2 pr-3">{a.placement_rate}%</td>
                      <td className="py-2 text-text-secondary">{['A1', 'A2', 'B1', 'B2', 'C1'].map((l) => a.levels[l] ?? 0).join(' / ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-2">
            {[
              { title: 'Năm học (sinh viên)', rows: data.study_year_distribution },
              { title: 'Mục tiêu học', rows: data.goal_distribution },
              { title: 'Lĩnh vực quan tâm (top 8)', rows: data.interest_distribution },
              { title: 'Ngành học (top 8)', rows: data.major_distribution },
            ].map((block) => (
              <div key={block.title} className="p-4 rounded-2xl bg-background-secondary/40">
                <div className="text-xs font-bold text-text-primary mb-2">{block.title}</div>
                {block.rows.length === 0 ? (
                  <p className="text-[11px] text-text-muted">Chưa có dữ liệu</p>
                ) : (
                  <ul className="space-y-1">
                    {block.rows.map((r) => (
                      <li key={r.name} className="flex justify-between gap-2 text-[11px] text-text-secondary">
                        <span className="truncate">{r.name}</span>
                        <strong className="text-text-primary">{r.count}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* DISTRIBUTION CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft space-y-4">
            <h3 className="font-serif font-bold text-base text-text-primary">Phân Bổ Theo Khối Ngành</h3>
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={facultyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3F2EF" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5F7370' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#5F7370' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #D6EAE7', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#2F7F7A" radius={[8, 8, 0, 0]} name="Người dùng" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[var(--color-border)] shadow-soft space-y-4">
            <h3 className="font-serif font-bold text-base text-text-primary">Phân Bổ Trình Độ CEFR</h3>
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.cefr_distribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3F2EF" />
                  <XAxis dataKey="level" tick={{ fontSize: 11, fill: '#5F7370' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#5F7370' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #D6EAE7', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#F4A7B9" radius={[8, 8, 0, 0]} name="Người dùng" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* LEADERBOARD */}
        <div className="rounded-3xl bg-white border border-[var(--color-border)] shadow-soft overflow-hidden">
          <div className="p-5 border-b border-[var(--color-border)] flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning-dark" />
            <h3 className="font-serif font-bold text-base text-text-primary">Top 5 Người Dùng Theo XP</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-[var(--color-border)]">
                {data.top_users.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-background-secondary/30 transition-colors">
                    <td className="px-5 py-3 w-10 text-center font-bold text-text-muted">{idx + 1}</td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-text-primary">{u.full_name}</div>
                      <div className="text-xs text-text-muted">{FACULTY_GROUP_LABELS[u.faculty_group]} · {u.current_level}</div>
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-primary-700">{u.total_xp} XP</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
