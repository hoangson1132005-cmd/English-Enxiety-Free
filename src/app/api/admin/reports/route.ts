import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { toAdminUserDTO } from '@/lib/serializers';
import { JOB_INTEREST_OPTIONS } from '@/types';

const DAY_LABELS = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;
const FACULTY_GROUPS = ['engineering', 'language', 'other'] as const;

const AUDIENCES = [
  { key: 'student_engineering', label: 'Sinh viên Kỹ thuật / Kinh tế' },
  { key: 'student_language', label: 'Sinh viên Ngôn ngữ' },
  { key: 'student_other', label: 'Sinh viên ngành khác' },
  { key: 'employed', label: 'Người đi làm' },
] as const;

function audienceOf(u: { employmentStatus: string; facultyGroup: string }) {
  if (u.employmentStatus === 'employed') return 'employed';
  if (u.facultyGroup === 'engineering') return 'student_engineering';
  if (u.facultyGroup === 'language') return 'student_language';
  return 'student_other';
}

function countBy<T>(items: T[], keyOf: (item: T) => string | null | undefined) {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = keyOf(item)?.trim();
    if (key) map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
}

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

  // Nhóm đối tượng: sinh viên theo khối ngành + người đi làm (gộp lại để so sánh nhanh)
  const audienceDistribution = AUDIENCES.map((a) => {
    const group = users.filter((u) => audienceOf(u) === a.key);
    return {
      key: a.key,
      label: a.label,
      count: group.length,
      percent: totalUsers ? Math.round((group.length / totalUsers) * 100) : 0,
      avg_xp: group.length ? Math.round(group.reduce((s, u) => s + u.totalXp, 0) / group.length) : 0,
      placement_rate: group.length ? Math.round((group.filter((u) => u.placementCompleted).length / group.length) * 100) : 0,
      levels: Object.fromEntries(CEFR_ORDER.map((l) => [l, group.filter((u) => u.currentLevel === l).length])),
    };
  });

  const students = users.filter((u) => u.employmentStatus !== 'employed');
  const studyYearDistribution = [1, 2, 3, 4, 5]
    .map((y) => ({ name: `Năm ${y}`, count: students.filter((u) => u.studyYear === y).length }))
    .filter((r) => r.count > 0);

  const goalLabels: Record<string, string> = {
    internship: 'Thực tập', work: 'Đi làm', certificate: 'Thi chứng chỉ', communication: 'Giao tiếp quốc tế',
  };
  const goalDistribution = countBy(users, (u) => (u.goal ? goalLabels[u.goal] ?? u.goal : null));

  const interestAll = users.flatMap((u) => {
    try { return JSON.parse(u.interests) as string[]; } catch { return []; }
  });
  const interestLabels = Object.fromEntries(JOB_INTEREST_OPTIONS.map((o) => [o.id, o.label]));
  const interestDistribution = countBy(interestAll, (i) => interestLabels[i] ?? i).slice(0, 8);
  const majorDistribution = countBy(users, (u) => u.major).slice(0, 8);

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
    audience_distribution: audienceDistribution,
    study_year_distribution: studyYearDistribution,
    goal_distribution: goalDistribution,
    interest_distribution: interestDistribution,
    major_distribution: majorDistribution,
    cefr_distribution: cefrDistribution,
    top_users: topUsers,
  });
}
