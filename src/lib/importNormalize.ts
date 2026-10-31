// Chuẩn hoá câu hỏi do AI trích xuất từ file Word/PDF: tài liệu thật thường đánh số "Câu 1.", gắn "A." vào lựa chọn,
// ghi đáp án là chữ cái ("B") hoặc có tiền tố. Nếu không chuẩn hoá, đáp án sẽ không khớp lựa chọn và chấm điểm luôn sai.

const QUESTION_PREFIX = /^\s*(câu|question|q)\s*\d+\s*[.:)\-]\s*/i;
const OPTION_PREFIX = /^\s*\(?([A-Ha-h])[.)\]:]\s+/;
const SECTION_PREFIX = /^\s*(phần thi|phần|section|part)\s*(\d+|[ivx]+)?\s*[:.\-]\s*/i;

const LESSON_PREFIX = /^\s*(bài|lesson)\s*[\d.]+\s*[:.\-–]\s*/i;
const STAGE_PREFIX = /^\s*(chặng|giai đoạn|stage|module)\s*\d+\s*[:.\-–]\s*/i;

export function cleanLessonTitle(text: string) {
  return text.replace(LESSON_PREFIX, '').trim() || text.trim();
}

export function cleanStageTitle(text: string) {
  return text.replace(STAGE_PREFIX, '').trim() || text.trim();
}

export function cleanQuestionText(text: string) {
  return text.replace(QUESTION_PREFIX, '').trim();
}

export function cleanSectionTitle(text: string) {
  return text.replace(SECTION_PREFIX, '').trim() || text.trim();
}

interface RawQuestion {
  question: string;
  type: string;
  options?: string[];
  answer: string;
}

export function normalizeImportedQuestion<T extends RawQuestion>(q: T): T {
  const question = cleanQuestionText(q.question);
  const originalOptions = (q.options ?? []).map((o) => String(o).trim()).filter(Boolean);
  const options = originalOptions.map((o) => o.replace(OPTION_PREFIX, '').trim());

  let answer = String(q.answer ?? '').trim();
  if (options.length) {
    const lowered = options.map((o) => o.toLowerCase());
    const answerNoPrefix = answer.replace(OPTION_PREFIX, '').trim();
    const letter = answer.match(/^\(?([A-Ha-h])[.)\]:]?$/);

    if (lowered.includes(answerNoPrefix.toLowerCase())) {
      answer = options[lowered.indexOf(answerNoPrefix.toLowerCase())];
    } else if (letter && options[letter[1].toUpperCase().charCodeAt(0) - 65]) {
      answer = options[letter[1].toUpperCase().charCodeAt(0) - 65];
    }
  }

  return { ...q, question, options: options.length ? options : q.options, answer };
}
