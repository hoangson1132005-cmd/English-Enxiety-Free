import { prisma } from '@/lib/prisma';
import { extractStructured } from '@/lib/gemini';
import { cleanStageTitle } from '@/lib/importNormalize';
import type { CEFRLevel, SkillType } from '@/types';

export const ROADMAP_WEEKS = 12;
const MAX_CANDIDATES_FOR_AI = 250;

const LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
const SKILLS: SkillType[] = ['listening', 'reading', 'writing', 'speaking', 'vocabulary'];

export function nextLevel(level: CEFRLevel): CEFRLevel {
  return LEVELS[Math.min(LEVELS.indexOf(level) + 1, LEVELS.length - 1)];
}

export function lastPhaseOf(phasesJson: string) {
  try {
    return Math.max(1, (JSON.parse(phasesJson) as unknown[]).length);
  } catch {
    return 1;
  }
}

export type RoadmapKind = 'initial' | 'level_up' | 'improve';
export type RoadmapAuthor = 'ai' | 'heuristic' | 'admin';

interface Candidate {
  id: string;
  title: string;
  skill: SkillType;
  level: CEFRLevel | null;
  topic: string;
  description: string;
  durationMinutes: number;
  order: number;
  source: string; // nhóm/nguồn gốc của bài (chỉ để gom chặng dự phòng)
}

export interface Phase {
  title: string;
  description: string;
}

interface AiPlan {
  rationale: string;
  focus_skills: string[];
  items: { lesson_id: string; reason: string }[];
  phases?: { title: string; description: string; lesson_ids: string[] }[];
}

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    rationale: { type: 'string', description: 'Giải thích 2-3 câu bằng tiếng Việt vì sao lộ trình này phù hợp với học viên' },
    focus_skills: { type: 'array', items: { type: 'string', enum: SKILLS } },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          lesson_id: { type: 'string' },
          reason: { type: 'string', description: 'Lý do chọn bài này cho học viên, 1 câu tiếng Việt' },
        },
        required: ['lesson_id', 'reason'],
      },
    },
    phases: {
      type: 'array',
      description: 'Chia lộ trình thành 2-4 chặng riêng cho học viên này, theo đúng thứ tự học',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Tên chặng ngắn gọn bằng tiếng Việt' },
          description: { type: 'string', description: 'Mục tiêu của chặng, 1 câu' },
          lesson_ids: { type: 'array', items: { type: 'string' } },
        },
        required: ['title', 'description', 'lesson_ids'],
      },
    },
  },
  required: ['rationale', 'focus_skills', 'items', 'phases'],
};

function levelDistance(a: CEFRLevel | null, b: CEFRLevel) {
  if (!a) return 0; // bài chưa gắn level: coi là phù hợp mọi trình độ
  return Math.abs(LEVELS.indexOf(a) - LEVELS.indexOf(b));
}

function weeksFor(minutesList: number[], dailyMinutes: number) {
  const perWeek = Math.max(dailyMinutes, 10) * 5;
  let acc = 0;
  return minutesList.map((m) => {
    acc += m;
    return Math.min(ROADMAP_WEEKS, Math.max(1, Math.ceil(acc / perWeek)));
  });
}

// Các kỹ năng yếu: ưu tiên điểm kiểm tra gần nhất, kèm điểm các bài học của chu kỳ trước (nếu có).
async function findWeakSkills(userId: string): Promise<SkillType[]> {
  const totals: Partial<Record<SkillType, number[]>> = {};

  const lastResult = await prisma.testResult.findFirst({
    where: { userId },
    orderBy: { completedAt: 'desc' },
    include: { test: { include: { sections: { select: { skill: true } } } } },
  });
  if (lastResult) {
    const scores = JSON.parse(lastResult.scores) as Partial<Record<SkillType, number>>;
    // Kỹ năng không có câu hỏi trong đề được lưu 0 điểm; không tính là "yếu".
    let tested = new Set<string>(lastResult.test?.sections.map((s) => s.skill) ?? []);
    if (!lastResult.test && lastResult.sessionId) {
      const quiz = await prisma.quizSession.findUnique({ where: { id: lastResult.sessionId } });
      if (quiz) {
        const qs = await prisma.question.findMany({ where: { id: { in: JSON.parse(quiz.questionIds) as string[] } }, select: { skill: true } });
        tested = new Set(qs.map((q) => q.skill));
      }
    }
    for (const s of SKILLS) if (tested.has(s) && typeof scores[s] === 'number') (totals[s] ??= []).push(scores[s]!);
  }

  const attempts = await prisma.lessonAttempt.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 60,
    include: { lesson: { select: { skill: true } } },
  });
  for (const a of attempts) (totals[a.lesson.skill as SkillType] ??= []).push(a.score);

  const avgs = SKILLS.filter((s) => totals[s]?.length).map((s) => ({
    skill: s,
    avg: totals[s]!.reduce((x, y) => x + y, 0) / totals[s]!.length,
  }));
  return avgs.filter((a) => a.avg < 70).sort((a, b) => a.avg - b.avg).slice(0, 2).map((a) => a.skill);
}

function heuristicPlan(candidates: Candidate[], weak: SkillType[], budgetMinutes: number): AiPlan {
  // Giữ trật tự giáo trình (chặng -> bài), nhưng ưu tiên giữ lại các bài thuộc kỹ năng yếu khi phải cắt bớt.
  const ordered = [...candidates].sort((a, b) => a.order - b.order);
  const priority = [...ordered].sort((a, b) => Number(weak.includes(b.skill)) - Number(weak.includes(a.skill)));
  const chosen = new Set<string>();
  let used = 0;
  for (const c of priority) {
    if (used + c.durationMinutes > budgetMinutes && chosen.size >= 5) continue;
    chosen.add(c.id);
    used += c.durationMinutes;
  }
  const items = ordered.filter((c) => chosen.has(c.id)).map((c) => ({
    lesson_id: c.id,
    reason: weak.includes(c.skill) ? 'Củng cố kỹ năng bạn còn yếu' : 'Nằm trong chương trình phù hợp trình độ của bạn',
  }));
  return {
    rationale: weak.length
      ? `Lộ trình bám theo giáo trình, ưu tiên các kỹ năng cần cải thiện: ${weak.join(', ')}.`
      : 'Lộ trình bám theo giáo trình, phù hợp trình độ hiện tại của bạn.',
    focus_skills: weak,
    items,
  };
}

async function aiPlan(
  user: { currentLevel: CEFRLevel; goal: string | null; interests: string; dailyMinutes: number; major: string | null },
  kind: RoadmapKind,
  weak: SkillType[],
  candidates: Candidate[],
  budgetMinutes: number
): Promise<AiPlan> {
  const list = candidates
    .map((c) => `${c.id} | ${c.skill} | ${c.level ?? '?'} | ${c.topic} | ${c.title} | ${c.durationMinutes}p | nguồn: ${c.source}`)
    .join('\n');

  const prompt = `Bạn là điều phối viên học tập tiếng Anh. Hãy xây dựng LỘ TRÌNH HỌC CÁ NHÂN từ kho bài học do giáo viên cung cấp (danh sách bên dưới). CHỈ ĐƯỢC chọn bài có trong danh sách, dùng đúng lesson_id, không tự bịa bài mới.

Học viên:
- Trình độ hiện tại: ${user.currentLevel}
- Loại lộ trình: ${kind === 'initial' ? 'lộ trình đầu tiên' : kind === 'level_up' ? 'học viên vừa lên trình độ mới' : 'học viên chưa đạt bài kiểm tra tổng kết, cần học cải thiện'}
- Kỹ năng yếu cần ưu tiên: ${weak.length ? weak.join(', ') : 'chưa xác định'}
- Mục tiêu: ${user.goal ?? 'chưa rõ'}; ngành: ${user.major ?? 'chưa rõ'}; quan tâm: ${user.interests}
- Thời gian học: ${user.dailyMinutes} phút/ngày, tổng ngân sách khoảng ${budgetMinutes} phút (${ROADMAP_WEEKS} tuần)

Yêu cầu: chọn và SẮP XẾP bài theo thứ tự học hợp lý (dễ đến khó, bài nền tảng trước), cân bằng 5 kỹ năng nhưng tăng tỷ trọng kỹ năng yếu, tổng thời lượng sát ngân sách. Mỗi bài kèm lý do ngắn bằng tiếng Việt.
Sau đó CHIA lộ trình thành 2-4 CHẶNG RIÊNG cho học viên này (phases): mỗi chặng có tên và mục tiêu gắn với nhu cầu của họ (không cần trùng với "chặng" trong kho), liệt kê lesson_ids của chặng theo đúng thứ tự học; mỗi bài thuộc đúng một chặng.

Kho bài học (lesson_id | kỹ năng | level | chủ đề | tiêu đề | thời lượng | chặng):
${list}`;

  return extractStructured<AiPlan>(prompt, [], PLAN_SCHEMA);
}


// Chia các bài thành chặng riêng của học viên. Ưu tiên cách AI chia; nếu AI không chia hợp lệ thì gom theo nhóm nội dung
// trong kho, hoặc chia đều khi toàn bộ bài thuộc cùng một nhóm.
function buildPhases(
  ordered: { lesson_id: string; source: string }[],
  aiPhases: AiPlan['phases']
): { phases: Phase[]; phaseOfLesson: Map<string, number> } {
  const phaseOfLesson = new Map<string, number>();
  let phases: Phase[] = [];

  const valid = (aiPhases ?? []).filter((p) => p.title?.trim() && p.lesson_ids?.some((id) => ordered.some((o) => o.lesson_id === id)));
  if (valid.length >= 1) {
    valid.forEach((p, idx) => {
      phases.push({ title: cleanStageTitle(p.title), description: (p.description ?? '').trim() });
      for (const id of p.lesson_ids) if (!phaseOfLesson.has(id)) phaseOfLesson.set(id, idx + 1);
    });
  }

  if (!phases.length) {
    const titles: string[] = [];
    for (const o of ordered) if (titles[titles.length - 1] !== o.source) titles.push(o.source);
    if (new Set(titles).size >= 2) {
      phases = titles.map((t) => ({ title: t, description: '' }));
      let idx = 0;
      ordered.forEach((o, i) => {
        if (i > 0 && ordered[i - 1].source !== o.source) idx += 1;
        phaseOfLesson.set(o.lesson_id, idx + 1);
      });
    } else {
      const chunks = Math.max(1, Math.min(3, Math.ceil(ordered.length / 5)));
      const size = Math.ceil(ordered.length / chunks);
      phases = Array.from({ length: chunks }, (_, i) => ({ title: `Chặng ${i + 1}`, description: '' }));
      ordered.forEach((o, i) => phaseOfLesson.set(o.lesson_id, Math.floor(i / size) + 1));
    }
  }

  // Bài AI chưa xếp vào chặng nào: theo chặng của bài đứng trước. Rồi ép chặng không giảm dần theo thứ tự học.
  let prev = 1;
  const monotonic = ordered.map((o) => {
    prev = Math.max(prev, phaseOfLesson.get(o.lesson_id) ?? prev);
    return prev;
  });
  const used = [...new Set(monotonic)];
  const remap = new Map(used.map((oldIdx, i) => [oldIdx, i + 1]));
  const finalPhases = used.map((oldIdx) => phases[oldIdx - 1] ?? { title: `Chặng ${remap.get(oldIdx)}`, description: '' });
  const result = new Map<string, number>();
  ordered.forEach((o, i) => result.set(o.lesson_id, remap.get(monotonic[i])!));
  return { phases: finalPhases, phaseOfLesson: result };
}

export interface GenerateOptions {
  kind: RoadmapKind;
  by?: RoadmapAuthor; // 'admin' khi admin bấm tạo lại
  keepCompleted?: boolean; // tạo lại giữa chu kỳ: giữ các bài đã hoàn thành
}

// Tạo lộ trình mới cho học viên (lưu thành UserRoadmap active; lộ trình active cũ được lưu trữ).
export async function generateRoadmap(userId: string, opts: GenerateOptions) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const level = user.currentLevel as CEFRLevel;

  const previous = await prisma.userRoadmap.findFirst({
    where: { userId, status: 'active' },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  const lastCycle = await prisma.userRoadmap.aggregate({ where: { userId }, _max: { cycle: true } });
  const cycle = opts.keepCompleted && previous ? previous.cycle : (lastCycle._max.cycle ?? 0) + 1;

  // Các bài đã đạt ở mọi lộ trình trước đó không cần học lại (trừ khi đang ôn cải thiện).
  const doneRows = await prisma.userRoadmapItem.findMany({
    where: { roadmap: { userId }, status: 'completed' },
    select: { lessonId: true, bestScore: true },
  });
  const kept = opts.keepCompleted && previous ? previous.items.filter((i) => i.status === 'completed') : [];
  const keptIds = new Set(kept.map((i) => i.lessonId));
  const skipIds = new Set(
    doneRows.filter((d) => opts.kind === 'improve' ? (d.bestScore ?? 0) >= 85 : true).map((d) => d.lessonId)
  );
  for (const id of keptIds) skipIds.add(id);

  const lessons = await prisma.lesson.findMany({
    where: { isPublished: true },
    orderBy: { order: 'asc' },
  });

  const target = level;
  let candidates: Candidate[] = lessons
    .filter((l) => !skipIds.has(l.id) && levelDistance(l.level as CEFRLevel | null, target) <= 1)
    .map((l) => ({
      id: l.id, title: l.title, skill: l.skill as SkillType, level: l.level as CEFRLevel | null,
      topic: l.topic, description: l.description, durationMinutes: l.durationMinutes,
      order: l.order, source: l.source,
    }));
  // Kho chưa gắn level hoặc lọc quá chặt -> nới ra toàn kho.
  if (candidates.length < 5) {
    candidates = lessons.filter((l) => !skipIds.has(l.id)).map((l) => ({
      id: l.id, title: l.title, skill: l.skill as SkillType, level: l.level as CEFRLevel | null,
      topic: l.topic, description: l.description, durationMinutes: l.durationMinutes,
      order: l.order, source: l.source,
    }));
  }

  const weak = await findWeakSkills(userId);
  const budgetMinutes = ROADMAP_WEEKS * 5 * Math.max(user.dailyMinutes, 10);

  // Kho rất lớn: chỉ gửi AI phần phù hợp nhất (ưu tiên kỹ năng yếu) để prompt không quá dài.
  let forAi = candidates;
  if (forAi.length > MAX_CANDIDATES_FOR_AI) {
    forAi = [...candidates]
      .sort((a, b) => Number(weak.includes(b.skill)) - Number(weak.includes(a.skill)) || levelDistance(a.level, target) - levelDistance(b.level, target))
      .slice(0, MAX_CANDIDATES_FOR_AI);
  }

  let plan: AiPlan | null = null;
  let author: RoadmapAuthor = opts.by ?? 'ai';
  if (candidates.length > 0) {
    try {
      const raw = await aiPlan(user as never, opts.kind, weak, forAi, budgetMinutes);
      const valid = new Set(forAi.map((c) => c.id));
      const seen = new Set<string>();
      const items = (raw.items ?? []).filter((i) => valid.has(i.lesson_id) && !seen.has(i.lesson_id) && seen.add(i.lesson_id));
      if (items.length >= Math.min(3, forAi.length)) plan = { ...raw, items };
    } catch (err) {
      console.error('AI roadmap generation failed, using heuristic:', err);
    }
    if (!plan) {
      plan = heuristicPlan(candidates, weak, budgetMinutes);
      if (author === 'ai') author = 'heuristic';
    }
  }

  const byId = new Map(candidates.map((c) => [c.id, c]));
  const newItems = (plan?.items ?? []).map((i) => ({ ...i, c: byId.get(i.lesson_id)! }));
  const weekList = weeksFor([...kept.map(() => 0), ...newItems.map((i) => i.c.durationMinutes)], user.dailyMinutes);

  // Chặng riêng của học viên. Khi giữ lại các bài đã học, giữ nguyên các chặng cũ và nối chặng mới phía sau.
  const built = buildPhases(newItems.map((i) => ({ lesson_id: i.lesson_id, source: i.c.source })), plan?.phases);
  let oldPhases: Phase[] = [];
  if (kept.length) {
    try {
      oldPhases = JSON.parse(previous?.phases ?? '[]') as Phase[];
    } catch {
      oldPhases = [];
    }
    if (!oldPhases.length) oldPhases = [{ title: 'Đã hoàn thành trước đó', description: '' }];
  }
  const allPhases = [...oldPhases, ...built.phases];

  const roadmap = await prisma.$transaction(async (tx) => {
    if (previous) {
      await tx.userRoadmap.update({ where: { id: previous.id }, data: { status: 'archived' } });
    }
    return tx.userRoadmap.create({
      data: {
        userId,
        cycle,
        level,
        kind: opts.keepCompleted && previous ? previous.kind : opts.kind,
        generatedBy: author,
        rationale: plan?.rationale ?? 'Chưa có bài học nào được xuất bản trong kho. Quản trị viên cần xuất bản chặng học.',
        focusSkills: JSON.stringify(plan?.focus_skills?.length ? plan.focus_skills : weak),
        phases: JSON.stringify(allPhases),
        items: {
          create: [
            ...kept.map((k, idx) => ({
              lessonId: k.lessonId, order: idx + 1, week: 1, phase: Math.min(k.phase, Math.max(1, oldPhases.length)), reason: k.reason, source: k.source,
              status: 'completed', bestScore: k.bestScore, completedAt: k.completedAt,
            })),
            ...newItems.map((i, idx) => ({
              lessonId: i.lesson_id,
              order: kept.length + idx + 1,
              week: weekList[kept.length + idx],
              phase: oldPhases.length + (built.phaseOfLesson.get(i.lesson_id) ?? 1),
              reason: i.reason,
              source: author === 'admin' ? 'admin' : 'ai',
              status: 'pending',
            })),
          ],
        },
      },
    });
  });

  // Chuyển lịch sử làm bài của các bài giữ lại sang item mới để không mất kết quả.
  if (kept.length) {
    const fresh = await prisma.userRoadmapItem.findMany({ where: { roadmapId: roadmap.id } });
    for (const k of kept) {
      const f = fresh.find((x) => x.lessonId === k.lessonId);
      if (f) await prisma.lessonAttempt.updateMany({ where: { itemId: k.id }, data: { itemId: f.id } });
    }
  }
  return roadmap;
}

// Lấy lộ trình đang học; nếu học viên chưa có (user cũ / chưa tạo) thì tạo ngay.
export async function ensureActiveRoadmap(userId: string) {
  const existing = await prisma.userRoadmap.findFirst({
    where: { userId, status: 'active' },
    include: { items: { select: { status: true } } },
  });
  if (!existing) return generateRoadmap(userId, { kind: 'initial' });

  // Bài trong lộ trình bị xóa khỏi kho (cascade) có thể khiến lộ trình trống: tạo lại từ kho hiện tại.
  const coreCount = existing.items.filter((i) => i.status !== 'suggested' && i.status !== 'dismissed').length;
  if (coreCount === 0) {
    const catalog = await prisma.lesson.count({ where: { isPublished: true } });
    if (catalog > 0) {
      return generateRoadmap(userId, { kind: (existing.kind as RoadmapKind) ?? 'initial' });
    }
  }
  return existing;
}

// Mở trạng thái "đã học hết" của lộ trình: mọi bài chính thức (không tính đề xuất / đã bỏ qua) đều hoàn thành.
export function isRoadmapDone(items: { status: string }[]) {
  const core = items.filter((i) => i.status !== 'suggested' && i.status !== 'dismissed');
  return core.length > 0 && core.every((i) => i.status === 'completed');
}

// Khi admin xuất bản bài mới, đề xuất cho học viên đang học (KHÔNG tự chèn vào lộ trình chính).
export async function suggestLessonsToLearners(lessonIds: string[]) {
  const lessons = await prisma.lesson.findMany({ where: { id: { in: lessonIds }, isPublished: true } });
  if (!lessons.length) return 0;

  const roadmaps = await prisma.userRoadmap.findMany({
    where: { status: 'active' },
    include: { items: { select: { lessonId: true, order: true } }, user: { select: { currentLevel: true } } },
  });

  // Bài học viên đã hoàn thành ở bất kỳ lộ trình nào thì không đề xuất lại.
  const doneRows = await prisma.userRoadmapItem.findMany({
    where: { status: 'completed', roadmap: { userId: { in: roadmaps.map((r) => r.userId) } } },
    select: { lessonId: true, roadmap: { select: { userId: true } } },
  });
  const doneByUser = new Map<string, Set<string>>();
  for (const d of doneRows) {
    const set = doneByUser.get(d.roadmap.userId) ?? new Set<string>();
    set.add(d.lessonId);
    doneByUser.set(d.roadmap.userId, set);
  }

  let created = 0;
  for (const rm of roadmaps) {
    const have = new Set([...rm.items.map((i) => i.lessonId), ...(doneByUser.get(rm.userId) ?? [])]);
    let order = rm.items.reduce((m, i) => Math.max(m, i.order), 0);
    const fits = lessons.filter(
      (l) => !have.has(l.id) && levelDistance(l.level as CEFRLevel | null, rm.user.currentLevel as CEFRLevel) <= 1
    );
    if (!fits.length) continue;
    await prisma.userRoadmapItem.createMany({
      data: fits.map((l) => ({
        roadmapId: rm.id, lessonId: l.id, order: ++order, week: ROADMAP_WEEKS, phase: lastPhaseOf(rm.phases),
        reason: 'Bài học mới vừa được thêm vào kho, phù hợp trình độ của bạn', source: 'suggested', status: 'suggested',
      })),
    });
    created += fits.length;
  }
  return created;
}

// Trạng thái của một bài học trong lộ trình đang học của học viên (kèm bài kế tiếp).
export async function getLessonContext(userId: string, lessonId: string) {
  const roadmap = await ensureActiveRoadmap(userId);
  const items = await prisma.userRoadmapItem.findMany({ where: { roadmapId: roadmap.id }, orderBy: { order: 'asc' } });
  const core = items.filter((i) => i.status !== 'suggested' && i.status !== 'dismissed');
  const item = items.find((i) => i.lessonId === lessonId) ?? null;
  if (!item) return { roadmap, item: null, locked: false, nextItem: null as (typeof items)[number] | null, items };

  const idx = core.findIndex((i) => i.id === item.id);
  const locked = idx > 0 && core.slice(0, idx).some((i) => i.status !== 'completed') && item.status !== 'completed';
  const nextItem = idx >= 0 ? core.slice(idx + 1).find((i) => i.status !== 'completed') ?? null : null;
  return { roadmap, item, locked, nextItem, items };
}
