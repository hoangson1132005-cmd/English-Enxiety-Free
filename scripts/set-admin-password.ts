// Đặt (hoặc đổi) mật khẩu cho một tài khoản admin, tạo mới nếu chưa có.
// Chạy: npx tsx scripts/set-admin-password.ts <email> <mat-khau-moi>
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password || password.length < 8) {
    console.error('Cách dùng: npx tsx scripts/set-admin-password.ts <email> <mật khẩu ít nhất 8 ký tự>');
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'admin', status: 'active' },
    create: { email, passwordHash, role: 'admin', fullName: 'Quản trị viên', facultyGroup: 'other', interests: '[]' },
  });
  console.log(`Đã đặt mật khẩu admin cho ${user.email}`);
}

main().finally(() => prisma.$disconnect());
