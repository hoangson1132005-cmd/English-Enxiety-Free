import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { recordActivity } from '@/lib/progress';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { card_id, difficulty } = body as { card_id: string; difficulty: 'easy' | 'hard' | 'unknown' };

  const days = difficulty === 'easy' ? 7 : difficulty === 'hard' ? 1 : 3;
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + days);

  await prisma.userVocabProgress.upsert({
    where: { userId_cardId: { userId: session.user.id, cardId: card_id } },
    update: { lastReviewed: new Date(), nextReview, difficulty, mastered: difficulty === 'easy' },
    create: {
      userId: session.user.id,
      cardId: card_id,
      lastReviewed: new Date(),
      nextReview,
      difficulty,
      mastered: difficulty === 'easy',
    },
  });

  await recordActivity(session.user.id, { xpEarned: 2, minutesStudied: 0, vocabReviewed: 1 });

  return NextResponse.json({ next_review: nextReview.toISOString() });
}
