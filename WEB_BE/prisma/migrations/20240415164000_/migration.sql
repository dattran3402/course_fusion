/*
  Warnings:

  - The primary key for the `CourseInformation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `part` on the `CourseInformation` table. All the data in the column will be lost.
  - Added the required column `partId` to the `CourseInformation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CourseInformation" DROP CONSTRAINT "CourseInformation_pkey",
DROP COLUMN "part",
ADD COLUMN     "partId" TEXT NOT NULL,
ADD CONSTRAINT "CourseInformation_pkey" PRIMARY KEY ("courseId", "partId");
