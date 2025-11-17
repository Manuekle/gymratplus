/*
  Warnings:

  - You are about to drop the column `macros` on the `FoodRecommendation` table. All the data in the column will be lost.
  - You are about to drop the column `meals` on the `FoodRecommendation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FoodRecommendation" DROP COLUMN "macros",
DROP COLUMN "meals";
