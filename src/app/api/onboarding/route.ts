import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      goal: body.goal,
      interests: JSON.stringify(body.interests ?? []),
      dailyMinutes: body.daily_minutes,
      selfAssessedLevel: body.self_assessed_level,
      ...(body.faculty_group !== undefined ? { facultyGroup: body.faculty_group } : {}),
      ...(body.major !== undefined ? { major: body.major } : {}),
      ...(body.study_year !== undefined ? { studyYear: body.study_year } : {}),
      onboardingCompleted: true,
    },
  });

  return NextResponse.json({ success: true });
}
