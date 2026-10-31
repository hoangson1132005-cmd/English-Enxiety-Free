import { extractStructured, GeminiNotConfiguredError } from '@/lib/gemini';

interface GradeResult {
  score: number; // 0-100
  feedback: string;
}

const GRADE_SCHEMA = {
  type: 'object',
  properties: {
    score: { type: 'number', description: 'Điểm từ 0 đến 100' },
    feedback: { type: 'string', description: 'Nhận xét ngắn gọn bằng tiếng Việt, 2-4 câu' },
  },
  required: ['score', 'feedback'],
};

// Grades a free-text (essay/speaking-transcript) answer against a model
// answer using Gemini. Falls back to a length-based heuristic if Gemini
// isn't configured or the call fails, so the feature degrades gracefully
// instead of blocking test/lesson submission.
export async function gradeFreeTextAnswer(
  question: string,
  modelAnswer: string,
  studentAnswer: string
): Promise<GradeResult> {
  if (!studentAnswer || !studentAnswer.trim()) {
    return { score: 0, feedback: 'Chưa có câu trả lời.' };
  }

  try {
    const prompt = `Bạn là giáo viên tiếng Anh chuyên ngành logistics. Chấm điểm câu trả lời của học viên cho câu hỏi sau, thang điểm 0-100, dựa trên nội dung, ngữ pháp và mức độ phù hợp với đáp án mẫu. Trả về JSON đúng schema.

Câu hỏi: ${question}

Đáp án mẫu / gợi ý chấm: ${modelAnswer}

Câu trả lời của học viên: ${studentAnswer}`;

    return await extractStructured<GradeResult>(prompt, [], GRADE_SCHEMA);
  } catch (err) {
    if (err instanceof GeminiNotConfiguredError) {
      // Heuristic fallback: credit a reasonable-length attempt.
      const score = studentAnswer.trim().length >= 10 ? 70 : 0;
      return { score, feedback: 'Chấm tạm bằng độ dài câu trả lời (chưa cấu hình AI chấm bài thật).' };
    }
    console.error('Gemini grading failed:', err);
    const score = studentAnswer.trim().length >= 10 ? 70 : 0;
    return { score, feedback: 'Không thể chấm bằng AI lúc này, đã chấm tạm.' };
  }
}
