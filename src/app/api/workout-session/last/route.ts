import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "@auth";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const exerciseIdsParam = searchParams.get("exerciseIds");

        if (!exerciseIdsParam) {
            return NextResponse.json(
                { error: "Se requieren IDs de ejercicios" },
                { status: 400 }
            );
        }

        const exerciseIds = exerciseIdsParam.split(",");

        const lastSessionStats: Record<
            string,
            { weight: number; reps: number; setNumber: number }[]
        > = {};

        // For each exercise, find the last completed session where it was performed
        for (const exerciseId of exerciseIds) {
            const lastExerciseSession = await prisma.exerciseSession.findFirst({
                where: {
                    exerciseId: exerciseId,
                    workoutSession: {
                        userId: session.user.id,
                        completed: true,
                    },
                    completed: true, // Only consider fully completed exercises? Or just any sets? Let's say completed exercises for now or at least sets.
                    // Actually, let's find the last workout session that contained this exercise
                },
                include: {
                    sets: {
                        where: { completed: true },
                        orderBy: { setNumber: "asc" },
                    },
                    workoutSession: true,
                },
                orderBy: {
                    workoutSession: {
                        date: "desc",
                    },
                },
            });

            if (lastExerciseSession && lastExerciseSession.sets.length > 0) {
                lastSessionStats[exerciseId] = lastExerciseSession.sets.map((set) => ({
                    weight: set.weight || 0,
                    reps: set.reps || 0,
                    setNumber: set.setNumber,
                }));
            }
        }

        return NextResponse.json(lastSessionStats);
    } catch (error) {
        console.error("Error al obtener estadísticas anteriores:", error);
        return NextResponse.json(
            { error: "Error al obtener estadísticas anteriores" },
            { status: 500 }
        );
    }
}
