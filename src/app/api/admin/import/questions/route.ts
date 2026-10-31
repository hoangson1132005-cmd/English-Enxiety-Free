import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { extractStructured, GeminiNotConfiguredError } from '@/lib/gemini';
import { fileToGeminiParts, MAX_IMPORT_FILE_BYTES } from '@/lib/fileExtract';
import { normalizeImportedQuestion } from '@/lib/importNormalize';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const SKILLS = ['listening', 'reading', 'writing', 'speaking', 'vocabulary'];
const TYPES = ['multiple_choice', 'fill_blank', 'true_false', 'essay', 'speaking'];
const CHUNK_CHARS = 7000; // file dài được chia nhỏ để AI không bị cắt cụt kết quả
const MAX_QUESTIONS_PER_FILE = 400;

const SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          type: { type: 'string', enum: TYPES },
          skill: { type: 'string', enum: SKILLS },
          level: { type: 'string', enum: LEVELS },
          topic: { type: 'string' },
          options: { type: 'array', items: { type: 'string' } },
          passage: { type: 'string', description: 'Đoạn đọc hoặc văn bản bài nghe (transcript) mà câu hỏi dựa vào; bỏ trống nếu không có' },
          answer: { type: 'string' },
          explanation: { type: 'string' },
        },
        required: ['question', 'type', 'skill', 'level', 'topic', 'answer', 'explanation'],
      },
    },
  },
  required: ['questions'],
};

const PROMPT = `Bạn nhận được một ngân hàng câu hỏi tiếng Anh (file Word/PDF). Hãy trích xuất MỌI câu hỏi thành danh sách theo đúng JSON schema.
Với mỗi câu: question (chỉ nội dung câu hỏi, bỏ số thứ tự "Câu 1."), type, skill (vocabulary/reading/listening/writing/speaking), level (CEFR A1-C1: lấy từ tài liệu nếu có, nếu không thì tự ước lượng theo độ khó), topic (chủ đề ngắn gọn bằng tiếng Anh, vd: email, meeting, travel), options (bỏ chữ cái "A." đầu mỗi lựa chọn), answer (đáp án đúng; với trắc nghiệm PHẢI trùng khớp nguyên văn một lựa chọn), explanation (giải thích ngắn, tự viết nếu tài liệu không có).
Câu đọc hiểu / nghe hiểu PHẢI kèm passage chứa nguyên văn đoạn đọc hoặc transcript; nhiều câu dùng chung một đoạn thì lặp lại đoạn đó ở mỗi câu. Chỉ trả JSON.`;

interface Raw {
  question: string; type: string; skill: string; level: string; topic: string;
  options?: string[]; passage?: string; answer: string; explanation: string;
}

function chunkText(text: string) {
  if (text.length <= CHUNK_CHARS) return [text];
  const chunks: string[] = [];
  let current = '';
  for (const para of text.split(/\n{2,}|\r\n\r\n/)) {
    if ((current + para).length > CHUNK_CHARS && current) {
      chunks.push(current);
      current = '';
    }
    current += para + '\n\n';
  }
  if (current.trim()) chunks.push(current);
  return chunks;
}

// Nhập ngân hàng câu hỏi từ file Word/PDF. Câu không hợp lệ (thiếu đáp án, đáp án không khớp lựa chọn,
// bài đọc/nghe thiếu đoạn văn) bị bỏ qua và được báo lại.
export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Thiếu file' }, { status: 400 });
  if (file.size > MAX_IMPORT_FILE_BYTES) return NextResponse.json({ error: 'File quá lớn (tối đa 8MB)' }, { status: 400 });

  const raw: Raw[] = [];
  try {
    const parts = await fileToGeminiParts(file);
    const textParts = parts.filter((p): p is string => typeof p === 'string');
    const jobs = textParts.length ? textParts.flatMap(chunkText).map((t) => [t]) : [parts];
    for (const job of jobs) {
      const out = await extractStructured<{ questions: Raw[] }>(PROMPT, job, SCHEMA);
      raw.push(...(out.questions ?? []));
      if (raw.length >= MAX_QUESTIONS_PER_FILE) break;
    }
  } catch (err) {
    if (err instanceof GeminiNotConfiguredError) {
      return NextResponse.json({ error: 'Chưa cấu hình GEMINI_API_KEY.' }, { status: 503 });
    }
    console.error('Import question bank failed:', err);
    return NextResponse.json({ error: 'Không đọc được file hoặc AI xử lý thất bại. Thử lại với file khác.' }, { status: 500 });
  }

  let created = 0;
  const skipped: string[] = [];
  for (const r of raw.slice(0, MAX_QUESTIONS_PER_FILE)) {
    const q = normalizeImportedQuestion(r);
    const options = q.options ?? [];
    const label = q.question.slice(0, 60);
    if (!q.question || !q.answer) { skipped.push(`${label} (thiếu đáp án)`); continue; }
    if (q.type === 'multiple_choice' && (options.length < 2 || !options.map((o) => o.toLowerCase()).includes(q.answer.toLowerCase()))) {
      skipped.push(`${label} (đáp án không khớp lựa chọn)`); continue;
    }
    if ((q.skill === 'reading' || q.skill === 'listening') && !q.passage?.trim()) {
      skipped.push(`${label} (thiếu đoạn văn / transcript)`); continue;
    }
    await prisma.question.create({
      data: {
        skill: (SKILLS.includes(q.skill) ? q.skill : 'vocabulary') as never,
        type: (TYPES.includes(q.type) ? q.type : 'multiple_choice') as never,
        level: (LEVELS.includes(q.level) ? q.level : 'B1') as never,
        topic: q.topic?.trim() || 'general',
        question: q.question,
        options: q.type === 'multiple_choice' ? JSON.stringify(options) : q.type === 'true_false' ? JSON.stringify(['True', 'False']) : null,
        answer: JSON.stringify(q.answer),
        explanation: q.explanation || '',
        passage: q.passage?.trim() ? q.passage : null,
        inBank: true,
        source: 'import',
      },
    });
    created += 1;
  }

  if (!created) {
    return NextResponse.json({ error: 'AI không trích xuất được câu hỏi hợp lệ nào từ file này.', skipped }, { status: 422 });
  }
  return NextResponse.json({ created, skipped }, { status: 201 });
}
