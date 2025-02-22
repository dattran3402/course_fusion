/*
  Warnings:

  - You are about to drop the `UserInformation` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "biography" TEXT,
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "headline" TEXT,
ADD COLUMN     "linkedIn" TEXT,
ADD COLUMN     "twitter" TEXT,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "youtube" TEXT;

-- DropTable
DROP TABLE "UserInformation";
