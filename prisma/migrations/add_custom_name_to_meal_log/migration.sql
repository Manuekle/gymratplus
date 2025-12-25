-- CreateTable: Add customName to MealLog
-- This migration adds a customName field to store meal names from AI logging

ALTER TABLE "MealLog" ADD COLUMN "customName" TEXT;
