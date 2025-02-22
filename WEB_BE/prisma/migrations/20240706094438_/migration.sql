/*
  Warnings:

  - You are about to drop the column `progresPercent` on the `SectionStudent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SectionStudent" DROP COLUMN "progresPercent",
ADD COLUMN     "progressPercent" INTEGER NOT NULL DEFAULT 0;
