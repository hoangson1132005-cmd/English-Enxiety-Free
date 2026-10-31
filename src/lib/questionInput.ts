// Kiểm tra và chuẩn hoá dữ liệu câu hỏi do admin nhập (thêm/sửa câu hỏi bài học, đề test, ngân hàng câu hỏi).

const SKILLS = ['listening', 'reading', 'writing', 'speaking', 'vocabulary'];
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const TYPES = ['multiple_choice', 'fill_blank', 'true_false', 'matching', 'essay', 'speaking'];

export interface QuestionFallback {
  skill: string;
  topic: string;
}

type Built =
  | { error: string }
  | {
      data: {
        skill: never; topic: string; level: never; type: never; question: string;
        options: string | null; answer: string; explanation: string; passage: string | null; audioUrl: string | null;
      };
    };

export function buildQuestionData(body: Record<string, unknown>, fallback: QuestionFallback): Built {
  const question = typeof body.question === 'string' ? body.question.trim() : '';
  if (!question) return { error: 'Thiếu nội dung câu hỏi' };

  const type = TYPES.includes(body.type as string) ? (body.type as string) : 'multiple_choice';
  const skill = SKILLS.includes(body.skill as string) ? (body.skill as string) : fallback.skill;
  const level = LEVELS.includes(body.level as string) ? (body.level as string) : 'B1';

  let options: string[] | null = null;
  if (Array.isArray(body.options)) {
    options = (body.options as unknown[]).map((o) => String(o).trim()).filter(Boolean);
  }
  if (type === 'true_false' && (!options || options.length < 2)) options = ['True', 'False'];
  if (type !== 'multiple_choice' && type !== 'true_false') options = null;

  const rawAnswer = body.answer;
  const answer: string | string[] = Array.isArray(rawAnswer)
    ? rawAnswer.map((a) => String(a).trim()).filter(Boolean)
    : String(rawAnswer ?? '').trim();
  if (!answer || (Array.isArray(answer) && answer.length === 0)) return { error: 'Thiếu đáp án' };

  if (type === 'multiple_choice' || type === 'true_false') {
    if (!options || options.length < 2) return { error: 'Câu trắc nghiệm cần ít nhất 2 lựa chọn' };
    const answers = Array.isArray(answer) ? answer : [answer];
    const lowered = options.map((o) => o.toLowerCase());
    if (!answers.every((a) => lowered.includes(a.toLowerCase()))) {
      return { error: 'Đáp án đúng phải trùng với một trong các lựa chọn' };
    }
  }

  const passage = typeof body.passage === 'string' && body.passage.trim() ? body.passage.trim() : null;
  const audioUrl = typeof body.audio_url === 'string' && body.audio_url.trim() ? body.audio_url.trim() : null;

  return {
    data: {
      skill: skill as never,
      topic: (typeof body.topic === 'string' && body.topic.trim()) || fallback.topic,
      level: level as never,
      type: type as never,
      question,
      options: options ? JSON.stringify(options) : null,
      answer: JSON.stringify(answer),
      explanation: typeof body.explanation === 'string' ? body.explanation : '',
      passage,
      audioUrl,
    },
  };
}

export function serializeAdminQuestion(q: {
  id: string; skill: string; topic: string; level: string; type: string; question: string;
  options: string | null; answer: string; explanation: string; passage: string | null; audioUrl: string | null;
}) {
  return {
    id: q.id,
    skill: q.skill,
    topic: q.topic,
    level: q.level,
    type: q.type,
    question: q.question,
    options: q.options ? JSON.parse(q.options) : undefined,
    answer: JSON.parse(q.answer),
    explanation: q.explanation,
    passage: q.passage ?? undefined,
    audio_url: q.audioUrl ?? undefined,
  };
}
