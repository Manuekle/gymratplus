-- DropForeignKey
ALTER TABLE "public"."WorkoutSession" DROP CONSTRAINT "WorkoutSession_workoutId_fkey";

-- AlterTable
ALTER TABLE "WorkoutSession" ALTER COLUMN "workoutId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE SET NULL ON UPDATE CASCADE;
