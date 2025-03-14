/*
  Warnings:

  - You are about to drop the column `date` on the `MealLog` table. All the data in the column will be lost.
  - Added the required column `consumedAt` to the `MealLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `MealLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MealLog" DROP CONSTRAINT "MealLog_userId_fkey";

-- AlterTable
ALTER TABLE "MealLog" DROP COLUMN "date",
ADD COLUMN     "consumedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "foodId" TEXT,
ADD COLUMN     "quantity" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "recipeId" TEXT;

-- CreateIndex
CREATE INDEX "MealLog_userId_idx" ON "MealLog"("userId");

-- CreateIndex
CREATE INDEX "MealLog_foodId_idx" ON "MealLog"("foodId");

-- CreateIndex
CREATE INDEX "MealLog_recipeId_idx" ON "MealLog"("recipeId");

-- CreateIndex
CREATE INDEX "MealLog_consumedAt_idx" ON "MealLog"("consumedAt");

-- AddForeignKey
ALTER TABLE "MealLog" ADD CONSTRAINT "MealLog_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealLog" ADD CONSTRAINT "MealLog_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealLog" ADD CONSTRAINT "MealLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
