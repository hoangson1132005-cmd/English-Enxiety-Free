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
    const prompt = `Bạn là giáo viên tiếng Anh. Chấm điểm câu trả lời của học viên cho câu hỏi sau, thang điểm 0-100, dựa trên nội dung, ngữ pháp và mức độ phù hợp với đáp án mẫu. Trả về JSON đúng schema.

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

// Nhận xét "rút kinh nghiệm" sau khi làm bài: tóm tắt lỗi sai và gợi ý cách ôn. Thất bại thì dùng phương án dự phòng.
export async function buildReviewSummary(
  lessonTitle: string,
  mistakes: { question: string; given: string; correct: string; explanation: string }[]
): Promise<string> {
  if (!mistakes.length) return 'Bạn trả lời đúng toàn bộ. Hãy tiếp tục với bài kế tiếp!';

  const fallback = `Bạn cần xem lại ${mistakes.length} câu chưa đạt. ${mistakes
    .slice(0, 3)
    .map((m) => m.explanation)
    .filter(Boolean)
    .join(' ')}`.trim();

  try {
    const prompt = `Bạn là giáo viên tiếng Anh. Học viên vừa làm bài "${lessonTitle}" và sai các câu sau. Hãy viết phần "rút kinh nghiệm" bằng tiếng Việt, tối đa 4 câu: chỉ ra điểm kiến thức học viên còn nhầm, và gợi ý 1-2 cách ôn cụ thể. Giọng khích lệ.

${mistakes
  .map((m, i) => `${i + 1}. Câu hỏi: ${m.question}\n   Học viên trả lời: ${m.given || '(bỏ trống)'}\n   Đáp án đúng/gợi ý: ${m.correct}\n   Giải thích: ${m.explanation}`)
  .join('\n')}`;
    const out = await extractStructured<{ summary: string }>(prompt, [], {
      type: 'object',
      properties: { summary: { type: 'string' } },
      required: ['summary'],
    });
    return out.summary || fallback;
  } catch {
    return fallback;
  }
}

export interface GradedAnswer {
  score: number;
  feedback: string;
  correctText: string;
  givenText: string;
}

interface GradableQuestion {
  question: string;
  type: string;
  answer: string; // JSON string | string[]
  explanation: string;
}

// Chấm một câu: trắc nghiệm/đúng sai/điền từ so khớp đáp án, tự luận/nói chấm bằng AI.
export async function gradeQuestion(q: GradableQuestion, given: string | string[] | undefined): Promise<GradedAnswer> {
  const givenText = Array.isArray(given) ? given.join('; ') : (given ?? '');
  const correctAnswer = JSON.parse(q.answer) as string | string[];
  const correctText = Array.isArray(correctAnswer) ? correctAnswer.join(' / ') : correctAnswer;

  if (q.type === 'essay' || q.type === 'speaking') {
    const graded = await gradeFreeTextAnswer(q.question, `${correctText}\n${q.explanation}`, givenText);
    return { score: graded.score, feedback: graded.feedback, correctText, givenText };
  }

  const norm = givenText.trim().toLowerCase();
  const isCorrect = Array.isArray(correctAnswer)
    ? correctAnswer.some((a) => a.trim().toLowerCase() === norm)
    : correctAnswer.trim().toLowerCase() === norm;
  return { score: isCorrect ? 100 : 0, feedback: q.explanation, correctText, givenText };
}
