-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "quizMode" TEXT NOT NULL DEFAULT 'auto',
ADD COLUMN     "quizSize" INTEGER;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "QuizSettings" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "lessonSize" INTEGER NOT NULL DEFAULT 8,
    "lessonSizeFreeText" INTEGER NOT NULL DEFAULT 5,
    "stageSize" INTEGER NOT NULL DEFAULT 18,
    "finalSize" INTEGER NOT NULL DEFAULT 30,
    "passScore" INTEGER NOT NULL DEFAULT 70,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizSettings_pkey" PRIMARY KEY ("id")
);
