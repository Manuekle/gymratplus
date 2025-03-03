-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "bodyFatPercentage" DOUBLE PRECISION,
ADD COLUMN     "dailyActivity" TEXT,
ADD COLUMN     "dietaryPreference" TEXT,
ADD COLUMN     "metabolicRate" DOUBLE PRECISION,
ADD COLUMN     "muscleMass" DOUBLE PRECISION,
ADD COLUMN     "preferredWorkoutTime" TEXT,
ADD COLUMN     "trainingFrequency" INTEGER,
ADD COLUMN     "waterIntake" DOUBLE PRECISION;
