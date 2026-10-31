import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { toAdminUserDTO } from '@/lib/serializers';

const DAY_LABELS = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;
const FACULTY_GROUPS = ['engineering', 'language', 'other'] as const;

function startOfDay(d: Date) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const users = await prisma.user.findMany({ where: { role: 'student' } });

  const today = startOfDay(new Date());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);

  const totalUsers = users.length;
  const activeToday = users.filter((u) => startOfDay(u.lastActiveAt).getTime() === today.getTime()).length;
  const newThisWeek = users.filter((u) => u.createdAt >= weekAgo).length;
  const placementCompletionRate = totalUsers
    ? Math.round((users.filter((u) => u.placementCompleted).length / totalUsers) * 100)
    : 0;

  const signupTrend = Array.from({ length: 7 }).map((_, idx) => {
    const day = new Date(weekAgo);
    day.setDate(day.getDate() + idx);
    const count = users.filter((u) => startOfDay(u.createdAt).getTime() === day.getTime()).length;
    return { day_label: DAY_LABELS[day.getDay()], count };
  });

  const facultyDistribution = FACULTY_GROUPS.map((fg) => ({
    faculty_group: fg,
    count: users.filter((u) => u.facultyGroup === fg).length,
  }));

  const cefrDistribution = CEFR_ORDER.map((level) => ({
    level,
    count: users.filter((u) => u.currentLevel === level).length,
  }));

  const avgXp = totalUsers ? Math.round(users.reduce((s, u) => s + u.totalXp, 0) / totalUsers) : 0;
  const avgStreak = totalUsers ? Math.round(users.reduce((s, u) => s + u.streak, 0) / totalUsers) : 0;

  const topUsers = [...users].sort((a, b) => b.totalXp - a.totalXp).slice(0, 5).map(toAdminUserDTO);

  return NextResponse.json({
    total_users: totalUsers,
    active_today: activeToday,
    new_this_week: newThisWeek,
    placement_completion_rate: placementCompletionRate,
    avg_xp: avgXp,
    avg_streak: avgStreak,
    signup_trend: signupTrend,
    faculty_distribution: facultyDistribution,
    cefr_distribution: cefrDistribution,
    top_users: topUsers,
  });
}
