import { prisma } from '@/lib/prisma';

export interface VocabItem {
  term: string;
  pronunciation?: string;
  definition: string;
  definition_vi?: string;
  example?: string;
  example_vi?: string;
}

const PERSONAL_SET_TITLE = 'Từ vựng từ lộ trình';
const MAX_FALLBACK_WORDS = 15;

// Từ vựng của bài học: ưu tiên danh sách gắn với bài; bài kỹ năng "từ vựng" chưa có danh sách thì lấy
// từ bộ từ hệ thống cùng chủ đề.
export async function getLessonVocab(lesson: { vocabItems: string; skill: string; topic: string }): Promise<VocabItem[]> {
  try {
    const own = JSON.parse(lesson.vocabItems || '[]') as VocabItem[];
    if (own.length) return own;
  } catch {
    // dữ liệu hỏng -> dùng phương án dự phòng
  }
  if (lesson.skill !== 'vocabulary') return [];
  const cards = await prisma.vocabCard.findMany({
    where: { set: { ownerId: null, topic: lesson.topic } },
    take: MAX_FALLBACK_WORDS,
  });
  return cards.map((c) => ({
    term: c.term,
    pronunciation: c.pronunciation ?? undefined,
    definition: c.definition,
    definition_vi: c.definitionVi ?? undefined,
    example: c.example ?? undefined,
    example_vi: c.exampleVi ?? undefined,
  }));
}

// Lưu từ vào kho từ vựng cá nhân (không phụ thuộc lộ trình nên không mất khi sang lộ trình mới).
// Bỏ qua từ đã có. Trả về số từ mới được thêm.
export async function saveWordsForUser(userId: string, words: VocabItem[]) {
  if (!words.length) return 0;
  let set = await prisma.vocabSet.findFirst({ where: { ownerId: userId, title: PERSONAL_SET_TITLE } });
  set ??= await prisma.vocabSet.create({
    data: {
      title: PERSONAL_SET_TITLE,
      titleVi: PERSONAL_SET_TITLE,
      topic: 'custom',
      description: 'Các từ bạn gặp trong quá trình học. Bạn có thể thêm, sửa, xóa tùy ý.',
      icon: '🧭',
      ownerId: userId,
    },
  });

  const existing = await prisma.vocabCard.findMany({ where: { setId: set.id }, select: { term: true } });
  const have = new Set(existing.map((c) => c.term.trim().toLowerCase()));
  const fresh = words.filter((w) => w.term?.trim() && !have.has(w.term.trim().toLowerCase()));
  const unique = [...new Map(fresh.map((w) => [w.term.trim().toLowerCase(), w])).values()];
  if (!unique.length) return 0;

  await prisma.vocabCard.createMany({
    data: unique.map((w) => ({
      setId: set!.id,
      term: w.term.trim(),
      pronunciation: w.pronunciation ?? null,
      definition: w.definition,
      definitionVi: w.definition_vi ?? null,
      example: w.example ?? null,
      exampleVi: w.example_vi ?? null,
    })),
  });
  return unique.length;
}
