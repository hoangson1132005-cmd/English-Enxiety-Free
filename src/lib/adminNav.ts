import {
  LayoutDashboard, Users, Library, ClipboardList, BarChart3, Image as ImageIcon, HelpCircle, History, SlidersHorizontal, KeyRound,
} from 'lucide-react';

// Danh sách điều hướng admin dùng chung cho thanh bên (desktop) và thanh trên (mobile): chỉ khai báo một nơi.
export const adminNavItems = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard, hint: 'Checklist thiết lập và thống kê nhanh' },
  { href: '/admin/users', label: 'Người dùng', icon: Users, hint: 'Tài khoản, lộ trình riêng, đặt lại mật khẩu' },
  { href: '/admin/content', label: 'Bài học', icon: Library, extraMatch: '/admin/lessons', hint: 'Nạp giáo án, xuất bản bài học' },
  { href: '/admin/question-bank', label: 'Ngân hàng câu hỏi', icon: HelpCircle, hint: 'Nguồn câu hỏi cho mọi bài kiểm tra' },
  { href: '/admin/quiz-sessions', label: 'Lịch sử bốc câu', icon: History, hint: 'Xem học viên đã làm những câu nào' },
  { href: '/admin/quiz-settings', label: 'Cài đặt kiểm tra', icon: SlidersHorizontal, hint: 'Số câu, điểm đạt' },
  { href: '/admin/tests', label: 'Đề test', icon: ClipboardList, hint: 'Đề đầu vào, đề tổng kết theo level' },
  { href: '/admin/landing', label: 'Landing Page', icon: ImageIcon, hint: 'Nội dung trang chủ và logo' },
  { href: '/admin/reports', label: 'Báo cáo', icon: BarChart3, hint: 'Thống kê theo nhóm đối tượng, trình độ' },
  { href: '/admin/account', label: 'Tài khoản của tôi', icon: KeyRound, hint: 'Đổi mật khẩu quản trị' },
] as const;
