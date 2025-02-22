/*
  Warnings:

  - You are about to drop the `CourseReview` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "CourseStudent" ADD COLUMN     "reviewContent" TEXT,
ADD COLUMN     "reviewStar" INTEGER;

-- DropTable
DROP TABLE "CourseReview";
