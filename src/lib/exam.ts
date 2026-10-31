import { prisma } from '@/lib/prisma';

// Đề tổng kết do admin chủ động tạo và kích hoạt cho level hiện tại của học viên (nếu có) sẽ được ưu tiên.
// Nếu không có, bài kiểm tra cuối khóa được bốc từ ngân hàng câu hỏi (xem lib/quiz.ts, createFinalSession).
export async function findAdminExam(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  return prisma.test.findFirst({
    where: { kind: 'level_up', isActive: true, targetLevel: user.currentLevel, roadmapId: null },
  });
}
