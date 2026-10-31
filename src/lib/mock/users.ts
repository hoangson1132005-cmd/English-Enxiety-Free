import type { User, Profile } from '@/types';

export const mockUser: User = {
  id: 'user_001',
  full_name: 'Nguyễn Thị Lan Anh',
  student_id: '2151060001',
  email: 'lananh.2151060001@student.uth.edu.vn',
  avatar_url: undefined,
  created_at: '2024-09-01T08:00:00Z',
  onboarding_completed: true,
  placement_completed: true,
};

export const mockProfile: Profile = {
  ...mockUser,
  employment_status: 'student',
  faculty_group: 'engineering',
  major: 'Logistics và Quản lý chuỗi cung ứng',
  study_year: 3,
  research_consent: true,
  goal: 'work',
  interests: ['documentation', 'customs', 'forwarder'],
  daily_minutes: 20,
  self_assessed_level: 'A2',
  current_level: 'B1',
  streak: 7,
  total_xp: 1250,
  notification_enabled: true,
  dark_mode: false,
};
