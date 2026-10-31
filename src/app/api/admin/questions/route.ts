import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { buildQuestionData } from '@/lib/questionInput';

const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1'];

function serialize(q: {
  id: string; skill: string; topic: string; level: string; type: string; question: string; options: string | null;
  answer: string; explanation: string; passage: string | null; audioUrl: string | null; source: string;
  usedCount: number; correctCount: number; createdAt: Date;
}) {
  return {
    id: q.id,
    skill: q.skill,
    topic: q.topic,
    level: q.level,
    type: q.type,
    question: q.question,
    options: q.options ? JSON.parse(q.options) : undefined,
    answer: JSON.parse(q.answer),
    explanation: q.explanation,
    passage: q.passage ?? undefined,
    audio_url: q.audioUrl ?? undefined,
    source: q.source,
    used_count: q.usedCount,
    accuracy: q.usedCount > 0 ? Math.round((q.correctCount / q.usedCount) * 100) : null,
    created_at: q.createdAt.toISOString(),
  };
}

// Danh sách ngân hàng câu hỏi: lọc theo cấp độ / kỹ năng / loại / chủ đề / nguồn, tìm kiếm, sắp xếp, phân trang.
export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const p = new URL(req.url).searchParams;
  const where: Prisma.QuestionWhereInput = { inBank: true };
  for (const key of ['level', 'skill', 'type', 'source'] as const) {
    const v = p.get(key);
    if (v && v !== 'all') (where as Record<string, unknown>)[key] = v;
  }
  const topic = p.get('topic');
  if (topic && topic !== 'all') where.topic = topic;
  const q = p.get('q')?.trim();
  if (q) where.OR = [{ question: { contains: q, mode: 'insensitive' } }, { topic: { contains: q, mode: 'insensitive' } }];

  const sort = p.get('sort') ?? 'newest';
  const page = Math.max(1, Number(p.get('page')) || 1);
  const pageSize = Math.min(100, Math.max(5, Number(p.get('pageSize')) || 25));

  const orderBy: Prisma.QuestionOrderByWithRelationInput[] =
    sort === 'level' ? [{ level: 'asc' }, { createdAt: 'desc' }]
    : sort === 'used' ? [{ usedCount: 'desc' }, { createdAt: 'desc' }]
    : [{ createdAt: 'desc' }];

  const [total, rows, byLevel, bySkill, topics] = await Promise.all([
    prisma.question.count({ where }),
    prisma.question.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.question.groupBy({ by: ['level'], where: { inBank: true }, _count: true }),
    prisma.question.groupBy({ by: ['skill'], where: { inBank: true }, _count: true }),
    prisma.question.groupBy({ by: ['topic'], where: { inBank: true }, _count: true, orderBy: { _count: { topic: 'desc' } }, take: 40 }),
  ]);

  let items = rows.map(serialize);
  // "Độ chính xác thấp nhất" cần tính từ tỷ lệ nên sắp xếp trong trang hiện tại
  if (sort === 'accuracy') {
    items = items
      .filter((i) => i.accuracy !== null)
      .sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0))
      .concat(items.filter((i) => i.accuracy === null));
  }

  return NextResponse.json({
    items,
    total,
    page,
    page_size: pageSize,
    facets: {
      levels: LEVEL_ORDER.map((l) => ({ value: l, count: byLevel.find((x) => x.level === l)?._count ?? 0 })),
      skills: bySkill.map((x) => ({ value: x.skill, count: x._count })),
      topics: topics.map((x) => ({ value: x.topic, count: x._count })),
    },
  });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const built = buildQuestionData(await req.json(), { skill: 'vocabulary', topic: 'general' });
  if ('error' in built) return NextResponse.json({ error: built.error }, { status: 400 });

  const q = await prisma.question.create({ data: { ...built.data, inBank: true, source: 'manual' } });
  return NextResponse.json(serialize(q), { status: 201 });
}
