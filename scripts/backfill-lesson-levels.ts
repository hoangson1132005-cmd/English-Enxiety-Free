// Gán level cho các bài học cũ chưa có level, dựa trên level phổ biến nhất của câu hỏi trong bài.
// Chạy: npx tsx scripts/backfill-lesson-levels.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const lessons = await prisma.lesson.findMany({ where: { level: null }, include: { questions: true } });
  let updated = 0;
  for (const l of lessons) {
    const counts = new Map<string, number>();
    for (const q of l.questions) counts.set(q.level, (counts.get(q.level) ?? 0) + 1);
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (!top) continue;
    await prisma.lesson.update({ where: { id: l.id }, data: { level: top[0] as never } });
    updated += 1;
  }
  console.log(`Đã gán level cho ${updated}/${lessons.length} bài học.`);
}

main().finally(() => prisma.$disconnect());
