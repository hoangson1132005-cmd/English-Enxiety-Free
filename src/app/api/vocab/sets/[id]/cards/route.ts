import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const set = await prisma.vocabSet.findUnique({ where: { id } });
  if (!set || set.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Bạn không có quyền sửa bộ từ này' }, { status: 403 });
  }

  const body = await req.json();
  if (!body.term || !body.definition_vi) {
    return NextResponse.json({ error: 'Cần ít nhất từ vựng và nghĩa tiếng Việt' }, { status: 400 });
  }

  const card = await prisma.vocabCard.create({
    data: {
      setId: id,
      term: body.term,
      pronunciation: body.pronunciation || null,
      definition: body.definition || body.definition_vi,
      definitionVi: body.definition_vi,
      example: body.example || null,
      exampleVi: body.example_vi || null,
      topic: set.topic,
    },
  });

  return NextResponse.json(
    {
      id: card.id,
      term: card.term,
      pronunciation: card.pronunciation ?? '',
      definition: card.definition,
      definition_vi: card.definitionVi ?? '',
      example: card.example ?? '',
      example_vi: card.exampleVi ?? '',
      topic: card.topic ?? set.topic,
      level: 'A1',
    },
    { status: 201 }
  );
}
