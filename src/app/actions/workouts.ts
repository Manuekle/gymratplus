"use server";

import { prisma } from "@/lib/database/prisma";
import { auth } from "@auth";
import { revalidatePath } from "next/cache";

export async function cloneWorkout(originalWorkoutId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "No autorizado" };
    }

    try {
        const originalWorkout = await prisma.workout.findUnique({
            where: { id: originalWorkoutId },
            include: {
                exercises: true,
            },
        });

        if (!originalWorkout) {
            return { error: "Rutina no encontrada" };
        }

        // Create new workout for the current user
        const newWorkout = await prisma.workout.create({
            data: {
                name: `${originalWorkout.name} (Importada)`,
                description: originalWorkout.description,
                createdById: session.user.id,
                type: "personal",
                status: "draft",
                updatedAt: new Date(),
                // Clone exercises
                exercises: {
                    create: originalWorkout.exercises.map((ex) => ({
                        exerciseId: ex.exerciseId,
                        sets: ex.sets,
                        reps: ex.reps,
                        weight: ex.weight,
                        restTime: ex.restTime,
                        order: ex.order,
                        notes: ex.notes,
                    })),
                },
            },
        });

        revalidatePath("/dashboard/workout");
        return { success: true, workoutId: newWorkout.id };
    } catch (error) {
        console.error("Error cloning workout:", error);
        return { error: "Error al importar la rutina" };
    }
}
