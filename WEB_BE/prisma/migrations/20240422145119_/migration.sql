-- CreateTable
CREATE TABLE "UserInformation" (
    "userId" TEXT NOT NULL,
    "headline" TEXT,
    "biography" TEXT,
    "website" TEXT,
    "twitter" TEXT,
    "facebook" TEXT,
    "linkedIn" TEXT,
    "youtube" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "UserInformation_pkey" PRIMARY KEY ("userId")
);
