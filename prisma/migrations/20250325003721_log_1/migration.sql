/*
  Warnings:

  - The `reps` column on the `SetSession` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `restTime` column on the `WorkoutExercise` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `reps` on the `WorkoutExercise` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "SetSession" DROP COLUMN "reps",
ADD COLUMN     "reps" INTEGER;

-- AlterTable
ALTER TABLE "WorkoutExercise" DROP COLUMN "reps",
ADD COLUMN     "reps" INTEGER NOT NULL,
DROP COLUMN "restTime",
ADD COLUMN     "restTime" INTEGER;
