import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { toProfileDTO } from '@/lib/serializers';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(toProfileDTO(user));
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const data: Prisma.UserUpdateInput = {};

  if (body.full_name !== undefined) data.fullName = body.full_name;
  if (body.avatar_url !== undefined) data.avatarUrl = body.avatar_url;
  if (body.employment_status !== undefined) data.employmentStatus = body.employment_status;
  if (body.faculty_group !== undefined) data.facultyGroup = body.faculty_group;
  if (body.major !== undefined) data.major = body.major;
  if (body.study_year !== undefined) data.studyYear = body.study_year;
  if (body.goal !== undefined) data.goal = body.goal;
  if (body.interests !== undefined) data.interests = JSON.stringify(body.interests);
  if (body.daily_minutes !== undefined) data.dailyMinutes = body.daily_minutes;
  if (body.self_assessed_level !== undefined) data.selfAssessedLevel = body.self_assessed_level;
  if (body.current_level !== undefined) data.currentLevel = body.current_level;
  if (body.streak !== undefined) data.streak = body.streak;
  if (body.total_xp !== undefined) data.totalXp = body.total_xp;
  if (body.notification_enabled !== undefined) data.notificationEnabled = body.notification_enabled;
  if (body.dark_mode !== undefined) data.darkMode = body.dark_mode;
  if (body.onboarding_completed !== undefined) data.onboardingCompleted = body.onboarding_completed;
  if (body.placement_completed !== undefined) data.placementCompleted = body.placement_completed;

  const user = await prisma.user.update({ where: { id: session.user.id }, data });
  return NextResponse.json(toProfileDTO(user));
}
