/*
  Warnings:

  - Added the required column `isPublish` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "isPublish" BOOLEAN NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;
