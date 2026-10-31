import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import {
  DEFAULT_QUIZ_SETTINGS, QUIZ_SETTING_LIMITS, getQuizSettings, invalidateQuizSettingsCache, type QuizSettingsValues,
} from '@/lib/quizSettings';

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json({ settings: await getQuizSettings(), defaults: DEFAULT_QUIZ_SETTINGS, limits: QUIZ_SETTING_LIMITS });
}

export async function PUT(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const data = {} as QuizSettingsValues;
  for (const key of Object.keys(QUIZ_SETTING_LIMITS) as (keyof QuizSettingsValues)[]) {
    const v = Number(body[key]);
    const [min, max] = QUIZ_SETTING_LIMITS[key];
    if (!Number.isInteger(v) || v < min || v > max) {
      return NextResponse.json({ error: `Giá trị "${key}" phải là số nguyên từ ${min} đến ${max}` }, { status: 400 });
    }
    data[key] = v;
  }
  await prisma.quizSettings.upsert({ where: { id: 'main' }, update: data, create: { id: 'main', ...data } });
  invalidateQuizSettingsCache();
  return NextResponse.json({ settings: data });
}
