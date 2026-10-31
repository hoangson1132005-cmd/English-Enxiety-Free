-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('student', 'admin');

-- CreateEnum
CREATE TYPE "FacultyGroup" AS ENUM ('language', 'engineering', 'other');

-- CreateEnum
CREATE TYPE "CEFRLevel" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1');

-- CreateEnum
CREATE TYPE "SkillType" AS ENUM ('listening', 'reading', 'writing', 'speaking', 'vocabulary');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('multiple_choice', 'fill_blank', 'true_false', 'matching', 'essay', 'speaking');

-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('locked', 'available', 'in_progress', 'completed');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'student',
    "fullName" TEXT NOT NULL,
    "studentId" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "placementCompleted" BOOLEAN NOT NULL DEFAULT false,
    "employmentStatus" TEXT NOT NULL DEFAULT 'student',
    "facultyGroup" "FacultyGroup" NOT NULL DEFAULT 'engineering',
    "major" TEXT,
    "studyYear" INTEGER NOT NULL DEFAULT 1,
    "researchConsent" BOOLEAN NOT NULL DEFAULT false,
    "goal" TEXT,
    "interests" TEXT NOT NULL DEFAULT '[]',
    "dailyMinutes" INTEGER NOT NULL DEFAULT 20,
    "selfAssessedLevel" "CEFRLevel" NOT NULL DEFAULT 'A1',
    "currentLevel" "CEFRLevel" NOT NULL DEFAULT 'A1',
    "streak" INTEGER NOT NULL DEFAULT 0,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "notificationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "darkMode" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Test" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdVia" TEXT NOT NULL DEFAULT 'manual',
    "sourceFileName" TEXT,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestSection" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "skill" "SkillType" NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "timeLimitMinutes" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TestSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "skill" "SkillType" NOT NULL,
    "topic" TEXT NOT NULL,
    "level" "CEFRLevel" NOT NULL,
    "type" "QuestionType" NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT,
    "answer" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "audioUrl" TEXT,
    "passage" TEXT,
    "testSectionId" TEXT,
    "lessonId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stage" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "focusSkills" TEXT NOT NULL,
    "weeks" TEXT NOT NULL,
    "hasMidterm" BOOLEAN NOT NULL DEFAULT false,
    "hasFinal" BOOLEAN NOT NULL DEFAULT false,
    "whyThisStage" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "skill" "SkillType" NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "xpReward" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLessonProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" "LessonStatus" NOT NULL DEFAULT 'locked',
    "score" INTEGER,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "UserLessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabSet" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleVi" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VocabSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabCard" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "pronunciation" TEXT,
    "definition" TEXT NOT NULL,
    "definitionVi" TEXT,
    "example" TEXT,
    "exampleVi" TEXT,
    "topic" TEXT,
    "level" "CEFRLevel",
    "audioUrl" TEXT,

    CONSTRAINT "VocabCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserVocabProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "lastReviewed" TIMESTAMP(3),
    "nextReview" TIMESTAMP(3),
    "difficulty" TEXT,
    "mastered" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserVocabProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scores" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "cefrLevel" "CEFRLevel" NOT NULL,
    "toeicEquivalent" INTEGER NOT NULL,
    "ieltsEquivalent" DOUBLE PRECISION NOT NULL,
    "strengths" TEXT NOT NULL,
    "weaknesses" TEXT NOT NULL,
    "aiFeedback" TEXT NOT NULL,
    "timeSpentSeconds" INTEGER NOT NULL,
    "facultyGroup" "FacultyGroup" NOT NULL,

    CONSTRAINT "TestResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "minutesStudied" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "vocabReviewed" INTEGER NOT NULL DEFAULT 0,
    "skills" TEXT NOT NULL DEFAULT '{}',

    CONSTRAINT "DailyProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteContent" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "heroBadgeText" TEXT NOT NULL,
    "heroTitleHighlight" TEXT NOT NULL,
    "heroSubtitle" TEXT NOT NULL,
    "whyChooseTitle" TEXT NOT NULL,
    "whyChooseBullet1" TEXT NOT NULL,
    "whyChooseBullet2" TEXT NOT NULL,
    "whyChooseBullet3" TEXT NOT NULL,
    "footerTagline" TEXT NOT NULL,
    "logoImageBase64" TEXT,
    "logoMimeType" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLessonProgress_userId_lessonId_key" ON "UserLessonProgress"("userId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "UserVocabProgress_userId_cardId_key" ON "UserVocabProgress"("userId", "cardId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyProgress_userId_date_key" ON "DailyProgress"("userId", "date");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSection" ADD CONSTRAINT "TestSection_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_testSectionId_fkey" FOREIGN KEY ("testSectionId") REFERENCES "TestSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLessonProgress" ADD CONSTRAINT "UserLessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLessonProgress" ADD CONSTRAINT "UserLessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabSet" ADD CONSTRAINT "VocabSet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabCard" ADD CONSTRAINT "VocabCard_setId_fkey" FOREIGN KEY ("setId") REFERENCES "VocabSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVocabProgress" ADD CONSTRAINT "UserVocabProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVocabProgress" ADD CONSTRAINT "UserVocabProgress_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "VocabCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestResult" ADD CONSTRAINT "TestResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestResult" ADD CONSTRAINT "TestResult_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyProgress" ADD CONSTRAINT "DailyProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

