import { prisma } from '@/lib/prisma';
import { extractStructured } from '@/lib/gemini';
import type { CEFRLevel, SkillType } from '@/types';

const AI_EXAM_QUESTIONS = 12;
const FALLBACK_PER_LESSON = 2;
const MAX_FALLBACK_QUESTIONS = 20;

interface AiQuestion {
  skill: string; type: string; level: string; topic: string; question: string;
  options?: string[]; answer: string; explanation: string; passage?: string;
}

const SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          skill: { type: 'string', enum: ['reading', 'writing', 'vocabulary'] },
          type: { type: 'string', enum: ['multiple_choice', 'fill_blank', 'true_false', 'essay'] },
          level: { type: 'string', enum: ['A1', 'A2', 'B1', 'B2', 'C1'] },
          topic: { type: 'string' },
          question: { type: 'string' },
          options: { type: 'array', items: { type: 'string' } },
          answer: { type: 'string' },
          explanation: { type: 'string' },
          passage: { type: 'string', description: 'Đoạn văn/chứng từ cho câu hỏi đọc hiểu' },
        },
        required: ['skill', 'type', 'level', 'topic', 'question', 'answer', 'explanation'],
      },
    },
  },
  required: ['questions'],
};

const SKILL_TITLES: Record<string, string> = {
  listening: 'Nghe', reading: 'Đọc hiểu', writing: 'Viết', speaking: 'Nói', vocabulary: 'Từ vựng',
};

type SectionInput = { skill: SkillType; questions: Omit<AiQuestion, 'skill'>[] };

async function persistExam(opts: { title: string; level: CEFRLevel; roadmapId: string; via: string; sections: SectionInput[] }) {
  return prisma.test.create({
    data: {
      title: opts.title,
      description: 'Bài kiểm tra tổng kết sau lộ trình học. Đạt từ 70 điểm để lên trình độ tiếp theo.',
      durationMinutes: 30,
      isActive: false,
      createdVia: opts.via,
      kind: 'level_up',
      targetLevel: opts.level,
      roadmapId: opts.roadmapId,
      sections: {
        create: opts.sections.map((s, idx) => ({
          skill: s.skill,
          title: SKILL_TITLES[s.skill] ?? s.skill,
          instructions: 'Trả lời các câu hỏi dựa trên những gì bạn đã học trong lộ trình.',
          order: idx,
          questions: {
            create: s.questions.map((q) => ({
              skill: s.skill,
              topic: q.topic || 'general',
              level: (q.level || 'A2') as never,
              type: q.type as never,
              question: q.question,
              options: q.options?.length ? JSON.stringify(q.options) : null,
              answer: JSON.stringify(q.answer),
              explanation: q.explanation || '',
              passage: q.passage ?? null,
            })),
          },
        })),
      },
    },
  });
}

// AI tạo đề từ nội dung đã học; nếu AI lỗi thì lấy mẫu lại chính các câu hỏi trong bài học của lộ trình.
async function buildExamForRoadmap(roadmapId: string) {
  const roadmap = await prisma.userRoadmap.findUniqueOrThrow({
    where: { id: roadmapId },
    include: {
      user: true,
      items: { where: { status: 'completed' }, include: { lesson: { include: { questions: true } } } },
    },
  });
  const level = roadmap.user.currentLevel as CEFRLevel;
  const title = `Kiểm tra tổng kết ${level} - Lộ trình ${roadmap.cycle}`;
  const lessons = roadmap.items.map((i) => i.lesson);

  try {
    const summary = lessons
      .map((l) => `- [${l.skill}] ${l.title} (chủ đề: ${l.topic}): ${l.description}`)
      .join('\n');
    const prompt = `Bạn là giáo viên tiếng Anh chuyên ngành logistics. Hãy tạo bài kiểm tra tổng kết gồm ${AI_EXAM_QUESTIONS} câu cho học viên trình độ ${level}, kiểm tra đúng những nội dung họ vừa học dưới đây. Phân bổ: chủ yếu từ vựng và đọc hiểu (câu đọc hiểu phải có passage), kèm 1 câu viết (essay, answer là gợi ý đáp án mẫu). Câu trắc nghiệm có 4 options và answer trùng khớp một option. Không hỏi lại y nguyên ví dụ trong bài, hãy đổi tình huống.

Nội dung đã học:
${summary}`;
    const out = await extractStructured<{ questions: AiQuestion[] }>(prompt, [], SCHEMA);
    const valid = (out.questions ?? []).filter(
      (q) => q.question && q.answer && (q.type !== 'multiple_choice' || (q.options?.length ?? 0) >= 2)
    );
    if (valid.length >= 6) {
      const bySkill = new Map<string, AiQuestion[]>();
      for (const q of valid) bySkill.set(q.skill, [...(bySkill.get(q.skill) ?? []), q]);
      const sections: SectionInput[] = [...bySkill.entries()].map(([skill, qs]) => ({ skill: skill as SkillType, questions: qs }));
      return persistExam({ title, level, roadmapId, via: 'ai', sections });
    }
  } catch (err) {
    console.error('AI exam generation failed, sampling lesson questions:', err);
  }

  const sampled: Record<string, Omit<AiQuestion, 'skill'>[]> = {};
  let total = 0;
  for (const l of lessons) {
    for (const q of l.questions.slice(0, FALLBACK_PER_LESSON)) {
      if (total >= MAX_FALLBACK_QUESTIONS) break;
      (sampled[l.skill] ??= []).push({
        type: q.type, level: q.level, topic: q.topic, question: q.question,
        options: q.options ? JSON.parse(q.options) : undefined,
        answer: JSON.parse(q.answer), explanation: q.explanation, passage: q.passage ?? undefined,
      });
      total += 1;
    }
  }
  const sections = Object.entries(sampled).map(([skill, questions]) => ({ skill: skill as SkillType, questions }));
  if (!sections.length) throw new Error('Lộ trình chưa có câu hỏi nào để tạo bài kiểm tra tổng kết');
  return persistExam({ title, level, roadmapId, via: 'sampled', sections });
}

// Chọn đề tổng kết cho học viên: đề admin kích hoạt cho level hiện tại, nếu không có thì đề AI gắn với lộ trình.
export async function getOrCreateExam(userId: string, roadmapId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const adminExam = await prisma.test.findFirst({
    where: { kind: 'level_up', isActive: true, targetLevel: user.currentLevel, roadmapId: null },
  });
  if (adminExam) return adminExam;

  const existing = await prisma.test.findFirst({ where: { kind: 'level_up', roadmapId } });
  return existing ?? buildExamForRoadmap(roadmapId);
}
