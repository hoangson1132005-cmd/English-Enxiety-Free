import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  const result = id
    ? await prisma.testResult.findUnique({ where: { id } })
    : await prisma.testResult.findFirst({ where: { userId: session.user.id }, orderBy: { completedAt: 'desc' } });

  if (!result || result.userId !== session.user.id) {
    return NextResponse.json({ error: 'Không tìm thấy kết quả' }, { status: 404 });
  }

  return NextResponse.json({
    id: result.id,
    user_id: result.userId,
    test_id: result.testId,
    completed_at: result.completedAt.toISOString(),
    scores: JSON.parse(result.scores),
    total_score: result.totalScore,
    cefr_level: result.cefrLevel,
    toeic_equivalent: result.toeicEquivalent,
    ielts_equivalent: result.ieltsEquivalent,
    strengths: JSON.parse(result.strengths),
    weaknesses: JSON.parse(result.weaknesses),
    ai_feedback: result.aiFeedback,
    time_spent_seconds: result.timeSpentSeconds,
    faculty_group: result.facultyGroup,
  });
}
