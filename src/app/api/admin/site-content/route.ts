import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { DEFAULT_SITE_CONTENT } from '@/lib/siteContentDefaults';

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const content = await prisma.siteContent.upsert({
    where: { id: 'main' },
    update: {},
    create: { id: 'main', ...DEFAULT_SITE_CONTENT },
  });

  return NextResponse.json(content);
}

export async function PATCH(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const data: Record<string, string | null> = {};

  const textFields = [
    'heroBadgeText', 'heroTitleHighlight', 'heroSubtitle', 'whyChooseTitle',
    'whyChooseBullet1', 'whyChooseBullet2', 'whyChooseBullet3', 'footerTagline',
  ] as const;
  for (const field of textFields) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  if (body.logoImageBase64 !== undefined) data.logoImageBase64 = body.logoImageBase64;
  if (body.logoMimeType !== undefined) data.logoMimeType = body.logoMimeType;

  const content = await prisma.siteContent.upsert({
    where: { id: 'main' },
    update: data,
    create: { id: 'main', ...DEFAULT_SITE_CONTENT, ...data },
  });

  return NextResponse.json(content);
}
