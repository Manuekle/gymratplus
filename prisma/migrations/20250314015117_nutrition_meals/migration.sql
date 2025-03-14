-- AlterTable
ALTER TABLE "MealLog" ADD COLUMN     "planId" TEXT;

-- CreateIndex
CREATE INDEX "MealLog_planId_idx" ON "MealLog"("planId");

-- AddForeignKey
ALTER TABLE "MealLog" ADD CONSTRAINT "MealLog_planId_fkey" FOREIGN KEY ("planId") REFERENCES "NutritionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
