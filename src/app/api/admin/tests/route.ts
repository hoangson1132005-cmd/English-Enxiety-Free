import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { serializeTest } from '@/lib/serializers';

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const tests = await prisma.test.findMany({
    include: { sections: { include: { questions: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(tests.map(serializeTest));
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  if (!body.title) return NextResponse.json({ error: 'Thiếu tên đề test' }, { status: 400 });

  const test = await prisma.test.create({
    data: {
      title: body.title,
      description: body.description || '',
      durationMinutes: body.duration_minutes ?? 45,
      isActive: false,
      createdVia: 'manual',
      kind: body.kind === 'level_up' ? 'level_up' : 'placement',
      targetLevel: body.kind === 'level_up' ? (body.target_level ?? 'A2') : null,
    },
    include: { sections: { include: { questions: true } } },
  });

  return NextResponse.json(serializeTest(test), { status: 201 });
}
