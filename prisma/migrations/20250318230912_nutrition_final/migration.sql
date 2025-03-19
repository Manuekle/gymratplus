/*
  Warnings:

  - You are about to drop the column `planId` on the `MealLog` table. All the data in the column will be lost.
  - You are about to drop the column `nutritionDayId` on the `MealPlanItem` table. All the data in the column will be lost.
  - You are about to drop the `NutritionDay` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NutritionPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlanSupplement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Supplement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MealLog" DROP CONSTRAINT "MealLog_planId_fkey";

-- DropForeignKey
ALTER TABLE "MealPlanItem" DROP CONSTRAINT "MealPlanItem_nutritionDayId_fkey";

-- DropForeignKey
ALTER TABLE "NutritionDay" DROP CONSTRAINT "NutritionDay_nutritionPlanId_fkey";

-- DropForeignKey
ALTER TABLE "NutritionPlan" DROP CONSTRAINT "NutritionPlan_userId_fkey";

-- DropForeignKey
ALTER TABLE "PlanSupplement" DROP CONSTRAINT "PlanSupplement_nutritionPlanId_fkey";

-- DropForeignKey
ALTER TABLE "PlanSupplement" DROP CONSTRAINT "PlanSupplement_supplementId_fkey";

-- DropForeignKey
ALTER TABLE "Supplement" DROP CONSTRAINT "Supplement_userId_fkey";

-- DropIndex
DROP INDEX "MealLog_planId_idx";

-- AlterTable
ALTER TABLE "MealLog" DROP COLUMN "planId";

-- AlterTable
ALTER TABLE "MealPlanItem" DROP COLUMN "nutritionDayId";

-- DropTable
DROP TABLE "NutritionDay";

-- DropTable
DROP TABLE "NutritionPlan";

-- DropTable
DROP TABLE "PlanSupplement";

-- DropTable
DROP TABLE "Supplement";
