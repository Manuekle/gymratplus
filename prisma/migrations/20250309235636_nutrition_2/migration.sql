/*
  Warnings:

  - You are about to drop the column `isRecipeItem` on the `Food` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Food" DROP COLUMN "isRecipeItem",
ADD COLUMN     "ingredients" JSONB,
ADD COLUMN     "isRecipe" BOOLEAN NOT NULL DEFAULT false;
