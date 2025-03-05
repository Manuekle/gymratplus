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

// import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "../ui/label";

interface Exercise {
  id: string;
  name: string;
}

export default function WorkoutExercise({
  workoutId,
  isOpen,
  onClose,
}: {
  workoutId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [exerciseData, setExerciseData] = useState({
    sets: "",
    reps: "",
    weight: "",
    restTime: "",
    notes: "",
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

    const res = await fetch(`/api/workouts/${workoutId}/exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseId: selectedExercise, ...exerciseData }),
    });

    if (res.ok) {
      router.refresh();
      setExerciseData({
        sets: "",
        reps: "",
        weight: "",
        restTime: "",
        notes: "",
      });
      onClose();
    }
  };

  const commonInputClasses = "text-sm";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Añadir Nuevo Ejercicio
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Ingresa los datos del ejercicio que deseas agregar
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="selectedExercise" className="text-right">
                Ejercicio:
              </Label>
              <div className="col-span-3 relative">
                <Select
                  onValueChange={setSelectedExercise}
                  defaultValue={selectedExercise || ""}
                >
                  <SelectTrigger id="endTime" className={commonInputClasses}>
                    <div className="flex flex-row items-center gap-4">
                      <SelectValue placeholder="Seleccionar ejercicio" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {exercises.map((exercise) => (
                      <SelectItem key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sets" className="text-right">
                Sets:
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="sets"
                  type="number"
                  name="sets"
                  placeholder="Sets"
                  value={exerciseData.sets}
                  onChange={(e) =>
                    setExerciseData({ ...exerciseData, sets: +e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reps" className="text-right">
                Reps:
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="reps"
                  type="number"
                  name="reps"
                  placeholder="Reps"
                  value={exerciseData.reps}
                  onChange={(e) =>
                    setExerciseData({ ...exerciseData, reps: +e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="restTime" className="text-right">
                Descanso:
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="restTime"
                  type="number"
                  name="restTime"
                  placeholder="Descanso (s)"
                  value={exerciseData.restTime}
                  onChange={(e) =>
                    setExerciseData({
                      ...exerciseData,
                      restTime: +e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="weight" className="text-right">
                Peso:
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="weight"
                  type="number"
                  name="weight"
                  placeholder="Peso (kg)"
                  value={exerciseData.weight}
                  onChange={(e) =>
                    setExerciseData({
                      ...exerciseData,
                      weight: +e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Nota:
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="notes"
                  type="text"
                  name="notes"
                  placeholder="Notas"
                  value={exerciseData.notes}
                  onChange={(e) =>
                    setExerciseData({ ...exerciseData, notes: e.target.value })
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
