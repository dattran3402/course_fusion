/*
  Warnings:

  - You are about to drop the `Teacher` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastChargeMoney" TIMESTAMP(3),
ADD COLUMN     "stripeCustomerId" TEXT;

-- DropTable
DROP TABLE "Teacher";
