import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { cleanSectionTitle, normalizeImportedQuestion } from '@/lib/importNormalize';
import { extractStructured, GeminiNotConfiguredError } from '@/lib/gemini';
import { fileToGeminiParts, MAX_IMPORT_FILE_BYTES } from '@/lib/fileExtract';

const SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    duration_minutes: { type: 'integer' },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          skill: { type: 'string', enum: ['listening', 'reading', 'writing', 'speaking', 'vocabulary'] },
          instructions: { type: 'string' },
          time_limit_minutes: { type: 'integer' },
          questions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question: { type: 'string' },
                type: { type: 'string', enum: ['multiple_choice', 'fill_blank', 'true_false', 'matching', 'essay', 'speaking'] },
                level: { type: 'string', enum: ['A1', 'A2', 'B1', 'B2', 'C1'] },
                topic: { type: 'string' },
                options: { type: 'array', items: { type: 'string' } },
                passage: { type: 'string', description: 'Đoạn văn (bài đọc) hoặc văn bản bài nghe (transcript) mà câu hỏi dựa vào; bỏ trống nếu không có' },
                answer: { type: 'string' },
                explanation: { type: 'string' },
              },
              required: ['question', 'type', 'level', 'topic', 'answer', 'explanation'],
            },
          },
        },
        required: ['title', 'skill', 'instructions', 'questions'],
      },
    },
  },
  required: ['title', 'description', 'duration_minutes', 'sections'],
};

interface ImportedTest {
  title: string;
  description: string;
  duration_minutes: number;
  sections: {
    title: string;
    skill: string;
    instructions: string;
    time_limit_minutes?: number;
    questions: {
      question: string;
      type: string;
      level: string;
      topic: string;
      options?: string[];
      passage?: string;
      answer: string;
      explanation: string;
    }[];
  }[];
}

const PROMPT = `Bạn nhận được một đề thi/ngân hàng câu hỏi tiếng Anh (chuyên ngành hoặc tổng quát, có thể là file Word hoặc PDF). Hãy đọc và trích xuất thành đề thi đầu vào có cấu trúc đúng JSON schema đã cho: title (tên đề), description (mô tả ngắn), duration_minutes (tổng thời gian làm bài, ước lượng nếu không ghi rõ), sections (các phần thi theo từng kỹ năng: listening/reading/writing/speaking/vocabulary), mỗi section có title, skill, instructions (hướng dẫn làm bài), time_limit_minutes, và questions. Mỗi question có question (nội dung), type, level (ước lượng CEFR A1-C1 nếu không ghi rõ), topic (chủ đề ngắn gọn, ví dụ: email, meeting, travel), options (nếu là trắc nghiệm), answer (đáp án đúng), explanation (giải thích ngắn). Nếu tài liệu không chia rõ phần/kỹ năng, hãy tự phân loại câu hỏi theo kỹ năng phù hợp nhất. Với phần Đọc và phần Nghe, mỗi câu hỏi PHẢI kèm trường passage chứa nguyên văn đoạn đọc hoặc văn bản bài nghe (transcript). Với câu trắc nghiệm, đáp án (answer) phải trùng khớp nguyên văn một lựa chọn trong options. Chỉ trả JSON, không thêm chữ nào khác.`;

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Thiếu file' }, { status: 400 });
  if (file.size > MAX_IMPORT_FILE_BYTES) return NextResponse.json({ error: 'File quá lớn (tối đa 8MB)' }, { status: 400 });

  let parsed: ImportedTest;
  try {
    const parts = await fileToGeminiParts(file);
    parsed = await extractStructured<ImportedTest>(PROMPT, parts, SCHEMA);
  } catch (err) {
    if (err instanceof GeminiNotConfiguredError) {
      return NextResponse.json({ error: 'Chưa cấu hình GEMINI_API_KEY. Liên hệ người quản trị hệ thống để bật tính năng này.' }, { status: 503 });
    }
    console.error('Import test failed:', err);
    return NextResponse.json({ error: 'Không đọc được file hoặc AI xử lý thất bại. Thử lại với file khác.' }, { status: 500 });
  }

  if (!parsed.sections?.length) {
    return NextResponse.json({ error: 'AI không trích xuất được câu hỏi nào từ file này.' }, { status: 422 });
  }

  const test = await prisma.test.create({
    data: {
      title: parsed.title || `Đề nhập từ ${file.name}`,
      description: parsed.description || '',
      durationMinutes: parsed.duration_minutes || 45,
      isActive: false,
      createdVia: 'ai_import',
      sourceFileName: file.name,
      sections: {
        create: parsed.sections.map((s, idx) => ({
          title: cleanSectionTitle(s.title),
          skill: s.skill as never,
          instructions: s.instructions || '',
          timeLimitMinutes: s.time_limit_minutes ?? null,
          order: idx,
          questions: {
            create: s.questions.map(normalizeImportedQuestion).map((q) => ({
              question: q.question,
              type: q.type as never,
              level: q.level as never,
              topic: q.topic || 'general',
              skill: s.skill as never,
              options: q.options ? JSON.stringify(q.options) : null,
              passage: q.passage?.trim() ? q.passage : null,
              answer: JSON.stringify(q.answer),
              explanation: q.explanation || '',
            })),
          },
        })),
      },
    },
  });

  return NextResponse.json({ test_id: test.id }, { status: 201 });
}
