import { NextResponse } from "next/server";
import { auth } from "@auth";
import { prisma } from "@/lib/database/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, plan } = await req.json();

    if (type === "workout") {
      // Save workout plan - create ONE workout with all days
      const workout = await prisma.workout.create({
        data: {
          name: plan.name || "Plan de Entrenamiento IA",
          description: `${plan.focus} - ${plan.difficulty} - ${plan.daysPerWeek} días/semana`,
          createdById: session.user.id,
          type: "personal",
          status: "active",
        },
      });

      // Add all exercises from all days to the single workout
      let exerciseOrder = 0;
      for (const day of plan.days) {
        if (day.exercises && day.exercises.length > 0) {
          for (const ex of day.exercises) {
            // Try to find existing exercise by name
            let exercise = await prisma.exercise.findFirst({
              where: {
                name: {
                  equals: ex.name,
                  mode: "insensitive",
                },
              },
            });

            // If not found, create it
            if (!exercise) {
              exercise = await prisma.exercise.create({
                data: {
                  name: ex.name,
                  muscleGroup: ex.muscleGroup || "General",
                  difficulty: "intermediate",
                  description: ex.notes || "",
                },
              });
            }

            // Create the workout exercise with day information in notes
            await prisma.workoutExercise.create({
              data: {
                workoutId: workout.id,
                exerciseId: exercise.id,
                order: exerciseOrder++,
                sets: ex.sets || 3,
                reps: ex.reps || 10,
                restTime: ex.restTime || 60,
                notes: `${day.day} - ${ex.notes || ""}`.trim(),
              },
            });
          }
        }
      }

      return NextResponse.json({ success: true, saved: [workout] });
    } else if (type === "nutrition") {
      // Save nutrition plan -> Update Profile Macros AND create FoodRecommendation
      await prisma.profile.update({
        where: { userId: session.user.id },
        data: {
          dailyCalorieTarget: parseInt(
            plan.calories ||
              plan.macros?.calories ||
              plan.macros?.totalCalories ||
              "2000",
          ),
          dailyProteinTarget: parseInt(
            (plan.macros?.protein || "0").toString().replace("g", ""),
          ),
          dailyCarbTarget: parseInt(
            (plan.macros?.carbs || "0").toString().replace("g", ""),
          ),
          dailyFatTarget: parseInt(
            (plan.macros?.fat || "0").toString().replace("g", ""),
          ),
          goal: plan.goal || undefined,
          dietaryPreference: plan.dietaryType || undefined,
        },
      });

      // Create FoodRecommendation with meals
      const foodRecommendation = await prisma.foodRecommendation.create({
        data: {
          userId: session.user.id,
          name: `Plan IA - ${plan.goal?.replace("_", " ") || "Nutrición"}`,
          calorieTarget: parseInt(plan.calories || "2000"),
          proteinTarget: parseInt(
            (plan.macros?.protein || "0").toString().replace("g", ""),
          ),
          carbTarget: parseInt(
            (plan.macros?.carbs || "0").toString().replace("g", ""),
          ),
          fatTarget: parseInt(
            (plan.macros?.fat || "0").toString().replace("g", ""),
          ),
        },
      });

      // Create meal entries for each meal
      if (plan.meals) {
        for (const [mealType, mealData] of Object.entries(plan.meals)) {
          if (
            mealData &&
            typeof mealData === "object" &&
            "entries" in mealData
          ) {
            const entries = mealData.entries as any[];

            if (Array.isArray(entries)) {
              for (const entry of entries) {
                await prisma.foodRecommendationEntry.create({
                  data: {
                    recommendationId: foodRecommendation.id,
                    foodId: entry.foodId || entry.food?.id,
                    mealType: mealType,
                    quantity: entry.quantity || 100,
                  },
                });
              }
            }
          }
        }
      }

      return NextResponse.json({
        success: true,
        recommendation: foodRecommendation,
      });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Error saving plan:", error);
    return NextResponse.json({ error: "Error saving plan" }, { status: 500 });
  }
}
