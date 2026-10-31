'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Search, UserPlus, Ban, CheckCircle2, Trash2, X, Pencil, Route,
} from 'lucide-react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { FACULTY_GROUP_LABELS, MAJORS_BY_FACULTY, JOB_INTEREST_OPTIONS } from '@/types';
import type { AdminUser, FacultyGroup, CEFRLevel, InterestArea } from '@/types';
import { cn, formatDate } from '@/lib/utils';

const INTEREST_LABELS: Record<string, string> = Object.fromEntries(
  JOB_INTEREST_OPTIONS.map((o) => [o.id, o.label])
);

const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [facultyFilter, setFacultyFilter] = useState<'all' | FacultyGroup>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [newUser, setNewUser] = useState({ full_name: '', student_id: '', email: '', faculty_group: 'engineering' as FacultyGroup });

  const fetchUsers = () => {
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  };

  const loadUsers = () => {
    setLoading(true);
    fetchUsers();
  };

  useEffect(fetchUsers, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !search ||
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.student_id.includes(search) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesFaculty = facultyFilter === 'all' || u.faculty_group === facultyFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchesSearch && matchesFaculty && matchesStatus;
    });
  }, [users, search, facultyFilter, statusFilter]);

  const patchUser = async (id: string, data: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const updated = await res.json();
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
  };

  const toggleStatus = (u: AdminUser) => {
    patchUser(u.id, { status: u.status === 'active' ? 'disabled' : 'active' });
  };

  const removeUser = async (id: string, name: string) => {
    if (!confirm(`Xóa người dùng "${name}"? Hành động này không thể hoàn tác.`)) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.full_name || !newUser.student_id || !newUser.email) return;
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      const created = await res.json();
      setUsers((prev) => [created, ...prev]);
      setNewUser({ full_name: '', student_id: '', email: '', faculty_group: 'engineering' });
      setShowAddModal(false);
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || 'Không thể tạo người dùng');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    await patchUser(editingUser.id, {
      study_year: editingUser.study_year,
      interests: editingUser.interests,
      faculty_group: editingUser.faculty_group,
      major: editingUser.major,
      current_level: editingUser.current_level,
    });
    setEditingUser(null);
  };

  const toggleEditingInterest = (item: InterestArea) => {
    if (!editingUser) return;
    const has = editingUser.interests.includes(item);
    const next = has ? editingUser.interests.filter((i) => i !== item) : [...editingUser.interests, item];
    setEditingUser({ ...editingUser, interests: next });
  };

  const activeCount = users.filter((u) => u.status === 'active').length;

  return (
    <AdminLayout title="Quản Lý Người Dùng" description={`${users.length} người dùng · ${activeCount} đang hoạt động`}>
      <div className="space-y-5">
        {/* TOOLBAR */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, MSSV, email..."
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white border border-[var(--color-border)] focus:border-primary-300 focus:outline-none transition-all"
              />
            </div>
            <select
              value={facultyFilter}
              onChange={(e) => setFacultyFilter(e.target.value as 'all' | FacultyGroup)}
              className="px-3 py-2.5 text-sm rounded-xl bg-white border border-[var(--color-border)] focus:outline-none"
            >
              <option value="all">Tất cả khối ngành</option>
              <option value="engineering">Kỹ thuật / Kinh tế</option>
              <option value="language">Ngôn ngữ</option>
              <option value="other">Khác</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'disabled')}
              className="px-3 py-2.5 text-sm rounded-xl bg-white border border-[var(--color-border)] focus:outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="disabled">Đã khóa</option>
            </select>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold shadow-soft transition-all flex items-center gap-2 flex-shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Thêm người dùng
          </button>
        </div>

        {/* TABLE */}
        <div className="rounded-3xl bg-white border border-[var(--color-border)] shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-background-secondary/50 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  <th className="px-5 py-3">Người dùng</th>
                  <th className="px-5 py-3">Khối ngành</th>
                  <th className="px-5 py-3">Năm học</th>
                  <th className="px-5 py-3">Trình độ</th>
                  <th className="px-5 py-3">XP / Streak</th>
                  <th className="px-5 py-3">Ngày tham gia</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {loading && (
                  <tr><td colSpan={8} className="px-5 py-10 text-center text-text-muted text-sm">Đang tải...</td></tr>
                )}
                {!loading && filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-background-secondary/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-text-primary">{u.full_name}</div>
                      <div className="text-xs text-text-muted">{u.student_id} · {u.email}</div>
                    </td>
                    <td className="px-5 py-3 text-text-secondary">{FACULTY_GROUP_LABELS[u.faculty_group]}</td>
                    <td className="px-5 py-3 text-text-secondary">Năm {u.study_year}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-bold bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full">
                        {u.current_level}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-text-secondary">{u.total_xp} XP · {u.streak}🔥</td>
                    <td className="px-5 py-3 text-text-muted text-xs">{formatDate(u.created_at)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          'text-[11px] font-semibold px-2.5 py-0.5 rounded-full',
                          u.status === 'active' ? 'bg-success-light text-success' : 'bg-error-light text-error'
                        )}
                      >
                        {u.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/users/${u.id}/roadmap`}
                          title="Xem / chỉnh lộ trình học"
                          className="p-1.5 rounded-lg text-text-muted hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          <Route className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setEditingUser(u)}
                          title="Sửa người dùng"
                          className="p-1.5 rounded-lg text-text-muted hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(u)}
                          title={u.status === 'active' ? 'Khóa người dùng' : 'Mở khóa'}
                          className={cn(
                            'p-1.5 rounded-lg transition-colors',
                            u.status === 'active'
                              ? 'text-text-muted hover:text-error hover:bg-error-light'
                              : 'text-text-muted hover:text-success hover:bg-success-light'
                          )}
                        >
                          {u.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => removeUser(u.id, u.full_name)}
                          title="Xóa người dùng"
                          className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error-light transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-text-muted text-sm">
                      Không tìm thấy người dùng phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-soft-lg border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-primary-900">Thêm Người Dùng</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-xl text-text-muted hover:bg-background-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Họ và tên</label>
                <input
                  required
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">MSSV</label>
                <input
                  required
                  value={newUser.student_id}
                  onChange={(e) => setNewUser({ ...newUser, student_id: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Email</label>
                <input
                  required
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Khối ngành</label>
                <select
                  value={newUser.faculty_group}
                  onChange={(e) => setNewUser({ ...newUser, faculty_group: e.target.value as FacultyGroup })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:border-primary-500 focus:outline-none"
                >
                  <option value="engineering">Kỹ thuật / Kinh tế</option>
                  <option value="language">Ngôn ngữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <p className="text-[11px] text-text-muted">Mật khẩu mặc định: <strong>demo1234</strong></p>
              <button
                type="submit"
                className="w-full mt-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold shadow-soft transition-all"
              >
                Tạo người dùng
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-soft-lg border border-[var(--color-border)] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-primary-900">Sửa: {editingUser.full_name}</h3>
              <button onClick={() => setEditingUser(null)} className="p-1 rounded-xl text-text-muted hover:bg-background-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">Khối ngành</label>
                  <select
                    value={editingUser.faculty_group}
                    onChange={(e) => setEditingUser({ ...editingUser, faculty_group: e.target.value as FacultyGroup, major: MAJORS_BY_FACULTY[e.target.value as FacultyGroup][0] })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none"
                  >
                    <option value="engineering">Kỹ thuật / Kinh tế</option>
                    <option value="language">Ngôn ngữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">Sinh viên năm</label>
                  <select
                    value={editingUser.study_year}
                    onChange={(e) => setEditingUser({ ...editingUser, study_year: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5].map((y) => <option key={y} value={y}>Năm {y}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Ngành học</label>
                <select
                  value={editingUser.major}
                  onChange={(e) => setEditingUser({ ...editingUser, major: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none"
                >
                  {MAJORS_BY_FACULTY[editingUser.faculty_group].map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Trình độ CEFR</label>
                <select
                  value={editingUser.current_level}
                  onChange={(e) => setEditingUser({ ...editingUser, current_level: e.target.value as CEFRLevel })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none"
                >
                  {CEFR_LEVELS.map((lv) => <option key={lv} value={lv}>{lv}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-2">Vị trí công việc quan tâm</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(INTEREST_LABELS) as InterestArea[]).map((item) => (
                    <label key={item} className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingUser.interests.includes(item)}
                        onChange={() => toggleEditingInterest(item)}
                        className="rounded text-primary-600 focus:ring-primary-500"
                      />
                      {INTEREST_LABELS[item]}
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold shadow-soft transition-all"
              >
                Lưu thay đổi
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
