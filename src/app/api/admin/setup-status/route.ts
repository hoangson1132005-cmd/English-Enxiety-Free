import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

// Tình trạng thiết lập hệ thống, dùng cho checklist "Bắt đầu nhanh" ở trang Tổng quan admin.
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [published, drafts, bankTotal, aiPending, hidden, activePlacement, admins, students] = await Promise.all([
    prisma.lesson.count({ where: { isPublished: true } }),
    prisma.lesson.count({ where: { isPublished: false } }),
    prisma.question.count({ where: { inBank: true, isActive: true } }),
    prisma.question.count({ where: { inBank: true, source: 'ai', isActive: true } }),
    prisma.question.count({ where: { inBank: true, isActive: false } }),
    prisma.test.count({ where: { isActive: true, kind: 'placement' } }),
    prisma.user.findMany({ where: { role: 'admin' }, select: { passwordHash: true } }),
    prisma.user.count({ where: { role: 'student' } }),
  ]);

  const defaultAdminPassword = (await Promise.all(admins.map((a) => bcrypt.compare('admin123', a.passwordHash)))).some(Boolean);
  const smtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  const gemini = !!process.env.GEMINI_API_KEY;

  const steps = [
    { id: 'lessons', title: 'Nạp giáo án / bài học', desc: 'Tải file Word/PDF để AI tách thành bài học, hoặc thêm bài thủ công.', done: published + drafts > 0, href: '/admin/content', label: 'Mở Bài học' },
    { id: 'publish', title: 'Xuất bản bài học', desc: 'Bài ở trạng thái Nháp thì AI chưa xếp vào lộ trình của học viên.', done: published > 0 && drafts === 0, href: '/admin/content?status=draft', label: drafts ? `Duyệt ${drafts} bài nháp` : 'Mở Bài học' },
    { id: 'bank', title: 'Nạp ngân hàng câu hỏi', desc: 'Nguồn câu cho bài kiểm tra cuối bài / chặng / khóa. Nên có từ 40 câu, đủ A1–C1.', done: bankTotal >= 40, href: '/admin/question-bank', label: `Mở Ngân hàng (${bankTotal} câu)` },
    { id: 'placement', title: 'Kích hoạt đề test đầu vào', desc: 'Học viên mới làm đề này để xếp trình độ và tạo lộ trình.', done: activePlacement > 0, href: '/admin/tests', label: 'Mở Đề test' },
    { id: 'settings', title: 'Kiểm tra cài đặt bài kiểm tra', desc: 'Số câu mỗi bài kiểm tra và điểm đạt (mặc định 8 / 18 / 30 câu, đạt 70).', done: true, href: '/admin/quiz-settings', label: 'Mở Cài đặt', optional: true },
    { id: 'gemini', title: 'Bật AI (Gemini)', desc: gemini ? 'Đã cấu hình khóa GEMINI_API_KEY.' : 'Thiếu GEMINI_API_KEY trong .env: import bằng AI, AI Tutor và chấm bài Viết/Nói sẽ không chạy.', done: gemini, href: 'https://aistudio.google.com/apikey', label: 'Lấy khóa miễn phí', external: true },
    { id: 'smtp', title: 'Cấu hình gửi email', desc: smtp ? 'Đã cấu hình SMTP.' : 'Chưa có SMTP trong .env: chức năng quên mật khẩu không gửi được email (admin vẫn đặt lại mật khẩu được ở mục Người dùng).', done: smtp, href: '/admin/account#email', label: smtp ? 'Gửi email thử' : 'Hướng dẫn cấu hình', optional: true },
    { id: 'password', title: 'Đổi mật khẩu admin mặc định', desc: defaultAdminPassword ? 'Mật khẩu admin vẫn là mặc định công khai — hãy đổi ngay.' : 'Mật khẩu admin đã được đổi.', done: !defaultAdminPassword, href: '/admin/account', label: 'Đổi mật khẩu' },
    { id: 'landing', title: 'Cập nhật trang chủ', desc: 'Tiêu đề, mô tả và logo hiển thị cho khách truy cập.', done: false, href: '/admin/landing', label: 'Mở Landing Page', optional: true },
  ];

  const attention = [
    drafts > 0 && { text: `${drafts} bài học đang ở trạng thái Nháp (học viên chưa thấy)`, href: '/admin/content?status=draft', label: 'Duyệt và xuất bản' },
    aiPending > 0 && { text: `${aiPending} câu hỏi do AI tạo cần được xem lại`, href: '/admin/question-bank?source=ai', label: 'Xem lại' },
    hidden > 0 && { text: `${hidden} câu hỏi đang tạm ẩn`, href: '/admin/question-bank?active=no', label: 'Xem' },
    defaultAdminPassword && { text: 'Mật khẩu admin còn là mặc định', href: '/admin/account', label: 'Đổi ngay' },
    published > 0 && students === 0 && { text: 'Chưa có học viên nào đăng ký', href: '/register', label: 'Mở trang đăng ký' },
  ].filter(Boolean);

  return NextResponse.json({ steps, attention });
}
