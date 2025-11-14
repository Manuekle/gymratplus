-- AlterTable
ALTER TABLE "Food" ADD COLUMN     "predefinedPortions" JSONB,
ADD COLUMN     "servingUnit" TEXT,
ADD COLUMN     "synonyms" TEXT[];
