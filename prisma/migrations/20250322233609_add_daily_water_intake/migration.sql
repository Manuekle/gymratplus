/*
  Warnings:

  - You are about to drop the column `waterIntake` on the `MealLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MealLog" DROP COLUMN "waterIntake";

-- CreateTable
CREATE TABLE "DailyWaterIntake" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "intake" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyWaterIntake_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyWaterIntake_userId_date_key" ON "DailyWaterIntake"("userId", "date");
