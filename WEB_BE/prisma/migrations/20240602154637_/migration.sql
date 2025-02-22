/*
  Warnings:

  - Made the column `id` on table `CourseStudent` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CourseStudent" ALTER COLUMN "id" SET NOT NULL;
