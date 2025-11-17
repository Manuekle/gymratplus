-- AlterTable
ALTER TABLE "FoodRecommendation" ADD COLUMN     "carbsTarget" DOUBLE PRECISION,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "fatTarget" DOUBLE PRECISION,
ADD COLUMN     "proteinTarget" DOUBLE PRECISION,
ALTER COLUMN "macros" DROP NOT NULL,
ALTER COLUMN "meals" DROP NOT NULL;

-- CreateTable
CREATE TABLE "MealPlanMeal" (
    "id" TEXT NOT NULL,
    "foodRecommendationId" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealPlanMeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPlanEntry" (
    "id" TEXT NOT NULL,
    "mealPlanMealId" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealPlanEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MealPlanMeal_foodRecommendationId_idx" ON "MealPlanMeal"("foodRecommendationId");

-- CreateIndex
CREATE INDEX "MealPlanMeal_mealType_idx" ON "MealPlanMeal"("mealType");

-- CreateIndex
CREATE INDEX "MealPlanEntry_mealPlanMealId_idx" ON "MealPlanEntry"("mealPlanMealId");

-- CreateIndex
CREATE INDEX "MealPlanEntry_foodId_idx" ON "MealPlanEntry"("foodId");

-- AddForeignKey
ALTER TABLE "MealPlanMeal" ADD CONSTRAINT "MealPlanMeal_foodRecommendationId_fkey" FOREIGN KEY ("foodRecommendationId") REFERENCES "FoodRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanEntry" ADD CONSTRAINT "MealPlanEntry_mealPlanMealId_fkey" FOREIGN KEY ("mealPlanMealId") REFERENCES "MealPlanMeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanEntry" ADD CONSTRAINT "MealPlanEntry_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
