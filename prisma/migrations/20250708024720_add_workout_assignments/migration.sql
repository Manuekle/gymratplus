/*
  Warnings:

  - You are about to drop the `StudentAssignedWorkout` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkoutTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkoutTemplateExercise` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StudentAssignedWorkout" DROP CONSTRAINT "StudentAssignedWorkout_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "StudentAssignedWorkout" DROP CONSTRAINT "StudentAssignedWorkout_studentId_fkey";

-- DropForeignKey
ALTER TABLE "StudentAssignedWorkout" DROP CONSTRAINT "StudentAssignedWorkout_workoutTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutTemplate" DROP CONSTRAINT "WorkoutTemplate_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutTemplateExercise" DROP CONSTRAINT "WorkoutTemplateExercise_workoutTemplateId_fkey";

-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "assignedDate" TIMESTAMP(3),
ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "instructorId" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" TEXT DEFAULT 'assigned';

-- DropTable
DROP TABLE "StudentAssignedWorkout";

-- DropTable
DROP TABLE "WorkoutTemplate";

-- DropTable
DROP TABLE "WorkoutTemplateExercise";

-- CreateIndex
CREATE INDEX "Workout_instructorId_idx" ON "Workout"("instructorId");

-- CreateIndex
CREATE INDEX "Workout_assignedToId_idx" ON "Workout"("assignedToId");

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
