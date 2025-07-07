/*
  Warnings:

  - You are about to drop the column `lastWorkoutDate` on the `WorkoutStreak` table. All the data in the column will be lost.
  - You are about to drop the `Instructor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InstructorMealPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InstructorRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InstructorWorkoutPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Instructor" DROP CONSTRAINT "Instructor_userId_fkey";

-- DropForeignKey
ALTER TABLE "InstructorMealPlan" DROP CONSTRAINT "InstructorMealPlan_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "InstructorMealPlan" DROP CONSTRAINT "InstructorMealPlan_studentId_fkey";

-- DropForeignKey
ALTER TABLE "InstructorRequest" DROP CONSTRAINT "InstructorRequest_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "InstructorRequest" DROP CONSTRAINT "InstructorRequest_studentId_fkey";

-- DropForeignKey
ALTER TABLE "InstructorWorkoutPlan" DROP CONSTRAINT "InstructorWorkoutPlan_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "InstructorWorkoutPlan" DROP CONSTRAINT "InstructorWorkoutPlan_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isInstructor" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "WorkoutStreak" DROP COLUMN "lastWorkoutDate",
ADD COLUMN     "lastRestDayAt" TIMESTAMP(3),
ADD COLUMN     "lastWorkoutAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "Instructor";

-- DropTable
DROP TABLE "InstructorMealPlan";

-- DropTable
DROP TABLE "InstructorRequest";

-- DropTable
DROP TABLE "InstructorWorkoutPlan";

-- DropTable
DROP TABLE "Student";

-- CreateTable
CREATE TABLE "InstructorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "curriculum" TEXT,
    "pricePerMonth" DOUBLE PRECISION,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "country" TEXT,
    "city" TEXT,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstructorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentInstructor" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "instructorProfileId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "agreedPrice" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentInstructor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InstructorProfile_userId_key" ON "InstructorProfile"("userId");

-- CreateIndex
CREATE INDEX "StudentInstructor_studentId_idx" ON "StudentInstructor"("studentId");

-- CreateIndex
CREATE INDEX "StudentInstructor_instructorProfileId_idx" ON "StudentInstructor"("instructorProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentInstructor_studentId_instructorProfileId_key" ON "StudentInstructor"("studentId", "instructorProfileId");

-- CreateIndex
CREATE INDEX "WorkoutStreak_userId_idx" ON "WorkoutStreak"("userId");

-- AddForeignKey
ALTER TABLE "InstructorProfile" ADD CONSTRAINT "InstructorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentInstructor" ADD CONSTRAINT "StudentInstructor_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentInstructor" ADD CONSTRAINT "StudentInstructor_instructorProfileId_fkey" FOREIGN KEY ("instructorProfileId") REFERENCES "InstructorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
