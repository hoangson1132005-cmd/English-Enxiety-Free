import { prisma } from '@/lib/prisma';
import { startOfDay, addDays } from '@/lib/date';
import type { SkillType } from '@/types';

interface RecordActivityInput {
  xpEarned: number;
  minutesStudied: number;
  lessonCompleted?: boolean;
  vocabReviewed?: number;
  skill?: SkillType;
  score?: number;
}

// Bumps XP + streak + today's DailyProgress row for a user. Streak logic:
// studied today already -> unchanged; studied yesterday (but not yet today) -> +1;
// otherwise (gap of 2+ days, or very first activity) -> resets to 1.
export async function recordActivity(userId: string, opts: RecordActivityInput) {
  const today = startOfDay(new Date());

  const [user, todayProgress] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.dailyProgress.findUnique({ where: { userId_date: { userId, date: today } } }),
  ]);

  let newStreak: number;
  if (todayProgress) {
    newStreak = user.streak;
  } else {
    const yesterday = addDays(today, -1);
    const yesterdayProgress = await prisma.dailyProgress.findUnique({
      where: { userId_date: { userId, date: yesterday } },
    });
    newStreak = yesterdayProgress ? user.streak + 1 : 1;
  }

  const skills: Partial<Record<SkillType, number>> = todayProgress ? JSON.parse(todayProgress.skills) : {};
  if (opts.skill && opts.score !== undefined) skills[opts.skill] = opts.score;

  await prisma.dailyProgress.upsert({
    where: { userId_date: { userId, date: today } },
    update: {
      minutesStudied: { increment: opts.minutesStudied },
      xpEarned: { increment: opts.xpEarned },
      lessonsCompleted: { increment: opts.lessonCompleted ? 1 : 0 },
      vocabReviewed: { increment: opts.vocabReviewed ?? 0 },
      skills: JSON.stringify(skills),
    },
    create: {
      userId,
      date: today,
      minutesStudied: opts.minutesStudied,
      xpEarned: opts.xpEarned,
      lessonsCompleted: opts.lessonCompleted ? 1 : 0,
      vocabReviewed: opts.vocabReviewed ?? 0,
      skills: JSON.stringify(skills),
    },
  });

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { streak: newStreak, totalXp: { increment: opts.xpEarned } },
  });

  return { new_total_xp: updatedUser.totalXp, new_streak: updatedUser.streak };
}
