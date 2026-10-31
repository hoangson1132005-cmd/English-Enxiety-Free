import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { computeItemLocks, ensureActiveRoadmap, isRoadmapDone } from '@/lib/roadmap';
import { getPassScore } from '@/lib/quizSettings';
import type { Phase } from '@/lib/roadmap';
import type { RoadmapItemView, RoadmapStageView, SkillType } from '@/types';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const active = await ensureActiveRoadmap(userId);
  const [roadmap, user, pastRoadmaps] = await Promise.all([
    prisma.userRoadmap.findUniqueOrThrow({
      where: { id: active.id },
      include: { items: { orderBy: { order: 'asc' }, include: { lesson: true } } },
    }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.userRoadmap.findMany({ where: { userId, status: 'completed' }, orderBy: { cycle: 'asc' } }),
  ]);

  const core = roadmap.items.filter((i) => i.status !== 'suggested' && i.status !== 'dismissed');
  let nextItemId: string | null = null;
  const locks = computeItemLocks(core); // bài đầu tiên chưa xong là bài đang mở; bài giáo viên giao riêng luôn mở

  const toView = (i: (typeof roadmap.items)[number], status: RoadmapItemView['status']): RoadmapItemView => ({
    item_id: i.id,
    lesson_id: i.lessonId,
    title: i.lesson.title,
    skill: i.lesson.skill as SkillType,
    duration_minutes: i.lesson.durationMinutes,
    xp_reward: i.lesson.xpReward,
    description: i.lesson.description,
    topic: i.lesson.topic,
    week: i.week,
    reason: i.reason,
    status,
    best_score: i.bestScore,
    source: i.source as RoadmapItemView['source'],
  });

  let phases: Phase[] = [];
  try {
    phases = JSON.parse(roadmap.phases) as Phase[];
  } catch {
    phases = [];
  }
  const legacy = phases.length === 0; // lộ trình cũ chưa có chặng riêng: nhóm theo nhóm nội dung trong kho

  // Điểm kiểm tra cuối chặng đã làm (mỗi chặng lấy điểm cao nhất)
  const stageSessions = await prisma.quizSession.findMany({
    where: { userId, roadmapId: roadmap.id, kind: 'stage', status: 'submitted' },
    select: { id: true, phase: true },
  });
  const stageResults = stageSessions.length
    ? await prisma.testResult.findMany({ where: { sessionId: { in: stageSessions.map((s) => s.id) } }, select: { sessionId: true, totalScore: true } })
    : [];
  const quizScoreByPhase = new Map<number, number>();
  for (const r of stageResults) {
    const phase = stageSessions.find((s) => s.id === r.sessionId)?.phase;
    if (phase != null) quizScoreByPhase.set(phase, Math.max(quizScoreByPhase.get(phase) ?? 0, r.totalScore));
  }

  const stages: RoadmapStageView[] = [];
  const groups = new Map<string, RoadmapStageView>();
  for (const i of core) {
    let status: RoadmapItemView['status'];
    if (i.status === 'completed') status = 'completed';
    else if (!locks.get(i.id)) {
      status = i.status === 'in_progress' ? 'in_progress' : 'available';
      nextItemId ??= i.id;
    } else status = 'locked';

    const key = legacy ? `src:${i.lesson.source}` : `phase:${i.phase}`;
    let group = groups.get(key);
    if (!group) {
      group = {
        stage_id: key,
        phase: legacy ? null : i.phase,
        title: legacy ? i.lesson.source || 'Bài học' : phases[i.phase - 1]?.title ?? `Chặng ${i.phase}`,
        description: legacy ? '' : phases[i.phase - 1]?.description ?? '',
        items: [],
        quiz: null,
      };
      groups.set(key, group);
      stages.push(group);
    }
    group.items.push(toView(i, status));
  }
  if (!legacy) stages.sort((a, b) => (a.phase ?? 0) - (b.phase ?? 0));
  for (const g of stages) {
    if (g.phase == null) continue;
    const done = quizScoreByPhase.get(g.phase);
    const allDone = g.items.every((x) => x.status === 'completed');
    g.quiz = done != null ? { state: 'done', score: done } : { state: allDone ? 'available' : 'locked', score: null };
  }

  const done = core.filter((i) => i.status === 'completed');
  const scores = done.map((i) => i.bestScore).filter((s): s is number => s != null);
  const history = await Promise.all(
    pastRoadmaps.map(async (r) => {
      const exam = await prisma.testResult.findFirst({ where: { roadmapId: r.id }, orderBy: { completedAt: 'desc' } });
      return {
        id: r.id, cycle: r.cycle, kind: r.kind, level: r.level,
        outcome: exam?.outcome ?? null, exam_score: exam?.totalScore ?? null,
        completed_at: r.completedAt?.toISOString() ?? null,
      };
    })
  );

  return NextResponse.json({
    roadmap: {
      id: roadmap.id,
      cycle: roadmap.cycle,
      level: roadmap.level,
      kind: roadmap.kind,
      generated_by: roadmap.generatedBy,
      rationale: roadmap.rationale,
      focus_skills: JSON.parse(roadmap.focusSkills),
      created_at: roadmap.createdAt.toISOString(),
    },
    user_level: user.currentLevel,
    progress: {
      done: done.length,
      total: core.length,
      percent: core.length ? Math.round((done.length / core.length) * 100) : 0,
      avg_score: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
      total_minutes: core.reduce((s, i) => s + i.lesson.durationMinutes, 0),
    },
    stages,
    suggestions: roadmap.items.filter((i) => i.status === 'suggested').map((i) => toView(i, 'available')),
    next_item_id: nextItemId,
    pass_score: await getPassScore(),
    all_done: isRoadmapDone(roadmap.items),
    history,
  });
}
