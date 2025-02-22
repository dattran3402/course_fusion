/*
  Warnings:

  - You are about to drop the column `currentSectionid` on the `CourseStudent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CourseStudent" DROP COLUMN "currentSectionid",
ADD COLUMN     "currentSectionId" TEXT;
