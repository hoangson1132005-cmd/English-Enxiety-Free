import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getLessonVocab, saveWordsForUser, type VocabItem } from '@/lib/lessonVocab';

// Lưu từ vựng của một bài học vào kho cá nhân. Có `terms` thì chỉ lưu các từ đó, không thì lưu toàn bộ.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { lesson_id, terms } = (await req.json()) as { lesson_id: string; terms?: string[] };
  const lesson = await prisma.lesson.findUnique({ where: { id: lesson_id } });
  if (!lesson) return NextResponse.json({ error: 'Không tìm thấy bài học' }, { status: 404 });

  let words: VocabItem[] = await getLessonVocab(lesson);
  if (terms?.length) {
    const wanted = new Set(terms.map((t) => t.trim().toLowerCase()));
    words = words.filter((w) => wanted.has(w.term.trim().toLowerCase()));
  }
  const added = await saveWordsForUser(session.user.id, words);
  return NextResponse.json({ added, total: words.length });
}
