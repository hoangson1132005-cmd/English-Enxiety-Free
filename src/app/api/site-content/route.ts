import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_SITE_CONTENT } from '@/lib/siteContentDefaults';

export async function GET() {
  const content = await prisma.siteContent.upsert({
    where: { id: 'main' },
    update: {},
    create: { id: 'main', ...DEFAULT_SITE_CONTENT },
  });
  return NextResponse.json(content);
}
