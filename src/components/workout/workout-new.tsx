"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import WorkoutExercise from "../workouts/workout-exercise";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { Skeleton } from "../ui/skeleton";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restTime: number;
  notes?: string;
}

interface WorkoutDay {
  day: string;
  exercises: Exercise[];
}

interface WorkoutNewProps {
  workoutId: string;
  exercises: Exercise[];
  days: string[];
  selectedDay?: string; // Día seleccionado actualmente
}

export function WorkoutNew({
  workoutId,
  exercises: initialExercises,
  days,
  selectedDay = days.length > 0 ? days[0] : "",
}: WorkoutNewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDay, setCurrentDay] = useState<string>(
    selectedDay || ((days.length > 0 ? days[0] : "") as string),
  );

  // Función para cargar los ejercicios del workout filtrados por día
  const fetchExercises = useCallback(async () => {
    if (!workoutId) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/workouts/${workoutId}`, {
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (res.ok) {
        const data = await res.json();

        // Buscar el día actual en los datos
        const dayData = data.days.find(
          (day: WorkoutDay) => day.day === currentDay,
        );

        // Si encontramos el día, establecer sus ejercicios
        if (dayData) {
          setExercises(dayData.exercises);
        } else {
          // Si no encontramos el día, mostrar un array vacío
          setExercises([]);
        }
      } else {
        console.error("Error fetching exercises:", await res.text());
        toast.error("Error al cargar ejercicios");
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
      toast.error("Error al cargar ejercicios");
    } finally {
      setIsLoading(false);
    }
  }, [workoutId, currentDay]);

  // Cargar ejercicios cuando cambia el día o el workoutId
  useEffect(() => {
    fetchExercises();
  }, [fetchExercises, currentDay]);

  // Manejar la adición de un nuevo ejercicio
  const handleExerciseAdded = useCallback(() => {
    console.log("Ejercicio agregado, actualizando datos...");
    fetchExercises();
  }, [fetchExercises]);

  // Manejar el cambio de día
  const handleDayChange = (day: string) => {
    setCurrentDay(day);
  };

  const handleDelete = async (exerciseId: string) => {
    try {
      const res = await fetch(
        `/api/workouts/${workoutId}/exercises/${exerciseId}`,
        {
          method: "DELETE",
        },
      );

      if (res.ok) {
        setExercises((prevExercises) =>
          prevExercises.filter((ex) => ex.id !== exerciseId),
        );
        toast.success("Ejercicio eliminado", {
          description: "El ejercicio se ha eliminado correctamente",
        });
      } else {
        throw new Error("Error al eliminar el ejercicio");
      }
    } catch (error) {
      console.error("Error al eliminar el ejercicio:", error);
      toast.error("Error al eliminar el ejercicio", {
        description: "Ha ocurrido un error al intentar eliminar el ejercicio",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Selector de días */}
        <div className="flex flex-wrap gap-2">
          {days.map((day) => (
            <Button
              key={day}
              variant={currentDay === day ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => handleDayChange(day)}
            >
              {day}
            </Button>
          ))}
        </div>

        <Button
          size="sm"
          className="text-xs w-full md:w-auto"
          onClick={() => setIsModalOpen(true)}
        >
          Agregar ejercicio
        </Button>
      </div>

      {isLoading ? (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 15 }).map((_, index) => (
              <div key={index} className="border rounded-lg shadow-sm">
                <div className="flex items-center p-4 border-b ">
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-2 w-40" />
                  </div>
                </div>
                <div className="p-4 gap-4 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="border rounded-lg shadow-sm">
              <div className="flex items-center p-4 border-b">
                <div className="flex-1">
                  <h4 className="font-medium text-xs">{exercise.name}</h4>
                  {exercise.notes && (
                    <p className="text-xs text-muted-foreground">
                      {exercise.notes}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(exercise.id)}
                >
                  <HugeiconsIcon
                    icon={Delete02Icon}
                    size={16}
                    color="currentColor"
                  />
                </Button>
              </div>
              <div className="p-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Series</p>
                  <p className="font-semibold">{exercise.sets}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Reps</p>
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
      )}

      {!isLoading && exercises.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay ejercicios para {currentDay}
        </div>
      )}

      <WorkoutExercise
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workoutId={workoutId}
        days={days}
        onExerciseAdded={handleExerciseAdded}
        existingExercises={exercises.map((ex) => ({
          id: ex.id,
          exerciseId: ex.id,
        }))}
        selectedDay={currentDay} // Pasar el día seleccionado al modal
      />
    </div>
  );
}
