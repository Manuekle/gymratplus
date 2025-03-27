import { useState } from "react";
import { Button } from "@/components/ui/button";
import WorkoutExercise from "../workouts/workout-exercise";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restTime: number;
  notes?: string;
}

interface WorkoutNewProps {
  workoutId: string;
  exercises: Exercise[];
  days: string[];
}

export function WorkoutNew({ workoutId, exercises, days }: WorkoutNewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Button
        size="sm"
        className="text-xs"
        onClick={() => setIsModalOpen(true)}
      >
        Agregar ejercicio
      </Button>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="border rounded-lg shadow-sm">
            <div className="flex items-center p-4 border-b">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{exercise.name}</h4>
                {exercise.notes && (
                  <p className="text-xs text-muted-foreground">
                    {exercise.notes}
                  </p>
                )}
              </div>
            </div>
            <div className="p-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Series</p>
                <p className="font-semibold">{exercise.sets}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Repeticiones
                </p>
                <p className="font-semibold">{exercise.reps}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Descanso</p>
                <p className="font-semibold flex items-center justify-center gap-1">
                  {exercise.restTime}s
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {exercises.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay ejercicios en este entrenamiento
        </div>
      )}

      <WorkoutExercise
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workoutId={workoutId}
        days={days}
      />
    </div>
  );
}
