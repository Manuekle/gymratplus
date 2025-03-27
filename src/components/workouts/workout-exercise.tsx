"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "../ui/label";
import { DaySelectButton } from "../workout/day-select-button";

interface Exercise {
  id: string;
  name: string;
}

interface WorkoutExerciseProps {
  workoutId: string;
  isOpen: boolean;
  onClose: () => void;
  days: string[];
}

export default function WorkoutExercise({
  workoutId,
  isOpen,
  onClose,
  days,
}: WorkoutExerciseProps) {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [exerciseData, setExerciseData] = useState({
    sets: "",
    reps: "",
    restTime: "",
  });

  useEffect(() => {
    const fetchExercises = async () => {
      const res = await fetch("/api/exercises");
      if (res.ok) {
        const data = await res.json();
        setExercises(data);
      }
    };

    fetchExercises();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedExercise) return alert("Selecciona un ejercicio");
    if (!selectedDay) return alert("Selecciona un día");

    const res = await fetch(`/api/workouts/${workoutId}/exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exerciseId: selectedExercise,
        ...exerciseData,
        notes: selectedDay,
      }),
    });

    if (res.ok) {
      router.refresh();
      setExerciseData({
        sets: "",
        reps: "",
        restTime: "",
      });
      setSelectedDay("");
      onClose();
    }
  };

  const commonInputClasses = "text-sm";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Añadir Nuevo Ejercicio
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Ingresa los datos del ejercicio que deseas agregar
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="selectedExercise"
                className="text-right text-xs md:text-sm"
              >
                Ejercicio:
              </Label>
              <div className="col-span-3 relative">
                <Select
                  onValueChange={setSelectedExercise}
                  defaultValue={selectedExercise || ""}
                >
                  <SelectTrigger id="endTime" className={commonInputClasses}>
                    <div className="flex flex-row items-center gap-4 text-xs md:text-sm">
                      <SelectValue placeholder="Seleccionar ejercicio" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {exercises.map((exercise) => (
                      <SelectItem
                        className="text-xs md:text-sm"
                        key={exercise.id}
                        value={exercise.id}
                      >
                        {exercise.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs md:text-sm">Día:</Label>
              <div className="col-span-3">
                <DaySelectButton
                  days={days}
                  value={selectedDay}
                  onChange={setSelectedDay}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sets" className="text-right text-xs md:text-sm">
                Sets:
              </Label>
              <div className="col-span-3 relative">
                <Input
                  className="text-xs md:text-sm"
                  id="sets"
                  type="number"
                  min="0"
                  name="sets"
                  placeholder="Sets"
                  value={exerciseData.sets}
                  onChange={(e) =>
                    setExerciseData({ ...exerciseData, sets: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reps" className="text-right text-xs md:text-sm">
                Reps:
              </Label>
              <div className="col-span-3 relative">
                <Input
                  className="text-xs md:text-sm"
                  id="reps"
                  type="number"
                  min="0"
                  name="reps"
                  placeholder="Reps"
                  value={exerciseData.reps}
                  onChange={(e) =>
                    setExerciseData({ ...exerciseData, reps: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="restTime"
                className="text-right text-xs md:text-sm"
              >
                Descanso:
              </Label>
              <div className="col-span-3 relative">
                <Input
                  className="text-xs md:text-sm"
                  id="restTime"
                  type="number"
                  min="0"
                  name="restTime"
                  placeholder="Descanso (s)"
                  value={exerciseData.restTime}
                  onChange={(e) =>
                    setExerciseData({
                      ...exerciseData,
                      restTime: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" className="text-xs" type="submit">
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
