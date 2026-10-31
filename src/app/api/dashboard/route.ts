import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay, addDays } from '@/lib/date';
import type { SkillType } from '@/types';

const DAY_LABELS = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const SKILLS: SkillType[] = ['listening', 'reading', 'writing', 'speaking', 'vocabulary'];

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const today = startOfDay(new Date());
  const weekStart = addDays(today, -6);

  const dailyRows = await prisma.dailyProgress.findMany({
    where: { userId: session.user.id, date: { gte: weekStart } },
  });
  const byDate = new Map(dailyRows.map((r) => [startOfDay(r.date).getTime(), r]));

  const dailyBreakdown = Array.from({ length: 7 }).map((_, idx) => {
    const day = addDays(weekStart, idx);
    const row = byDate.get(day.getTime());
    return {
      date: day.toISOString().slice(0, 10),
      day_label: DAY_LABELS[day.getDay()],
      minutes: row?.minutesStudied ?? 0,
      xp: row?.xpEarned ?? 0,
    };
  });

  const weeklyStats = {
    week_start: weekStart.toISOString().slice(0, 10),
    total_minutes: dailyBreakdown.reduce((s, d) => s + d.minutes, 0),
    total_xp: dailyBreakdown.reduce((s, d) => s + d.xp, 0),
    lessons_completed: dailyRows.reduce((s, r) => s + r.lessonsCompleted, 0),
    daily_breakdown: dailyBreakdown,
  };

  const testResults = await prisma.testResult.findMany({
    where: { userId: session.user.id },
    orderBy: { completedAt: 'asc' },
  });

  const skillProgress = SKILLS.map((skill) => {
    const sessions = testResults.map((r) => ({
      date: r.completedAt.toISOString().slice(0, 10),
      score: (JSON.parse(r.scores)[skill] as number) ?? 0,
    }));
    const latest = sessions.at(-1);
    const prev = sessions.at(-2);
    const score = latest?.score ?? 0;
    const previousScore = prev?.score ?? score;
    return {
      skill,
      score,
      previous_score: previousScore,
      trend: score > previousScore ? 'up' : score < previousScore ? 'down' : 'stable',
      sessions,
    };
  });

  const dueVocab = await prisma.userVocabProgress.findMany({
    where: { userId: session.user.id, nextReview: { lte: today } },
    include: { card: true },
    orderBy: { nextReview: 'asc' },
    take: 3,
  });

  return NextResponse.json({
    weekly_stats: weeklyStats,
    skill_progress: skillProgress,
    due_vocab: dueVocab.map((v) => ({
      term: v.card.term,
      meaning: v.card.definitionVi || v.card.definition,
    })),
  });
}
