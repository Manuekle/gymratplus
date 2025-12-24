import { NextResponse } from "next/server";
import { auth } from "@auth";
import { prisma } from "@/lib/database/prisma";
import {
  createLegWorkout,
  createChestTricepsWorkout,
  createBackBicepsWorkout,
  createShoulderWorkout,
  createCoreWorkout,
} from "@/lib/workout/workout-utils";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, plan } = await req.json();

    if (type === "workout") {
      // Save workout plan (create multiple workouts, one for each day)
      const savedWorkouts = [];

      for (const day of plan.days) {
        // Create a workout for this day
        const workout = await prisma.workout.create({
          data: {
            name: `${plan.name || "Plan IA"} - ${day.day}`,
            description: day.day, // e.g. "Día 1 - Pecho y Tríceps"
            createdById: session.user.id,
            type: "personal",
            status: "active",
          },
        });

        // Add exercises to the workout
        // We need to manually add them because the helpers (createLegWorkout etc) might not match the specific mix of exercises
        // So we iterate and add WorkoutExercise entries
        if (day.exercises && day.exercises.length > 0) {
          for (let i = 0; i < day.exercises.length; i++) {
            const ex = day.exercises[i];
            await prisma.workoutExercise.create({
              data: {
                workoutId: workout.id,
                exerciseId: ex.id,
                order: i,
                sets: ex.sets || 3,
                reps: ex.reps || 10,
                restTime: ex.restTime || 60,
                notes: ex.notes,
              },
            });
          }
        }
        savedWorkouts.push(workout);
      }

      return NextResponse.json({ success: true, saved: savedWorkouts });
    } else if (type === "nutrition") {
      // Save nutrition plan -> Update Profile Macros
      await prisma.profile.update({
        where: { userId: session.user.id },
        data: {
          dailyCalorieTarget: parseInt(
            plan.macros.calories || plan.macros.totalCalories || 2000,
          ),
          dailyProteinTarget: parseInt(plan.macros.protein.replace("g", "")),
          dailyCarbTarget: parseInt(plan.macros.carbs.replace("g", "")),
          dailyFatTarget: parseInt(plan.macros.fat.replace("g", "")),
          goal: plan.goal || undefined,
          dietaryPreference: plan.dietaryType || undefined,
          // We could also save the detailed meal plan to a new model if it existed,
          // but for now updating targets is the most important "Actionable" step.
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Error saving plan:", error);
    return NextResponse.json({ error: "Error saving plan" }, { status: 500 });
  }
}
