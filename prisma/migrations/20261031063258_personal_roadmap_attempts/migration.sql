-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "level" "CEFRLevel",
ADD COLUMN     "vocabItems" TEXT NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "Test" ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'placement',
ADD COLUMN     "roadmapId" TEXT,
ADD COLUMN     "targetLevel" "CEFRLevel";

-- AlterTable
ALTER TABLE "TestResult" ADD COLUMN     "outcome" TEXT,
ADD COLUMN     "roadmapId" TEXT;

-- CreateTable
CREATE TABLE "UserRoadmap" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cycle" INTEGER NOT NULL DEFAULT 1,
    "level" "CEFRLevel" NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'initial',
    "status" TEXT NOT NULL DEFAULT 'active',
    "generatedBy" TEXT NOT NULL DEFAULT 'ai',
    "rationale" TEXT NOT NULL DEFAULT '',
    "focusSkills" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "UserRoadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRoadmapItem" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "week" INTEGER NOT NULL DEFAULT 1,
    "reason" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT 'ai',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "bestScore" INTEGER,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "UserRoadmapItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "itemId" TEXT,
    "score" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "answers" TEXT NOT NULL,
    "results" TEXT NOT NULL,
    "reviewSummary" TEXT NOT NULL DEFAULT '',
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserRoadmap_userId_status_idx" ON "UserRoadmap"("userId", "status");

-- CreateIndex
CREATE INDEX "UserRoadmapItem_roadmapId_order_idx" ON "UserRoadmapItem"("roadmapId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoadmapItem_roadmapId_lessonId_key" ON "UserRoadmapItem"("roadmapId", "lessonId");

-- CreateIndex
CREATE INDEX "LessonAttempt_userId_lessonId_idx" ON "LessonAttempt"("userId", "lessonId");

-- AddForeignKey
ALTER TABLE "UserRoadmap" ADD CONSTRAINT "UserRoadmap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoadmapItem" ADD CONSTRAINT "UserRoadmapItem_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "UserRoadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoadmapItem" ADD CONSTRAINT "UserRoadmapItem_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonAttempt" ADD CONSTRAINT "LessonAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonAttempt" ADD CONSTRAINT "LessonAttempt_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonAttempt" ADD CONSTRAINT "LessonAttempt_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "UserRoadmapItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
