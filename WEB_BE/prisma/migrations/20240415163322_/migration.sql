-- CreateTable
CREATE TABLE "CourseInformation" (
    "courseId" TEXT NOT NULL,
    "part" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CourseInformation_pkey" PRIMARY KEY ("courseId")
);
