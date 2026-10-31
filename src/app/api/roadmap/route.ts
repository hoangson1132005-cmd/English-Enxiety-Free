import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { LessonStatus, StageStatus } from '@/types';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [user, stages, progressRows] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }),
    prisma.stage.findMany({
      where: { isPublished: true },
      orderBy: { order: 'asc' },
      include: { lessons: { orderBy: { order: 'asc' } } },
    }),
    prisma.userLessonProgress.findMany({ where: { userId: session.user.id } }),
  ]);

  const progressByLessonId = new Map(progressRows.map((p) => [p.lessonId, p]));

  let previousCompleted = true; // unlocks the very first lesson of the whole roadmap
  const stagesOut = stages.map((stage) => {
    let anyUnlocked = false;
    let allCompleted = true;

    const lessonsOut = stage.lessons.map((lesson) => {
      const prog = progressByLessonId.get(lesson.id);
      const status: LessonStatus = prog ? prog.status : previousCompleted ? 'available' : 'locked';
      previousCompleted = status === 'completed';
      if (status !== 'locked') anyUnlocked = true;
      if (status !== 'completed') allCompleted = false;

      return {
        id: lesson.id,
        stage_id: lesson.stageId,
        order: lesson.order,
        title: lesson.title,
        skill: lesson.skill,
        duration_minutes: lesson.durationMinutes,
        status,
        xp_reward: lesson.xpReward,
        description: lesson.description,
        topic: lesson.topic,
      };
    });

    const stageStatus: StageStatus = allCompleted ? 'completed' : anyUnlocked ? 'in_progress' : 'locked';

    return {
      id: stage.id,
      order: stage.order,
      title: stage.title,
      description: stage.description,
      focus_skills: JSON.parse(stage.focusSkills),
      weeks: JSON.parse(stage.weeks),
      lessons: lessonsOut,
      status: stageStatus,
      has_midterm: stage.hasMidterm,
      has_final: stage.hasFinal,
      why_this_stage: stage.whyThisStage ?? undefined,
    };
  });

  const allWeeks = stages.flatMap((s) => JSON.parse(s.weeks) as number[]);
  const totalWeeks = allWeeks.length ? Math.max(...allWeeks) : 0;

  return NextResponse.json({
    id: 'roadmap_' + user.id,
    user_id: user.id,
    cefr_level: user.currentLevel,
    total_weeks: totalWeeks,
    created_at: user.createdAt.toISOString(),
    stages: stagesOut,
  });
}
