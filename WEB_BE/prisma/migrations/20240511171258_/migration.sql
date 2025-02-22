/*
  Warnings:

  - You are about to drop the `CourseInformation` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "requirements" TEXT,
ADD COLUMN     "whatWillLearn" TEXT,
ADD COLUMN     "whoThisCourseFor" TEXT;

-- DropTable
DROP TABLE "CourseInformation";
