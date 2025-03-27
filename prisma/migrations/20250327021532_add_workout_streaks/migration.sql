-- CreateTable
CREATE TABLE "WorkoutStreak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastWorkoutAt" TIMESTAMP(3),
    "lastRestDayAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutStreak_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutStreak_userId_key" ON "WorkoutStreak"("userId");

-- CreateIndex
CREATE INDEX "WorkoutStreak_userId_idx" ON "WorkoutStreak"("userId");

-- AddForeignKey
ALTER TABLE "WorkoutStreak" ADD CONSTRAINT "WorkoutStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
