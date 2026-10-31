import { prisma } from '@/lib/prisma';

export interface QuizSettingsValues {
  lessonSize: number;
  lessonSizeFreeText: number;
  stageSize: number;
  finalSize: number;
  passScore: number;
}

export const DEFAULT_QUIZ_SETTINGS: QuizSettingsValues = {
  lessonSize: 8, // cuối bài: 5-10 câu
  lessonSizeFreeText: 5, // bài Viết/Nói
  stageSize: 18, // cuối chặng: 15-20 câu
  finalSize: 30, // cuối khóa: khoảng 30 câu
  passScore: 70,
};

// Giới hạn hợp lệ cho từng cài đặt (chặn nhập sai làm hỏng bài kiểm tra)
export const QUIZ_SETTING_LIMITS: Record<keyof QuizSettingsValues, [number, number]> = {
  lessonSize: [3, 20],
  lessonSizeFreeText: [1, 10],
  stageSize: [5, 40],
  finalSize: [10, 60],
  passScore: [30, 95],
};

let cache: { at: number; value: QuizSettingsValues } | null = null;
const TTL_MS = 15_000;

export function invalidateQuizSettingsCache() {
  cache = null;
}

export async function getQuizSettings(): Promise<QuizSettingsValues> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value;
  const row = await prisma.quizSettings.findUnique({ where: { id: 'main' } });
  const value: QuizSettingsValues = row
    ? {
        lessonSize: row.lessonSize, lessonSizeFreeText: row.lessonSizeFreeText,
        stageSize: row.stageSize, finalSize: row.finalSize, passScore: row.passScore,
      }
    : DEFAULT_QUIZ_SETTINGS;
  cache = { at: Date.now(), value };
  return value;
}

export async function getPassScore() {
  return (await getQuizSettings()).passScore;
}
