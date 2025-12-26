"use client";

import { useEffect, useState } from "react";
import WorkoutDockbar from "@/components/workout/workout-dockbar";

export default function WorkoutDockbarWrapper() {
    const [activeWorkout, setActiveWorkout] = useState<{
        id: string;
        startTime: Date;
        nextExercise?: {
            name: string;
            sets: number;
            reps: number;
        };
    } | null>({
        id: "debug-session",
        startTime: new Date(),
        nextExercise: {
            name: "Debug Press",
            sets: 3,
            reps: 10
        }
    });

    useEffect(() => {
        const fetchActiveWorkout = async () => {
            try {
                const response = await fetch("/api/workout-session/active");
                if (response.ok) {
                    const data = await response.json();
                    if (data.session) {
                        setActiveWorkout({
                            id: data.session.id,
                            startTime: new Date(data.session.startTime),
                            nextExercise: data.nextExercise,
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching active workout:", error);
            }
        };

        fetchActiveWorkout();

        // Poll every 5 seconds to check for active workout
        const interval = setInterval(fetchActiveWorkout, 5000);

        return () => clearInterval(interval);
    }, []);

    if (!activeWorkout) {
        return null;
    }

    return (
        <WorkoutDockbar
            workoutSessionId={activeWorkout.id}
            startTime={activeWorkout.startTime}
            nextExercise={activeWorkout.nextExercise}
            onComplete={() => setActiveWorkout(null)}
        />
    );
}
