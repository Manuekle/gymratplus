-- AlterTable
ALTER TABLE "Weight" ADD COLUMN     "bodyFatPercentage" DOUBLE PRECISION,
ADD COLUMN     "muscleMassPercentage" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Weight_userId_idx" ON "Weight"("userId");

-- CreateIndex
CREATE INDEX "Weight_date_idx" ON "Weight"("date");
