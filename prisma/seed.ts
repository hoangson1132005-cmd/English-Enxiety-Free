import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { mockAdminUsers } from '../src/lib/mock/admin';
import { mockRoadmap } from '../src/lib/mock/roadmap';
import { mockPlacementTest } from '../src/lib/mock/placement';
import { mockVocabSets } from '../src/lib/mock/vocab';
import { DEFAULT_SITE_CONTENT } from '../src/lib/siteContentDefaults';
import { LESSON_CONTENT } from './seedLessonContent';
import questionsJson from '../src/lib/mock/questions.json';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // --- Admin account ---
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@soonolingo.local' },
    update: {},
    create: {
      email: 'admin@soonolingo.local',
      passwordHash: adminPasswordHash,
      role: 'admin',
      fullName: 'Soonolingo Admin',
      studentId: 'ADMIN-001',
      facultyGroup: 'other',
      interests: '[]',
    },
  });

  // --- Student accounts from mock admin users ---
  const demoPasswordHash = await bcrypt.hash('demo1234', 10);
  for (const u of mockAdminUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        passwordHash: demoPasswordHash,
        role: 'student',
        fullName: u.full_name,
        studentId: u.student_id,
        facultyGroup: u.faculty_group,
        major: u.major,
        studyYear: u.study_year,
        currentLevel: u.current_level,
        selfAssessedLevel: u.current_level,
        streak: u.streak,
        totalXp: u.total_xp,
        placementCompleted: u.placement_completed,
        onboardingCompleted: true,
        status: u.status,
        interests: '[]',
        createdAt: new Date(u.created_at),
        lastActiveAt: new Date(u.last_active),
      },
    });
  }

  // --- Clear previously-seeded content so this script is safely re-runnable
  // (e.g. after pinning explicit ids) without touching User/SiteContent rows.
  await prisma.userVocabProgress.deleteMany();
  await prisma.vocabCard.deleteMany();
  await prisma.vocabSet.deleteMany();
  await prisma.userLessonProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.stage.deleteMany();
  await prisma.testResult.deleteMany();
  await prisma.question.deleteMany();
  await prisma.testSection.deleteMany();
  await prisma.test.deleteMany();

  // --- Roadmap: stages + lessons ---
  // Ids are pinned to match the mock constants (lesson_1_2, stage_2, ...) so the
  // still-mock-driven UI (learn/* pages) and the real DB agree on the same row.
  for (const stage of mockRoadmap.stages) {
    const createdStage = await prisma.stage.create({
      data: {
        id: stage.id,
        order: stage.order,
        title: stage.title,
        description: stage.description,
        focusSkills: JSON.stringify(stage.focus_skills),
        weeks: JSON.stringify(stage.weeks),
        hasMidterm: !!stage.has_midterm,
        hasFinal: !!stage.has_final,
        whyThisStage: stage.why_this_stage,
      },
    });

    for (const lesson of stage.lessons) {
      const seedContent = LESSON_CONTENT[lesson.id];
      const createdLesson = await prisma.lesson.create({
        data: {
          id: lesson.id,
          stageId: createdStage.id,
          order: lesson.order,
          title: lesson.title,
          skill: lesson.skill,
          durationMinutes: lesson.duration_minutes,
          xpReward: lesson.xp_reward,
          description: lesson.description,
          topic: lesson.topic,
          content: seedContent?.content ?? '',
        },
      });

      for (const q of seedContent?.questions ?? []) {
        await prisma.question.create({
          data: {
            lessonId: createdLesson.id,
            skill: q.skill,
            topic: q.topic,
            level: q.level,
            type: q.type,
            question: q.question,
            options: q.options ? JSON.stringify(q.options) : null,
            passage: q.passage,
            answer: JSON.stringify(q.answer),
            explanation: q.explanation,
          },
        });
      }
    }
  }

  // --- Placement test: test + sections + questions (ids pinned, same reason) ---
  const test = await prisma.test.create({
    data: {
      id: mockPlacementTest.id,
      title: mockPlacementTest.title,
      description: mockPlacementTest.description,
      durationMinutes: mockPlacementTest.duration_minutes,
      isActive: true,
      createdVia: 'manual',
    },
  });

  let sectionOrder = 0;
  for (const section of mockPlacementTest.sections) {
    const createdSection = await prisma.testSection.create({
      data: {
        id: section.id,
        testId: test.id,
        skill: section.skill,
        title: section.title,
        instructions: section.instructions,
        timeLimitMinutes: section.time_limit_minutes,
        order: sectionOrder++,
      },
    });

    for (const q of section.questions) {
      await prisma.question.create({
        data: {
          id: q.id,
          testSectionId: createdSection.id,
          skill: q.skill,
          topic: q.topic,
          level: q.level,
          type: q.type,
          question: q.question,
          options: q.options ? JSON.stringify(q.options) : null,
          answer: JSON.stringify(q.answer),
          explanation: q.explanation,
          audioUrl: q.audio_url,
          passage: q.passage,
        },
      });
    }
  }

  // --- Standalone question bank ---
  for (const q of questionsJson.questions) {
    await prisma.question.create({
      data: {
        id: q.id,
        skill: q.skill as never,
        topic: q.topic,
        level: q.level as never,
        type: q.type as never,
        question: q.question,
        options: q.options ? JSON.stringify(q.options) : null,
        answer: JSON.stringify(q.answer),
        explanation: q.explanation,
      },
    });
  }

  // --- Vocabulary sets + cards ---
  for (const set of mockVocabSets) {
    const createdSet = await prisma.vocabSet.create({
      data: {
        id: set.id,
        title: set.title,
        titleVi: set.title_vi,
        topic: set.topic,
        description: set.description,
        icon: set.icon,
      },
    });

    for (const card of set.cards) {
      await prisma.vocabCard.create({
        data: {
          id: card.id,
          setId: createdSet.id,
          term: card.term,
          pronunciation: card.pronunciation,
          definition: card.definition,
          definitionVi: card.definition_vi,
          example: card.example,
          exampleVi: card.example_vi,
          topic: card.topic,
          level: card.level,
        },
      });
    }
  }

  // --- Landing page content (uses the real logo.jpg sitting at the project root, if present) ---
  const logoPath = path.join(__dirname, '..', 'logo.jpg');
  const logoFields = fs.existsSync(logoPath)
    ? { logoImageBase64: fs.readFileSync(logoPath).toString('base64'), logoMimeType: 'image/jpeg' }
    : {};

  await prisma.siteContent.upsert({
    where: { id: 'main' },
    update: {},
    create: { id: 'main', ...DEFAULT_SITE_CONTENT, ...logoFields },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
