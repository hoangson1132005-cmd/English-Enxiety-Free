import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { resolveTestForUser } from '@/lib/testAccess';

// Trả về đề cho học viên làm (đề đầu vào, hoặc đề tổng kết khi có ?test_id=). Không gửi đáp án xuống trình duyệt.
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const testId = new URL(req.url).searchParams.get('test_id');
  const test = await resolveTestForUser(session.user.id, testId);
  if (!test) return NextResponse.json({ error: 'Chưa có đề test đang hoạt động' }, { status: 404 });

  return NextResponse.json({
    id: test.id,
    kind: test.kind,
    title: test.title,
    description: test.description,
    duration_minutes: test.durationMinutes,
    sections: [...test.sections]
      .sort((a, b) => a.order - b.order)
      .map((s) => ({
        id: s.id,
        skill: s.skill,
        title: s.title,
        instructions: s.instructions,
        time_limit_minutes: s.timeLimitMinutes ?? undefined,
        questions: s.questions.map((q) => ({
          id: q.id,
          skill: q.skill,
          topic: q.topic,
          level: q.level,
          type: q.type,
          question: q.question,
          options: q.options ? JSON.parse(q.options) : undefined,
          audio_url: q.audioUrl ?? undefined,
          passage: q.passage ?? undefined,
        })),
      })),
  });
}
