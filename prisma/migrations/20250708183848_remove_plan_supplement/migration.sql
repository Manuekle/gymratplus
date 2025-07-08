/*
  Warnings:

  - You are about to drop the `PlanSupplement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PlanSupplement" DROP CONSTRAINT "PlanSupplement_foodPlanId_fkey";

-- DropTable
DROP TABLE "PlanSupplement";
