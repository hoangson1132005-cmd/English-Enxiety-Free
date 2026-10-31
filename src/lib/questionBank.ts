import type { Question } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { extractStructured } from '@/lib/gemini';
import { normalizeImportedQuestion } from '@/lib/importNormalize';
import type { CEFRLevel, SkillType } from '@/types';

// Số câu cho từng loại bài kiểm tra
export const LESSON_QUIZ_SIZE = 8; // cuối bài: 5-10 câu
export const LESSON_QUIZ_SIZE_FREE_TEXT = 5; // bài Viết/Nói: ít câu hơn vì mỗi câu tự luận tốn thời gian
export const STAGE_QUIZ_SIZE = 18; // cuối chặng: 15-20 câu
export const FINAL_EXAM_SIZE = 30; // cuối khóa: khoảng 30 câu

const LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
const SKILL_ORDER: SkillType[] = ['vocabulary', 'reading', 'listening', 'writing', 'speaking'];
const AI_SHORTLIST_FACTOR = 2.5;

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'your', 'you', 'are', 'was', 'have', 'has', 'will', 'what', 'which',
  'about', 'into', 'bài', 'học', 'của', 'và', 'các', 'cho', 'trong', 'một', 'những', 'được', 'kiểm', 'tra', 'từ', 'vựng',
]);

// Tách chuỗi thành các từ khóa có nghĩa (bỏ từ ngắn và từ phổ biến) để so khớp độ liên quan.
export function tokenize(...texts: (string | undefined | null)[]) {
  const out = new Set<string>();
  for (const t of texts) {
    for (const w of (t ?? '').toLowerCase().split(/[^\p{L}\p{N}]+/u)) {
      if (w.length >= 4 && !STOPWORDS.has(w)) out.add(w);
    }
  }
  return [...out];
}

function levelIndex(level: string) {
  return LEVELS.indexOf(level as CEFRLevel);
}

export interface DrawOptions {
  userId: string;
  count: number;
  level: CEFRLevel;
  lessonIds?: string[]; // câu gắn với các bài này cũng được dùng làm nguồn
  topics?: string[];
  keywords?: string[]; // từ khóa nội dung của bài/chặng (tên bài, mô tả, từ vựng) để chấm độ liên quan
  focusSkills?: SkillType[]; // kỹ năng của bài/chặng
  weakSkills?: SkillType[]; // kỹ năng học viên còn yếu
  skillMix?: Partial<Record<SkillType, number>>; // tỷ trọng mong muốn (tổng ~1)
  maxFreeText: number; // số câu tự luận/nói tối đa (chấm bằng AI nên hạn chế)
}

// Bốc câu hỏi từ ngân hàng (+ câu gắn với các bài liên quan), ưu tiên: đúng cấp độ, đúng chủ đề, đúng kỹ năng,
// chưa từng gặp. Trả về cả số câu còn thiếu để nơi gọi bù bằng AI.
export async function drawQuestions(opts: DrawOptions): Promise<{ picked: Question[]; shortage: number; ranked: Question[]; relevantIds: Set<string> }> {
  const li = Math.max(0, levelIndex(opts.level));
  const nearLevels = LEVELS.filter((_, i) => Math.abs(i - li) <= 1);

  const sourceFilter = [{ inBank: true }, ...(opts.lessonIds?.length ? [{ lessonId: { in: opts.lessonIds } }] : [])];
  let candidates = await prisma.question.findMany({
    where: { OR: sourceFilter, testSectionId: null, level: { in: nearLevels } },
  });
  if (candidates.length < opts.count) {
    // Không đủ trong khoảng cấp độ gần: nới ra mọi cấp độ rồi để điểm số ưu tiên câu đúng cấp.
    candidates = await prisma.question.findMany({ where: { OR: sourceFilter, testSectionId: null } });
  }

  const seen = new Set(
    (await prisma.questionSeen.findMany({ where: { userId: opts.userId }, select: { questionId: true } })).map((s) => s.questionId)
  );
  const topics = new Set((opts.topics ?? []).map((t) => t.toLowerCase()));
  const lessonSet = new Set(opts.lessonIds ?? []);
  const keywordSet = new Set(opts.keywords ?? []);

  const relevantIds = new Set<string>(); // câu thật sự liên quan (đúng chủ đề / có từ khóa của bài / gắn với bài)
  const scored = candidates.map((q) => {
    const dist = Math.abs(levelIndex(q.level) - li);
    let score = dist === 0 ? 3 : dist === 1 ? 1 : -2;
    if (topics.has(q.topic.toLowerCase())) {
      score += 2;
      relevantIds.add(q.id);
    }
    if (keywordSet.size) {
      const hay = `${q.question} ${q.topic} ${q.options ?? ''} ${q.explanation} ${q.passage ?? ''}`.toLowerCase();
      let hits = 0;
      for (const k of keywordSet) if (hay.includes(k)) hits += 1;
      score += Math.min(4, hits * 1.5); // câu nhắc đúng từ khóa của bài được ưu tiên rõ rệt
      if (hits > 0) relevantIds.add(q.id);
    }
    if (opts.focusSkills?.includes(q.skill as SkillType)) score += 2;
    if (opts.weakSkills?.includes(q.skill as SkillType)) score += 1.5;
    if (q.lessonId && lessonSet.has(q.lessonId)) {
      score += 1;
      relevantIds.add(q.id);
    }
    if (seen.has(q.id)) score -= 5; // ưu tiên câu mới; chỉ lặp lại khi hết câu khác
    score += Math.random() * 1.5; // đề mỗi lần hơi khác nhau
    return { q, score };
  });
  scored.sort((a, b) => b.score - a.score);

  const isFree = (q: Question) => q.type === 'essay' || q.type === 'speaking';
  const quota = (skill: string) =>
    opts.skillMix ? Math.ceil((opts.skillMix[skill as SkillType] ?? 0.05) * opts.count) + 1 : Infinity;

  const picked: Question[] = [];
  const perSkill = new Map<string, number>();
  let free = 0;
  for (const { q } of scored) {
    if (picked.length >= opts.count) break;
    if (isFree(q) && free >= opts.maxFreeText) continue;
    if ((perSkill.get(q.skill) ?? 0) >= quota(q.skill)) continue;
    picked.push(q);
    perSkill.set(q.skill, (perSkill.get(q.skill) ?? 0) + 1);
    if (isFree(q)) free += 1;
  }
  // Còn chỗ trống do hạn mức kỹ năng: lấp bằng câu điểm cao còn lại.
  if (picked.length < opts.count) {
    const have = new Set(picked.map((q) => q.id));
    for (const { q } of scored) {
      if (picked.length >= opts.count) break;
      if (have.has(q.id) || (isFree(q) && free >= opts.maxFreeText)) continue;
      picked.push(q);
      if (isFree(q)) free += 1;
    }
  }

  return { picked, shortage: Math.max(0, opts.count - picked.length), ranked: scored.map((s) => s.q), relevantIds };
}

const AI_SELECT_SCHEMA = {
  type: 'object',
  properties: { ids: { type: 'array', items: { type: 'string' } } },
  required: ['ids'],
};

// AI đọc danh sách ứng viên và chọn bộ câu phù hợp nhất (đủ chủ đề, cân bằng kỹ năng, không trùng ý).
// Lỗi hoặc kết quả không hợp lệ thì giữ nguyên kết quả của bước lọc.
export async function aiRefineSelection(
  ranked: Question[],
  picked: Question[],
  count: number,
  context: { level: CEFRLevel; scope: string; field: string }
): Promise<Question[]> {
  const shortlist = ranked.slice(0, Math.ceil(count * AI_SHORTLIST_FACTOR));
  if (shortlist.length <= count) return picked;
  try {
    const list = shortlist
      .map((q) => `${q.id} | ${q.skill} | ${q.level} | ${q.topic} | ${q.type} | ${q.question.replace(/\s+/g, ' ').slice(0, 110)}`)
      .join('\n');
    const prompt = `Bạn là giáo viên tiếng Anh. Hãy chọn đúng ${count} câu hỏi phù hợp nhất cho một bài kiểm tra từ danh sách ứng viên.
Phạm vi bài kiểm tra: ${context.scope}
Học viên: trình độ ${context.level}; lĩnh vực: ${context.field}.
Tiêu chí: bám sát phạm vi, đúng trình độ, bao quát nhiều ý khác nhau (không chọn hai câu hỏi cùng một ý), cân bằng các kỹ năng. Chỉ dùng id có trong danh sách.

Danh sách (id | kỹ năng | cấp độ | chủ đề | loại | nội dung):
${list}`;
    const out = await extractStructured<{ ids: string[] }>(prompt, [], AI_SELECT_SCHEMA);
    const byId = new Map(shortlist.map((q) => [q.id, q]));
    const chosen: Question[] = [];
    const used = new Set<string>();
    for (const id of out.ids ?? []) {
      const q = byId.get(id);
      if (q && !used.has(id)) {
        chosen.push(q);
        used.add(id);
      }
    }
    if (chosen.length < Math.ceil(count * 0.8)) return picked; // AI trả quá ít: không tin
    for (const q of picked) {
      if (chosen.length >= count) break;
      if (!used.has(q.id)) chosen.push(q);
    }
    return chosen.slice(0, count);
  } catch (err) {
    console.error('AI question selection failed, using filtered selection:', err);
    return picked;
  }
}

interface GeneratedQuestion {
  skill: string; type: string; level: string; topic: string; question: string;
  options?: string[]; answer: string; explanation: string; passage?: string;
}

const GENERATE_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          skill: { type: 'string', enum: ['vocabulary', 'reading', 'listening', 'writing'] },
          type: { type: 'string', enum: ['multiple_choice', 'fill_blank', 'true_false', 'essay'] },
          level: { type: 'string', enum: LEVELS },
          topic: { type: 'string' },
          question: { type: 'string' },
          options: { type: 'array', items: { type: 'string' } },
          passage: { type: 'string', description: 'Đoạn đọc (reading) hoặc văn bản bài nghe (listening); bỏ trống với kỹ năng khác' },
          answer: { type: 'string' },
          explanation: { type: 'string', description: 'Giải thích ngắn bằng tiếng Việt' },
        },
        required: ['skill', 'type', 'level', 'topic', 'question', 'answer', 'explanation'],
      },
    },
  },
  required: ['questions'],
};

export interface GenerateContext {
  count: number;
  level: CEFRLevel;
  field: string;
  scope: string; // mô tả nội dung cần kiểm tra
  skills: SkillType[];
  topic: string;
}

// AI sinh câu hỏi mới để bù chỗ thiếu và LƯU VÀO NGÂN HÀNG (dùng lại cho người khác, không sinh riêng từng người).
export async function generateIntoBank(ctx: GenerateContext): Promise<Question[]> {
  if (ctx.count <= 0) return [];
  const skills = ctx.skills.filter((s) => s !== 'speaking');
  try {
    const prompt = `Bạn là giáo viên tiếng Anh. Hãy tạo ${ctx.count} câu hỏi kiểm tra mới, đúng trình độ ${ctx.level}, dùng cho học viên lĩnh vực: ${ctx.field}.
Nội dung cần kiểm tra:
${ctx.scope}

Yêu cầu: ưu tiên kỹ năng ${skills.join(', ') || 'vocabulary, reading'}. Câu trắc nghiệm có đúng 4 lựa chọn và answer trùng khớp nguyên văn một lựa chọn. Câu reading/listening PHẢI có passage (đoạn đọc hoặc transcript). Tối đa 1 câu viết (essay, answer là bài mẫu). Các câu phải khác ý nhau và đặt trong tình huống thực tế. Chủ đề (topic) gần với "${ctx.topic}".`;
    const out = await extractStructured<{ questions: GeneratedQuestion[] }>(prompt, [], GENERATE_SCHEMA);

    const created: Question[] = [];
    for (const raw of out.questions ?? []) {
      const q = normalizeImportedQuestion(raw);
      const options = q.options ?? [];
      if (!q.question || !q.answer) continue;
      if (q.type === 'multiple_choice' && (options.length < 2 || !options.map((o) => o.toLowerCase()).includes(q.answer.toLowerCase()))) continue;
      if ((q.skill === 'reading' || q.skill === 'listening') && !q.passage?.trim()) continue;
      created.push(
        await prisma.question.create({
          data: {
            skill: q.skill as never, topic: q.topic || ctx.topic, level: (LEVELS.includes(q.level as CEFRLevel) ? q.level : ctx.level) as never,
            type: q.type as never, question: q.question,
            options: q.type === 'multiple_choice' || q.type === 'true_false' ? JSON.stringify(q.type === 'true_false' ? ['True', 'False'] : options) : null,
            answer: JSON.stringify(q.answer), explanation: q.explanation || '', passage: q.passage?.trim() ? q.passage : null,
            inBank: true, source: 'ai',
          },
        })
      );
    }
    return created;
  } catch (err) {
    console.error('AI question generation failed:', err);
    return [];
  }
}

export interface AssembleOptions extends DrawOptions {
  field: string;
  scope: string;
  topic: string;
  useAiSelection: boolean;
}

// Bốc câu từ ngân hàng; thiếu thì nhờ AI sinh bổ sung (lưu vào ngân hàng); tùy chọn nhờ AI chọn lại cho sát phạm vi.
export async function assembleQuestions(opts: AssembleOptions): Promise<Question[]> {
  const drawn = await drawQuestions(opts);
  const { shortage, ranked } = drawn;
  let picked = drawn.picked;

  if (shortage > 0) {
    const generated = await generateIntoBank({
      count: shortage,
      level: opts.level,
      field: opts.field,
      scope: opts.scope,
      skills: opts.focusSkills ?? ['vocabulary', 'reading'],
      topic: opts.topic,
    });
    picked = [...picked, ...generated].slice(0, opts.count);
  } else {
    // Đủ số câu nhưng quá nửa là câu lạc đề (ngân hàng chưa có nhiều câu về nội dung này): AI sinh thêm câu đúng chủ đề,
    // lưu vào ngân hàng và thay cho các câu lạc đề.
    const relevant = picked.filter((q) => drawn.relevantIds.has(q.id));
    const need = opts.keywords?.length ? Math.ceil(opts.count * 0.6) - relevant.length : 0;
    let addedGenerated = false;
    if (need > 0) {
      const generated = await generateIntoBank({
        count: need, level: opts.level, field: opts.field, scope: opts.scope, skills: opts.focusSkills ?? ['vocabulary', 'reading'], topic: opts.topic,
      });
      if (generated.length) {
        const offTopic = picked.filter((q) => !drawn.relevantIds.has(q.id));
        picked = [...relevant, ...generated, ...offTopic].slice(0, opts.count);
        addedGenerated = true;
      }
    }
    if (opts.useAiSelection && !addedGenerated) {
      picked = await aiRefineSelection(ranked, picked, opts.count, { level: opts.level, scope: opts.scope, field: opts.field });
    }
  }

  // Sắp xếp để cùng kỹ năng / cùng đoạn văn nằm cạnh nhau, dễ làm bài.
  return picked.sort(
    (a, b) =>
      SKILL_ORDER.indexOf(a.skill as SkillType) - SKILL_ORDER.indexOf(b.skill as SkillType) ||
      (a.passage ?? '').localeCompare(b.passage ?? '')
  );
}

// Ghi nhận kết quả để lần sau ưu tiên câu mới và thống kê độ khó của từng câu.
export async function recordQuestionResults(userId: string, results: { questionId: string; score: number }[]) {
  if (!results.length) return;
  await prisma.questionSeen.createMany({ data: results.map((r) => ({ userId, questionId: r.questionId })), skipDuplicates: true });
  await Promise.all(
    results.map((r) =>
      prisma.question.update({
        where: { id: r.questionId },
        data: { usedCount: { increment: 1 }, ...(r.score >= 70 ? { correctCount: { increment: 1 } } : {}) },
      })
    )
  );
}

export function toLearnerQuestion(q: Question) {
  return {
    id: q.id,
    skill: q.skill,
    topic: q.topic,
    level: q.level,
    type: q.type,
    question: q.question,
    options: q.options ? (JSON.parse(q.options) as string[]) : undefined,
    passage: q.passage ?? undefined,
    audio_url: q.audioUrl ?? undefined,
  };
}
