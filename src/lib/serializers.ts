import type { User as PrismaUser } from '@prisma/client';
import type { Profile, AdminUser } from '@/types';

export function toProfileDTO(user: PrismaUser): Profile {
  return {
    id: user.id,
    full_name: user.fullName,
    student_id: user.studentId ?? '',
    email: user.email,
    avatar_url: user.avatarUrl ?? undefined,
    created_at: user.createdAt.toISOString(),
    onboarding_completed: user.onboardingCompleted,
    placement_completed: user.placementCompleted,
    employment_status: user.employmentStatus as Profile['employment_status'],
    faculty_group: user.facultyGroup,
    major: user.major ?? '',
    study_year: user.studyYear as 1 | 2 | 3,
    research_consent: user.researchConsent,
    goal: (user.goal ?? 'work') as Profile['goal'],
    interests: JSON.parse(user.interests) as Profile['interests'],
    daily_minutes: user.dailyMinutes as Profile['daily_minutes'],
    self_assessed_level: user.selfAssessedLevel,
    current_level: user.currentLevel,
    streak: user.streak,
    total_xp: user.totalXp,
    notification_enabled: user.notificationEnabled,
    dark_mode: user.darkMode,
  };
}

interface TestWithSections {
  id: string; title: string; description: string; durationMinutes: number;
  isActive: boolean; createdAt: Date; createdVia: string; sourceFileName: string | null; kind: string; targetLevel: string | null;
  sections: {
    id: string; skill: string; title: string; instructions: string; timeLimitMinutes: number | null; order: number;
    questions: { id: string; question: string; skill: string; topic: string; level: string; type: string; options: string | null; answer: string; explanation: string; passage: string | null; audioUrl: string | null }[];
  }[];
}

export function serializeTest(test: TestWithSections) {
  return {
    id: test.id,
    title: test.title,
    description: test.description,
    duration_minutes: test.durationMinutes,
    is_active: test.isActive,
    created_at: test.createdAt.toISOString(),
    created_via: test.createdVia,
    kind: test.kind,
    target_level: test.targetLevel ?? undefined,
    source_file_name: test.sourceFileName ?? undefined,
    question_count: test.sections.reduce((sum, s) => sum + s.questions.length, 0),
    sections: test.sections
      .sort((a, b) => a.order - b.order)
      .map((s) => ({
        id: s.id,
        skill: s.skill,
        title: s.title,
        instructions: s.instructions,
        time_limit_minutes: s.timeLimitMinutes ?? undefined,
        questions: s.questions.map((q) => ({
          id: q.id,
          question: q.question,
          skill: q.skill,
          topic: q.topic,
          level: q.level,
          type: q.type,
          options: q.options ? JSON.parse(q.options) : undefined,
          answer: JSON.parse(q.answer),
          explanation: q.explanation,
          passage: q.passage ?? undefined,
          audio_url: q.audioUrl ?? undefined,
        })),
      })),
  };
}

export function toAdminUserDTO(user: PrismaUser): AdminUser {
  return {
    id: user.id,
    full_name: user.fullName,
    student_id: user.studentId ?? '',
    email: user.email,
    faculty_group: user.facultyGroup,
    major: user.major ?? '',
    study_year: user.studyYear as 1 | 2 | 3 | 4 | 5,
    interests: JSON.parse(user.interests) as AdminUser['interests'],
    current_level: user.currentLevel,
    streak: user.streak,
    total_xp: user.totalXp,
    placement_completed: user.placementCompleted,
    status: user.status as 'active' | 'disabled',
    created_at: user.createdAt.toISOString(),
    last_active: user.lastActiveAt.toISOString(),
  };
}
