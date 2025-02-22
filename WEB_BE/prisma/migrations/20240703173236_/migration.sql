-- AlterTable
ALTER TABLE "QuizConfiguration" ADD COLUMN     "percentToPass" INTEGER DEFAULT 0,
ADD COLUMN     "questionIds" JSONB;

-- AlterTable
ALTER TABLE "QuizQuestion" ADD COLUMN     "sectionId" TEXT;

-- AlterTable
ALTER TABLE "QuizStudent" ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "startTime" TIMESTAMP(3);
