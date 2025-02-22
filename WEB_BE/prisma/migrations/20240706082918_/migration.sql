/*
  Warnings:

  - You are about to alter the column `totalReview` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `totalReviewStar` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "totalReview" SET DEFAULT 0,
ALTER COLUMN "totalReview" SET DATA TYPE INTEGER,
ALTER COLUMN "totalReviewStar" SET DATA TYPE INTEGER;
