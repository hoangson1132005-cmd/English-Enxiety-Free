import { prisma } from '@/lib/prisma';

// Xác định đề mà học viên được làm: đề đầu vào đang kích hoạt, hoặc đề tổng kết hợp lệ của họ.
export async function resolveTestForUser(userId: string, testId: string | null) {
  const include = { sections: { include: { questions: true } } } as const;
  if (!testId) {
    return prisma.test.findFirst({ where: { isActive: true, kind: 'placement' }, include });
  }

  const test = await prisma.test.findUnique({ where: { id: testId }, include });
  if (!test) return null;
  if (test.kind === 'placement') return test.isActive ? test : null;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const roadmap = await prisma.userRoadmap.findFirst({ where: { userId, status: 'active' } });
  if (!roadmap) return null;
  const isOwnAiExam = test.roadmapId === roadmap.id;
  const isAdminExamForLevel = test.isActive && test.roadmapId === null && test.targetLevel === user.currentLevel;
  return isOwnAiExam || isAdminExamForLevel ? test : null;
}
