// WorkoutPersonalize.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Icons } from "@/components/icons";
import { ScrollArea } from "../ui/scroll-area";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
}

export function WorkoutPersonalize() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [name, setName] = useState("");

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/exercises");
        if (!response.ok) {
          throw new Error("Failed to fetch exercises");
        }
        const data = await response.json();
        setExercises(data);
      } catch (error) {
        console.error("Error fetching exercises:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, []);

  const handleExerciseSelection = (exerciseId: string) => {
    if (selectedExercises.includes(exerciseId)) {
      setSelectedExercises(selectedExercises.filter((id) => id !== exerciseId));
    } else {
      setSelectedExercises([...selectedExercises, exerciseId]);
    }
  };

  // WorkoutPersonalize.tsx
  // ...

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/personalized-workout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exerciseIds: selectedExercises,
          name: name || "Entrenamiento Personalizado", // Pass the name, with a default if empty
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || "Failed to create personalized workout"
        );
      }

      toast.success("Entrenamiento creado con éxito");
      window.location.reload();
    } catch (error) {
      console.error("Error creating personalized workout:", error);
      toast.error("Error al crear el entrenamiento");
    } finally {
      setSubmitting(false);
    }
  };

  // ...

  const muscleGroups = [
    "all",
    ...new Set(exercises.map((exercise) => exercise.muscleGroup)),
  ];

  const filteredExercises =
    muscleFilter === "all"
      ? exercises
      : exercises.filter((exercise) => exercise.muscleGroup === muscleFilter);

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="text-xs" size="sm" variant="outline">
            Personalizar rutina
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className="pt-2">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Selecciona los ejercicios para tu rutina
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Crea tu plan de entrenamiento personalizado
            </DialogDescription>
          </DialogHeader>
          <div className="mb-4 flex flex-col gap-4">
            <div className="space-y-2">
              <Label className="text-xs md:text-sm" htmlFor="workout-name">
                Nombre del entrenamiento
              </Label>
              <Input
                className="text-xs md:text-sm"
                id="workout-name"
                placeholder="Ej: Mi rutina de hipertrofia"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Select value={muscleFilter} onValueChange={setMuscleFilter}>
                <SelectTrigger className="w-full text-xs md:text-sm">
                  <SelectValue placeholder="Filtrar por grupo muscular" />
                </SelectTrigger>
                <SelectContent>
                  {muscleGroups.map((group) => (
                    <SelectItem
                      className="text-xs md:text-sm"
                      key={group}
                      value={group}
                    >
                      {group === "all" ? "Todos" : group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {loading ? (
            <p>Cargando ejercicios...</p>
          ) : (
            <ScrollArea className="h-[200px] mt-0 pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className={`px-4 py-1 border rounded-full cursor-pointer items-center flex justify-center ${
                      selectedExercises.includes(exercise.id)
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary"
                    }`}
                    onClick={() => handleExerciseSelection(exercise.id)}
                  >
                    <h3 className="font-semibold text-xs text-center">
                      {exercise.name}
                    </h3>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button
              size="sm"
              className="text-xs px-4 mt-4"
              onClick={handleSubmit}
              disabled={submitting || selectedExercises.length === 0}
            >
              {submitting ? (
                <>
                  <Icons.spinner className="h-2 w-2 animate-spin" />
                  Generando
                </>
              ) : (
                "Generar rutina"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
