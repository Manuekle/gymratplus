-- AlterTable
ALTER TABLE "FoodRecommendation" ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "instructorId" TEXT,
ADD COLUMN     "notes" TEXT;

-- CreateIndex
CREATE INDEX "FoodRecommendation_instructorId_idx" ON "FoodRecommendation"("instructorId");

-- CreateIndex
CREATE INDEX "FoodRecommendation_assignedToId_idx" ON "FoodRecommendation"("assignedToId");

-- AddForeignKey
ALTER TABLE "FoodRecommendation" ADD CONSTRAINT "FoodRecommendation_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodRecommendation" ADD CONSTRAINT "FoodRecommendation_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
