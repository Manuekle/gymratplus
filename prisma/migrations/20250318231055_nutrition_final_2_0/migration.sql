/*
  Warnings:

  - You are about to drop the `MealPlanItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MealPlanItem" DROP CONSTRAINT "MealPlanItem_foodId_fkey";

-- DropForeignKey
ALTER TABLE "MealPlanItem" DROP CONSTRAINT "MealPlanItem_recipeId_fkey";

-- DropTable
DROP TABLE "MealPlanItem";
