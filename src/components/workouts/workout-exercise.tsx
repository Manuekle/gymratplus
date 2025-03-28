"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
}

interface WorkoutExerciseProps {
  workoutId: string;
  isOpen: boolean;
  onClose: () => void;
  days: string[];
  existingExercises?: { id: string; exerciseId: string }[];
  onExerciseAdded?: () => void; // Callback para notificar al componente padre
}

export default function WorkoutExercise({
  workoutId,
  isOpen,
  onClose,
  days,
  existingExercises = [],
  onExerciseAdded,
}: WorkoutExerciseProps) {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [exerciseData, setExerciseData] = useState({
    sets: 0,
    reps: 0,
    restTime: 0,
  });

  const fetchExercises = async () => {
    try {
      const res = await fetch("/api/exercises");
      if (res.ok) {
        const data = await res.json();
        setExercises(data);
      } else {
        console.error("Error fetching exercises:", await res.text());
        toast.error("Error al cargar ejercicios");
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
      toast.error("Error al cargar ejercicios");
    }
  };
  useEffect(() => {
    fetchExercises();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedExercise) {
      toast.error("Selecciona un ejercicio", {
        description: "Debes seleccionar un ejercicio para continuar",
      });
      return;
    }
    if (!selectedDay) {
      toast.error("Selecciona un día", {
        description: "Debes seleccionar un día para continuar",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Enviando datos:", {
        workoutId,
        exerciseId: selectedExercise,
        ...exerciseData,
        notes: selectedDay,
      });

      const res = await fetch(`/api/workouts/${workoutId}/exercises`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Añadir un encabezado para evitar el caché
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          exerciseId: selectedExercise,
          ...exerciseData,
          notes: selectedDay,
        }),
      });

      if (res.ok) {
        toast.success("Ejercicio agregado", {
          description:
            "El ejercicio se ha agregado correctamente al entrenamiento",
        });

        // Múltiples estrategias para asegurar la actualización
        router.refresh(); // Intentar refresh del router

        // Notificar al componente padre para que actualice los datos
        if (onExerciseAdded) {
          onExerciseAdded();
        }

        // Forzar una recarga de la página actual después de un breve retraso
        setTimeout(() => {
          // Usar revalidatePath si está disponible (Next.js 13+)
          try {
            fetch(`/api/revalidate?path=/workouts/${workoutId}`, {
              method: "POST",
            });
          } catch (error) {
            console.error("Error revalidating path:", error);
          }
        }, 300);

        setExerciseData({
          sets: 0,
          reps: 0,
          restTime: 0,
        });
        setSelectedDay("");
        setSelectedExercise(null);
        onClose();
        window.location.reload();
      } else {
        const errorData = await res.json();
        console.error("Error response:", errorData);
        toast.error(errorData.error || "Error al guardar el ejercicio", {
          description:
            errorData.details || "Verifica los datos e intenta nuevamente",
        });
      }
    } catch (error) {
      console.error("Error al guardar el ejercicio:", error);
      toast.error("Error al guardar el ejercicio", {
        description: "Ha ocurrido un error al intentar guardar el ejercicio",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isExerciseSelected = (exerciseId: string) => {
    return (
      existingExercises?.some((ex) => ex.exerciseId === exerciseId) ?? false
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Añadir Nuevo Ejercicio
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Selecciona el día y el ejercicio que deseas agregar
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Selección de día */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Selecciona el día:</Label>
              <div className="flex flex-wrap gap-2">
                {days.map((day) => (
                  <Badge
                    key={day}
                    variant={selectedDay === day ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer px-4 py-1 text-xs transition-colors",
                      selectedDay === day &&
                        "bg-primary text-primary-foreground"
                    )}
                    onClick={() => setSelectedDay(day)}
                  >
                    {day}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Selección de ejercicio */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Selecciona el ejercicio:
              </Label>
              <ScrollArea className="h-[300px] rounded-md border p-4">
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(
                    exercises.reduce((acc, exercise) => {
                      if (!acc[exercise.muscleGroup]) {
                        acc[exercise.muscleGroup] = [];
                      }
                      acc[exercise.muscleGroup].push(exercise);
                      return acc;
                    }, {} as Record<string, Exercise[]>)
                  ).map(([muscleGroup, groupExercises]) => (
                    <div key={muscleGroup} className="space-y-2">
                      <h3 className="text-sm capitalize tracking-tight font-bold text-muted-foreground">
                        {muscleGroup}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {groupExercises.map((exercise) => {
                          const isSelected = selectedExercise === exercise.id;
                          const isDisabled = isExerciseSelected(exercise.id);

                          return (
                            <div
                              key={exercise.id}
                              onClick={() =>
                                !isDisabled && setSelectedExercise(exercise.id)
                              }
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 cursor-pointer border border-border",
                                isSelected
                                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                  : "bg-background hover:bg-secondary",
                                isDisabled &&
                                  "bg-red-100 text-red-700 cursor-not-allowed opacity-50"
                              )}
                              title={
                                isDisabled
                                  ? "Este ejercicio ya está en el entrenamiento"
                                  : ""
                              }
                            >
                              <span>{exercise.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Detalles del ejercicio */}
            {selectedExercise && (
              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sets" className="text-xs md:text-sm">
                      Series
                    </Label>
                    <Input
                      id="sets"
                      type="number"
                      min="1"
                      className="text-xs md:text-sm"
                      placeholder="Sets"
                      value={exerciseData.sets || ""}
                      onChange={(e) =>
                        setExerciseData({
                          ...exerciseData,
                          sets: Number.parseInt(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reps" className="text-xs md:text-sm">
                      Repeticiones
                    </Label>
                    <Input
                      id="reps"
                      type="number"
                      min="1"
                      className="text-xs md:text-sm"
                      placeholder="Reps"
                      value={exerciseData.reps || ""}
                      onChange={(e) =>
                        setExerciseData({
                          ...exerciseData,
                          reps: Number.parseInt(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="restTime" className="text-xs md:text-sm">
                      Descanso (s)
                    </Label>
                    <Input
                      id="restTime"
                      type="number"
                      min="0"
                      className="text-xs md:text-sm"
                      placeholder="Descanso"
                      value={exerciseData.restTime || ""}
                      onChange={(e) =>
                        setExerciseData({
                          ...exerciseData,
                          restTime: Number.parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              size="sm"
              type="submit"
              className="text-xs"
              disabled={!selectedExercise || !selectedDay || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando
                </>
              ) : (
                "Guardar ejercicio"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
