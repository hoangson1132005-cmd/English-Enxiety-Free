-- Bỏ khái niệm "học phần/chặng" dùng chung: trạng thái xuất bản nằm trên từng bài, chặng chỉ còn là chặng riêng của học viên.
-- Giữ nguyên dữ liệu: bài thừa hưởng trạng thái xuất bản và tên nhóm cũ, thứ tự toàn cục = thứ tự chặng * 1000 + thứ tự bài.
ALTER TABLE "Lesson" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Lesson" ADD COLUMN "source" TEXT NOT NULL DEFAULT '';

UPDATE "Lesson" l
SET "isPublished" = s."isPublished",
    "source" = s."title",
    "order" = s."order" * 1000 + l."order"
FROM "Stage" s
WHERE l."stageId" = s."id";

ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_stageId_fkey";
ALTER TABLE "Lesson" DROP COLUMN "stageId";
DROP TABLE "Stage";
