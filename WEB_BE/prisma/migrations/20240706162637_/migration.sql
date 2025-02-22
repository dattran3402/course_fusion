-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "percentToViewNext" INTEGER DEFAULT 60,
ADD COLUMN     "requiresSequentialViewing" BOOLEAN DEFAULT false;
