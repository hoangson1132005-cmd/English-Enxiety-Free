import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const registerSchema = z.object({
  full_name: z.string().min(2),
  student_id: z.string().optional().default(''),
  email: z.string().email(),
  password: z.string().min(6),
  employment_status: z.enum(['student', 'employed']).default('student'),
  faculty_group: z.enum(['language', 'engineering', 'other']),
  major: z.string().min(1),
  study_year: z.number().int().min(1).max(3),
  research_consent: z.boolean(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }
  const data = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return NextResponse.json({ error: 'Email đã được sử dụng' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      fullName: data.full_name,
      studentId: data.student_id || null,
      employmentStatus: data.employment_status,
      facultyGroup: data.faculty_group,
      major: data.major,
      studyYear: data.study_year,
      researchConsent: data.research_consent,
      goal: 'work',
      interests: JSON.stringify(['documentation', 'forwarder']),
      dailyMinutes: 20,
      selfAssessedLevel: 'A2',
      currentLevel: 'A2',
    },
  });

  return NextResponse.json({ id: user.id, email: user.email });
}
