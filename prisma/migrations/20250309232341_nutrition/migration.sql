-- AlterTable
ALTER TABLE "Food" ADD COLUMN     "isRecipeItem" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recipeId" TEXT;
