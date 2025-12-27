import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "@auth";
import { calculate1RM } from "@/lib/utils/1rm-calculator";

export async function GET() {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        // Fetch all completed workout sessions for the user
        // We fetch sets and exercises to calculate volume and 1RM
        const workoutSessions = await prisma.workoutSession.findMany({
            where: {
                userId: session.user.id,
                completed: true,
            },
            include: {
                exercises: {
                    include: {
                        exercise: true,
                        sets: {
                            where: {
                                completed: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                date: "asc",
            },
        });

        // 1. Calculate Volume History (Total Volume per Session Date)
        const volumeHistoryMap = new Map<string, number>();

        workoutSessions.forEach((session) => {
            const dateKey = session.date.toISOString().split("T")[0] ?? "";

            // Should not happen as date comes from DB, but satisfies TS
            if (!dateKey) return;

            // ...

            let sessionVolume = 0;

            session.exercises.forEach((ex) => {
                ex.sets.forEach((set) => {
                    if (set.weight && set.reps) {
                        sessionVolume += set.weight * set.reps;
                    }
                });
            });

            // Aggregate if multiple sessions on same day
            volumeHistoryMap.set(
                dateKey,
                (volumeHistoryMap.get(dateKey) || 0) + sessionVolume
            );
        });

        const volumeHistory = Array.from(volumeHistoryMap.entries()).map(
            ([date, volume]) => ({
                date,
                volume,
            })
        );

        // 2. Calculate 1RM Progression per Exercise
        const exerciseStatsMap = new Map<
            string,
            {
                id: string;
                name: string;
                history: { date: string; oneRm: number }[];
            }
        >();

        workoutSessions.forEach((session) => {
            const dateKey = session.date.toISOString().split("T")[0] ?? "";
            if (!dateKey) return;

            session.exercises.forEach((exMetadata) => {
                const exerciseId = exMetadata.exercise.id;
                const exerciseName = exMetadata.exercise.name;

                // Calculate Max 1RM for this exercise in this session
                let max1RM = 0;
                exMetadata.sets.forEach((set) => {
                    if (set.weight && set.reps) {
                        const estimated1RM = calculate1RM(set.weight, set.reps);
                        if (estimated1RM > max1RM) {
                            max1RM = estimated1RM;
                        }
                    }
                });

                if (max1RM > 0) {
                    let exerciseEntry = exerciseStatsMap.get(exerciseId);

                    if (!exerciseEntry) {
                        exerciseEntry = {
                            id: exerciseId,
                            name: exerciseName,
                            history: [],
                        };
                        exerciseStatsMap.set(exerciseId, exerciseEntry);
                    }

                    // Check if we already have an entry for this date (keep the max)
                    const existingEntryIndex = exerciseEntry.history.findIndex(
                        (h) => h.date === dateKey
                    );

                    if (existingEntryIndex !== -1) {
                        if (max1RM > exerciseEntry.history[existingEntryIndex].oneRm) {
                            exerciseEntry.history[existingEntryIndex].oneRm = max1RM;
                        }
                    } else {
                        exerciseEntry.history.push({ date: dateKey, oneRm: max1RM });
                    }
                }
            });
        });

        const exercises = Array.from(exerciseStatsMap.values());

        return NextResponse.json({
            volumeHistory, // For Bar Chart
            exercises, // For Line Chart (selectable)
        });
    } catch (error) {
        console.error("Error calculating analytics:", error);
        return NextResponse.json(
            { error: "Error al calcular estadísticas" },
            { status: 500 }
        );
    }
}
