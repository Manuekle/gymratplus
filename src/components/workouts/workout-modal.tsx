"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock04Icon } from "hugeicons-react";

export default function WorkoutModal({ onAddExercise }) {
  const [open, setOpen] = useState(false);
  const [exercise, setExercise] = useState({
    name: "",
    sets: "",
    reps: "",
    category: "Strength",
  });

  const handleChange = (e) => {
    setExercise({ ...exercise, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (value) => {
    setExercise({ ...exercise, category: value });
  };

  const commonInputClasses = "text-sm";

  const handleSubmit = () => {
    if (!exercise.name || !exercise.sets || !exercise.reps)
      return alert("Todos los campos son obligatorios");

    onAddExercise({ id: Date.now().toString(), ...exercise });
    setExercise({ name: "", sets: "", reps: "", category: "Strength" });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="mb-8">
        <Button onClick={() => setOpen(true)} variant="outline">
          Nuevo ejercicio
        </Button>
      </DialogTrigger>
      <DialogContent className="space-y-0 w-full">
        <DialogHeader>
          <DialogTitle>Agregar nuevo ejercicio</DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Ingresa los datos del ejercicio que deseas agregar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Label htmlFor="name" className="text-right">
            Nombre
          </Label>
          <Input
            type="text"
            name="name"
            value={exercise.name}
            onChange={handleChange}
            placeholder="Ej: Sentadilla"
          />
        </div>
        <div className="space-y-4">
          <Label htmlFor="sets" className="text-right">
            Series
          </Label>
          <Input
            type="number"
            name="sets"
            value={exercise.sets}
            onChange={handleChange}
            placeholder="Ej: 4"
          />
        </div>
        <div className="space-y-4">
          <Label htmlFor="reps" className="text-right">
            Repeticiones
          </Label>
          <Input
            type="number"
            name="reps"
            value={exercise.reps}
            onChange={handleChange}
            placeholder="Ej: 10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reps">Categoría</Label>
          <Select
            name="category"
            onValueChange={handleCategoryChange}
            value={exercise.category}
          >
            <SelectTrigger className={commonInputClasses}>
              <div className="flex flex-row items-center gap-4">
                {/* <Clock04Icon size={18} color="#7a7a70" variant="stroke" /> */}
                <SelectValue placeholder="Selecciona una categoría" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Strength">Strength</SelectItem>
                <SelectItem value="Hypertrophy">Hypertrophy</SelectItem>
                <SelectItem value="Endurance">Endurance</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            type="submit"
            className="text-xs"
            size="sm"
          >
            Agregar ejercicio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
