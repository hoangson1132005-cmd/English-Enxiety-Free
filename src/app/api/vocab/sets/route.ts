import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function serializeSet(set: {
  id: string; title: string; titleVi: string; topic: string; description: string; icon: string; ownerId: string | null;
  cards: { id: string; term: string; pronunciation: string | null; definition: string; definitionVi: string | null; example: string | null; exampleVi: string | null; topic: string | null; level: string | null }[];
}, userId: string) {
  return {
    id: set.id,
    title: set.title,
    title_vi: set.titleVi,
    topic: set.topic,
    description: set.description,
    icon: set.icon,
    card_count: set.cards.length,
    is_own: set.ownerId === userId,
    cards: set.cards.map((c) => ({
      id: c.id,
      term: c.term,
      pronunciation: c.pronunciation ?? '',
      definition: c.definition,
      definition_vi: c.definitionVi ?? '',
      example: c.example ?? '',
      example_vi: c.exampleVi ?? '',
      topic: c.topic ?? set.topic,
      level: c.level ?? 'A1',
    })),
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sets = await prisma.vocabSet.findMany({
    where: { OR: [{ ownerId: null }, { ownerId: session.user.id }] },
    include: { cards: true },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(sets.map((s) => serializeSet(s, session.user.id)));
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.title) return NextResponse.json({ error: 'Thiếu tên bộ từ' }, { status: 400 });

  const set = await prisma.vocabSet.create({
    data: {
      title: body.title,
      titleVi: body.title_vi || body.title,
      topic: 'custom',
      description: body.description || 'Bộ từ cá nhân',
      icon: body.icon || '📝',
      ownerId: session.user.id,
    },
    include: { cards: true },
  });

  return NextResponse.json(serializeSet(set, session.user.id), { status: 201 });
}
