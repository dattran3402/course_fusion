/*
  Warnings:

  - You are about to drop the column `currentSectionId` on the `CourseStudent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CourseStudent" DROP COLUMN "currentSectionId",
ADD COLUMN     "progress" JSONB;
