import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { extractStructured, GeminiNotConfiguredError } from '@/lib/gemini';
import { fileToGeminiParts, MAX_IMPORT_FILE_BYTES } from '@/lib/fileExtract';

const SCHEMA = {
  type: 'object',
  properties: {
    stages: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          weeks: { type: 'array', items: { type: 'integer' } },
          focus_skills: { type: 'array', items: { type: 'string', enum: ['listening', 'reading', 'writing', 'speaking', 'vocabulary'] } },
          has_midterm: { type: 'boolean' },
          has_final: { type: 'boolean' },
          why_this_stage: { type: 'string' },
          lessons: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                skill: { type: 'string', enum: ['listening', 'reading', 'writing', 'speaking', 'vocabulary'] },
                duration_minutes: { type: 'integer' },
                xp_reward: { type: 'integer' },
                description: { type: 'string' },
                topic: { type: 'string' },
                content: { type: 'string', description: 'Nội dung giảng dạy chi tiết, dạng markdown: giải thích từ vựng/ngữ pháp/ví dụ thực tế' },
                questions: {
                  type: 'array',
                  description: '3-6 câu hỏi ôn tập cuối bài để kiểm tra lại kiến thức vừa học',
                  items: {
                    type: 'object',
                    properties: {
                      question: { type: 'string' },
                      type: { type: 'string', enum: ['multiple_choice', 'fill_blank', 'true_false', 'essay', 'speaking'] },
                      level: { type: 'string', enum: ['A1', 'A2', 'B1', 'B2', 'C1'] },
                      topic: { type: 'string' },
                      options: { type: 'array', items: { type: 'string' } },
                      answer: { type: 'string' },
                      explanation: { type: 'string' },
                    },
                    required: ['question', 'type', 'level', 'topic', 'answer', 'explanation'],
                  },
                },
              },
              required: ['title', 'skill', 'description', 'topic', 'content', 'questions'],
            },
          },
        },
        required: ['title', 'description', 'weeks', 'focus_skills', 'lessons'],
      },
    },
  },
  required: ['stages'],
};

interface ImportedLesson {
  title: string; skill: string; duration_minutes?: number; xp_reward?: number;
  description: string; topic: string; content: string;
  questions: { question: string; type: string; level: string; topic: string; options?: string[]; answer: string; explanation: string }[];
}
interface ImportedStage {
  title: string; description: string; weeks: number[]; focus_skills: string[];
  has_midterm?: boolean; has_final?: boolean; why_this_stage?: string;
  lessons: ImportedLesson[];
}
interface ImportedRoadmap { stages: ImportedStage[] }

const PROMPT = `Bạn nhận được một giáo án/lộ trình giảng dạy tiếng Anh chuyên ngành logistics (file Word hoặc PDF). Hãy đọc và cấu trúc hoá thành lộ trình học đúng JSON schema đã cho: stages (các chặng học theo thứ tự thời gian), mỗi stage có title, description, weeks (các tuần học, ví dụ [1,2,3]), focus_skills, has_midterm/has_final nếu giáo án có nhắc tới kiểm tra giữa/cuối chặng, why_this_stage (vì sao chặng này phù hợp, 1-2 câu), và lessons. Mỗi lesson PHẢI có: title, skill, description (mô tả ngắn), topic, content (nội dung giảng dạy ĐẦY ĐỦ dạng markdown — giải thích từ vựng/ngữ pháp/tình huống thực tế, viết chi tiết như một bài giảng thật, không chỉ tóm tắt 1 câu), và questions (3-6 câu hỏi trắc nghiệm/tự luận để ôn lại kiến thức vừa học — bài test cuối bài). Nếu tài liệu không chia rõ chặng/tuần, hãy tự chia hợp lý theo nội dung. Chỉ trả JSON, không thêm chữ nào khác.`;

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Thiếu file' }, { status: 400 });
  if (file.size > MAX_IMPORT_FILE_BYTES) return NextResponse.json({ error: 'File quá lớn (tối đa 8MB)' }, { status: 400 });

  let parsed: ImportedRoadmap;
  try {
    const parts = await fileToGeminiParts(file);
    parsed = await extractStructured<ImportedRoadmap>(PROMPT, parts, SCHEMA);
  } catch (err) {
    if (err instanceof GeminiNotConfiguredError) {
      return NextResponse.json({ error: 'Chưa cấu hình GEMINI_API_KEY. Liên hệ người quản trị hệ thống để bật tính năng này.' }, { status: 503 });
    }
    console.error('Import roadmap failed:', err);
    return NextResponse.json({ error: 'Không đọc được file hoặc AI xử lý thất bại. Thử lại với file khác.' }, { status: 500 });
  }

  if (!parsed.stages?.length) {
    return NextResponse.json({ error: 'AI không trích xuất được chặng học nào từ file này.' }, { status: 422 });
  }

  const maxOrder = await prisma.stage.aggregate({ _max: { order: true } });
  let nextOrder = (maxOrder._max.order ?? 0) + 1;
  const createdStageIds: string[] = [];

  for (const stage of parsed.stages) {
    const createdStage = await prisma.stage.create({
      data: {
        order: nextOrder++,
        title: stage.title,
        description: stage.description || '',
        focusSkills: JSON.stringify(stage.focus_skills ?? []),
        weeks: JSON.stringify(stage.weeks ?? []),
        hasMidterm: !!stage.has_midterm,
        hasFinal: !!stage.has_final,
        whyThisStage: stage.why_this_stage || null,
        isPublished: false, // admin xem lại rồi mới xuất bản
      },
    });
    createdStageIds.push(createdStage.id);

    for (const [idx, lesson] of stage.lessons.entries()) {
      await prisma.lesson.create({
        data: {
          stageId: createdStage.id,
          order: idx + 1,
          title: lesson.title,
          skill: lesson.skill as never,
          durationMinutes: lesson.duration_minutes || 20,
          xpReward: lesson.xp_reward || 50,
          description: lesson.description || '',
          topic: lesson.topic || 'general',
          content: lesson.content || '',
          questions: {
            create: (lesson.questions ?? []).map((q) => ({
              question: q.question,
              type: q.type as never,
              level: q.level as never,
              topic: q.topic || lesson.topic || 'general',
              skill: lesson.skill as never,
              options: q.options ? JSON.stringify(q.options) : null,
              answer: JSON.stringify(q.answer),
              explanation: q.explanation || '',
            })),
          },
        },
      });
    }
  }

  return NextResponse.json({ stage_ids: createdStageIds }, { status: 201 });
}
