import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Kiểm tra sức khỏe cho Docker / giám sát: ứng dụng chạy và kết nối được database.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok' });
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 503 });
  }
}
