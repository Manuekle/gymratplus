/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Food` table. All the data in the column will be lost.
  - You are about to drop the column `isFavorite` on the `Food` table. All the data in the column will be lost.
  - You are about to drop the column `servings` on the `MealEntryRecipe` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `MealLog` table. All the data in the column will be lost.
  - You are about to drop the `MealEntry` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[recipeId,mealLogId]` on the table `MealEntryRecipe` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "MealEntry" DROP CONSTRAINT "MealEntry_foodId_fkey";

-- DropForeignKey
ALTER TABLE "MealEntry" DROP CONSTRAINT "MealEntry_mealLogId_fkey";

-- DropForeignKey
ALTER TABLE "MealEntryRecipe" DROP CONSTRAINT "MealEntryRecipe_recipeId_fkey";

-- AlterTable
ALTER TABLE "Food" DROP COLUMN "imageUrl",
DROP COLUMN "isFavorite";

-- AlterTable
ALTER TABLE "MealEntryRecipe" DROP COLUMN "servings",
ADD COLUMN     "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

-- AlterTable
ALTER TABLE "MealLog" DROP COLUMN "notes";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "planType" TEXT DEFAULT 'free',
ADD COLUMN     "subscriptionStatus" TEXT DEFAULT 'inactive',
ADD COLUMN     "trialEndsAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "MealEntry";

-- CreateIndex
CREATE UNIQUE INDEX "MealEntryRecipe_recipeId_mealLogId_key" ON "MealEntryRecipe"("recipeId", "mealLogId");

-- AddForeignKey
ALTER TABLE "MealEntryRecipe" ADD CONSTRAINT "MealEntryRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
