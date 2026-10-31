-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "correctCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "inBank" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'manual',
ADD COLUMN     "usedCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TestResult" ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'placement',
ADD COLUMN     "sessionId" TEXT,
ALTER COLUMN "testId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserRoadmap" ADD COLUMN     "phases" TEXT NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "UserRoadmapItem" ADD COLUMN     "phase" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "QuizSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "lessonId" TEXT,
    "roadmapId" TEXT,
    "phase" INTEGER,
    "questionIds" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "QuizSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionSeen" (
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionSeen_pkey" PRIMARY KEY ("userId","questionId")
);

-- CreateIndex
CREATE INDEX "QuizSession_userId_kind_status_idx" ON "QuizSession"("userId", "kind", "status");

-- CreateIndex
CREATE INDEX "Question_inBank_skill_level_idx" ON "Question"("inBank", "skill", "level");

-- AddForeignKey
ALTER TABLE "QuizSession" ADD CONSTRAINT "QuizSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
