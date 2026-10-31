import type { AdminUser, AdminStats } from '@/types';

export const mockAdminUsers: AdminUser[] = [
  { id: 'user_001', full_name: 'Nguyễn Thị Lan Anh', student_id: '2151060001', email: 'lananh.nt@edu.vn', faculty_group: 'engineering', major: 'Logistics và Quản lý chuỗi cung ứng', study_year: 3, current_level: 'B1', streak: 7, total_xp: 1250, placement_completed: true, interests: [], status: 'active', created_at: '2024-09-01T08:00:00Z', last_active: '2024-10-28T09:10:00Z' },
  { id: 'user_002', full_name: 'Trần Minh Khôi', student_id: '2151060045', email: 'khoi.tm@edu.vn', faculty_group: 'engineering', major: 'Kinh tế vận tải biển', study_year: 2, current_level: 'A2', streak: 3, total_xp: 480, placement_completed: true, interests: [], status: 'active', created_at: '2024-09-05T08:00:00Z', last_active: '2024-10-27T18:40:00Z' },
  { id: 'user_003', full_name: 'Phạm Thị Hồng Nhung', student_id: '2151120012', email: 'nhung.pth@edu.vn', faculty_group: 'language', major: 'Ngôn ngữ Anh', study_year: 4, current_level: 'B2', streak: 21, total_xp: 3100, placement_completed: true, interests: [], status: 'active', created_at: '2024-08-20T08:00:00Z', last_active: '2024-10-28T07:55:00Z' },
  { id: 'user_004', full_name: 'Lê Hoàng Phúc', student_id: '2251060078', email: 'phuc.lh@edu.vn', faculty_group: 'engineering', major: 'Khai thác vận tải', study_year: 1, current_level: 'A1', streak: 0, total_xp: 60, placement_completed: false, interests: [], status: 'active', created_at: '2024-10-20T08:00:00Z', last_active: '2024-10-24T12:00:00Z' },
  { id: 'user_005', full_name: 'Đỗ Thị Kim Ngân', student_id: '2051060023', email: 'ngan.dtk@edu.vn', faculty_group: 'engineering', major: 'Thương mại quốc tế', study_year: 4, current_level: 'B2', streak: 14, total_xp: 2480, placement_completed: true, interests: [], status: 'active', created_at: '2024-08-15T08:00:00Z', last_active: '2024-10-28T06:30:00Z' },
  { id: 'user_006', full_name: 'Vũ Đăng Khoa', student_id: '2151120033', email: 'khoa.vd@edu.vn', faculty_group: 'language', major: 'Ngôn ngữ Trung Quốc', study_year: 3, current_level: 'B1', streak: 5, total_xp: 910, placement_completed: true, interests: [], status: 'disabled', created_at: '2024-09-10T08:00:00Z', last_active: '2024-10-15T10:00:00Z' },
  { id: 'user_007', full_name: 'Huỳnh Gia Bảo', student_id: '2251060101', email: 'bao.hg@edu.vn', faculty_group: 'engineering', major: 'Logistics và Quản lý chuỗi cung ứng', study_year: 1, current_level: 'A1', streak: 2, total_xp: 140, placement_completed: true, interests: [], status: 'active', created_at: '2024-10-22T08:00:00Z', last_active: '2024-10-26T15:20:00Z' },
  { id: 'user_008', full_name: 'Ngô Thanh Trúc', student_id: '2151200009', email: 'truc.nt@edu.vn', faculty_group: 'other', major: 'Marketing', study_year: 2, current_level: 'A2', streak: 1, total_xp: 220, placement_completed: false, interests: [], status: 'active', created_at: '2024-10-10T08:00:00Z', last_active: '2024-10-25T09:00:00Z' },
  { id: 'user_009', full_name: 'Bùi Anh Tuấn', student_id: '2051060056', email: 'tuan.ba@edu.vn', faculty_group: 'engineering', major: 'Kỹ thuật hàng hải', study_year: 4, current_level: 'C1', streak: 30, total_xp: 4200, placement_completed: true, interests: [], status: 'active', created_at: '2024-07-28T08:00:00Z', last_active: '2024-10-28T08:05:00Z' },
  { id: 'user_010', full_name: 'Phan Thị Mỹ Duyên', student_id: '2251120067', email: 'duyen.ptm@edu.vn', faculty_group: 'language', major: 'Ngôn ngữ Nhật', study_year: 1, current_level: 'A1', streak: 0, total_xp: 30, placement_completed: false, interests: [], status: 'disabled', created_at: '2024-10-25T08:00:00Z', last_active: '2024-10-26T08:00:00Z' },
  { id: 'user_011', full_name: 'Đặng Quốc Việt', student_id: '2151060090', email: 'viet.dq@edu.vn', faculty_group: 'engineering', major: 'Quản trị kinh doanh (Logistics)', study_year: 3, current_level: 'B1', streak: 9, total_xp: 1580, placement_completed: true, interests: [], status: 'active', created_at: '2024-09-02T08:00:00Z', last_active: '2024-10-27T20:10:00Z' },
  { id: 'user_012', full_name: 'Lý Thu Hà', student_id: '2051200034', email: 'ha.lt@edu.vn', faculty_group: 'other', major: 'Kế toán', study_year: 4, current_level: 'B1', streak: 6, total_xp: 1020, placement_completed: true, interests: [], status: 'active', created_at: '2024-08-30T08:00:00Z', last_active: '2024-10-27T11:45:00Z' },
];

export const mockAdminStats: AdminStats = {
  total_users: mockAdminUsers.length,
  active_today: 7,
  new_this_week: 3,
  placement_completion_rate: Math.round(
    (mockAdminUsers.filter((u) => u.placement_completed).length / mockAdminUsers.length) * 100
  ),
  signup_trend: [
    { day_label: 'Thứ 3', count: 1 },
    { day_label: 'Thứ 4', count: 0 },
    { day_label: 'Thứ 5', count: 2 },
    { day_label: 'Thứ 6', count: 1 },
    { day_label: 'Thứ 7', count: 3 },
    { day_label: 'CN', count: 0 },
    { day_label: 'Thứ 2', count: 2 },
  ],
  faculty_distribution: [
    { faculty_group: 'engineering', count: mockAdminUsers.filter((u) => u.faculty_group === 'engineering').length },
    { faculty_group: 'language', count: mockAdminUsers.filter((u) => u.faculty_group === 'language').length },
    { faculty_group: 'other', count: mockAdminUsers.filter((u) => u.faculty_group === 'other').length },
  ],
};
