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
  } | null>(null);

  useEffect(() => {
    const fetchActiveWorkout = async () => {
      try {
        const response = await fetch("/api/workout-session/active");
        if (response.ok) {
          const data = await response.json();
          setActiveWorkout({
            id: data.id,
            startTime: new Date(data.createdAt),
            // TODO: Implement next exercise logic based on completed sets
            nextExercise: undefined,
          });
        } else {
          setActiveWorkout(null);
        }
      } catch (error) {
        console.error("Error fetching active workout:", error);
        setActiveWorkout(null);
      }
    };

    fetchActiveWorkout();

    // Poll every 30 seconds to check for active workout (reduced from 5s to minimize API calls)
    const interval = setInterval(fetchActiveWorkout, 30000);

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
