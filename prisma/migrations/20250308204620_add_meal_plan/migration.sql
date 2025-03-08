/*
  Warnings:

  - You are about to drop the `BodyMetrics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MealTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TemplateEntry` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BodyMetrics" DROP CONSTRAINT "BodyMetrics_userId_fkey";

-- DropForeignKey
ALTER TABLE "MealTemplate" DROP CONSTRAINT "MealTemplate_userId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateEntry" DROP CONSTRAINT "TemplateEntry_foodId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateEntry" DROP CONSTRAINT "TemplateEntry_mealTemplateId_fkey";

-- DropTable
DROP TABLE "BodyMetrics";

-- DropTable
DROP TABLE "MealTemplate";

-- DropTable
DROP TABLE "TemplateEntry";

-- CreateTable
CREATE TABLE "MealPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "days" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supplement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPlanSupplement" (
    "id" TEXT NOT NULL,
    "mealPlanId" TEXT NOT NULL,
    "supplementId" TEXT NOT NULL,

    CONSTRAINT "MealPlanSupplement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MealPlanSupplement" ADD CONSTRAINT "MealPlanSupplement_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanSupplement" ADD CONSTRAINT "MealPlanSupplement_supplementId_fkey" FOREIGN KEY ("supplementId") REFERENCES "Supplement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
