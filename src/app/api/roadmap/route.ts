import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensureActiveRoadmap, isRoadmapDone } from '@/lib/roadmap';
import type { RoadmapItemView, RoadmapStageView, SkillType } from '@/types';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const active = await ensureActiveRoadmap(userId);
  const [roadmap, user, pastRoadmaps] = await Promise.all([
    prisma.userRoadmap.findUniqueOrThrow({
      where: { id: active.id },
      include: { items: { orderBy: { order: 'asc' }, include: { lesson: { include: { stage: true } } } } },
    }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.userRoadmap.findMany({ where: { userId, status: 'completed' }, orderBy: { cycle: 'asc' } }),
  ]);

  const core = roadmap.items.filter((i) => i.status !== 'suggested' && i.status !== 'dismissed');
  let nextItemId: string | null = null;
  let unlocked = true; // bài đầu tiên chưa xong là bài đang mở; các bài sau bị khóa cho đến khi xong bài trước

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

  const stages: RoadmapStageView[] = [];
  for (const i of core) {
    let status: RoadmapItemView['status'];
    if (i.status === 'completed') status = 'completed';
    else if (unlocked) {
      status = i.status === 'in_progress' ? 'in_progress' : 'available';
      nextItemId ??= i.id;
      unlocked = false;
    } else status = 'locked';

    let group = stages[stages.length - 1];
    if (!group || group.stage_id !== i.lesson.stageId) {
      group = { stage_id: i.lesson.stageId, title: i.lesson.stage.title, items: [] };
      stages.push(group);
    }
    group.items.push(toView(i, status));
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
    all_done: isRoadmapDone(roadmap.items),
    history,
  });
}
