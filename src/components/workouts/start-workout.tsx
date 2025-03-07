"use client";

import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Icons } from "../icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type WorkoutProps = {
  id: string;
  name: string;
  description: string;
  days: { day: string }[];
};

export default function StartWorkout({ workout }: { workout: WorkoutProps }) {
  // const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [exercises, setExercises] = useState<any[]>([]);

  // Parsear los días del entrenamiento desde la descripción
  const workoutData = workout;
  // console.log(workoutData);

  const days = workoutData.days || [];

  useEffect(() => {
    if (selectedDay) {
      const selectedExercises =
        days.find((d) => d.day === selectedDay)?.exercises || [];
      setExercises(selectedExercises);
    }
  }, [selectedDay, days]);

  const handleStartWorkout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/workout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: selectedDay, exercises }),
      });

      if (!response.ok) throw new Error("Error al guardar los ejercicios");
      console.log("Ejercicios guardados correctamente");
    } catch (error) {
      console.error("Error al guardar ejercicios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedDay || exercises.length === 0) return;
  }, [selectedDay, exercises]);

  return (
    <Dialog>
      <DialogTrigger asChild className="mb-8">
        <Button className="text-xs text-white bg-[#DE3163] hover:bg-[#DE3163]/90">
          Comenzar rutina
        </Button>
      </DialogTrigger>
      <DialogContent className="space-y-0 w-full">
        <DialogHeader>
          <DialogTitle>Selecciona el día de entrenamiento</DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            {workout.name}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-2">
          {/* <label className="text-sm font-medium">Dia de entrenamiento</label> */}
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu entrenamiento" />
            </SelectTrigger>
            <SelectContent>
              {days.map((day: any) => (
                <SelectItem key={day.day} value={day.day}>
                  <div className="flex items-center">{day.day}</div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedDay && (
          <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-hide no-scrollbar">
            <div className="grid md:grid-cols-2 gap-6">
              {days
                .find((day: any) => day.day === selectedDay)
                ?.exercises.map((exercise: any) => (
                  <div
                    key={exercise.id}
                    className="border rounded-lg shadow-sm"
                  >
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
                        <p className="text-xs text-muted-foreground mb-1">
                          Sets
                        </p>
                        <p className="font-semibold text-sm">{exercise.sets}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Reps
                        </p>
                        <p className="font-semibold text-sm">
                          {exercise.reps || "Tiempo"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Descanso
                        </p>
                        <p className="font-semibold flex items-center justify-center gap-1 text-sm">
                          {exercise.restTime}s
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            onClick={handleStartWorkout}
            disabled={loading || !selectedDay}
            className="text-xs"
          >
            {loading ? (
              <Icons.spinner className="h-4 w-4 animate-spin" />
            ) : (
              "Iniciar rutina"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
