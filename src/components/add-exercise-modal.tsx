"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock01Icon,
  Dumbbell03Icon,
  GridIcon,
  WeightScaleIcon,
  ZapIcon,
} from "hugeicons-react";

type AddExerciseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (exercise: {
    name: string;
    sets: number;
    reps: number;
    weight: number;
    duration: number;
    intensity: "Baja" | "Media" | "Alta";
  }) => void;
};

export function AddExerciseModal({
  isOpen,
  onClose,
  onSubmit,
}: AddExerciseModalProps) {
  const [name, setName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState<"Baja" | "Media" | "Alta">(
    "Media"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      sets: Number.parseInt(sets),
      reps: Number.parseInt(reps),
      weight: Number.parseFloat(weight) || 0,
      duration: Number.parseInt(duration) || 0,
      intensity,
    });
    onClose();
    // Reset form
    setName("");
    setSets("");
    setReps("");
    setWeight("");
    setDuration("");
    setIntensity("Media");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-md font-medium">
            Añadir Nuevo Ejercicio
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <div className="col-span-3 relative">
                <Dumbbell03Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 text-xs md:text-sm"
                  placeholder="Nombre del ejercicio"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sets" className="text-right">
                Series
              </Label>
              <div className="col-span-3 relative">
                <GridIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground" />
                <Input
                  id="sets"
                  type="number"
                  min="0"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  className="pl-10"
                  placeholder="Número de series"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reps" className="text-right">
                Repeticiones
              </Label>
              <div className="col-span-3 relative">
                <GridIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground" />
                <Input
                  id="reps"
                  type="number"
                  min="0"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="pl-10"
                  placeholder="Repeticiones por serie"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="weight" className="text-right">
                Peso (kg)
              </Label>
              <div className="col-span-3 relative">
                <WeightScaleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground" />
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="pl-10"
                  placeholder="Peso en kg (opcional)"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duración (min)
              </Label>
              <div className="col-span-3 relative">
                <Clock01Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground" />
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="pl-10"
                  placeholder="Duración en minutos (opcional)"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="intensity" className="text-right">
                Intensidad
              </Label>
              <div className="col-span-3 relative">
                <ZapIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground" />
                <Select
                  onValueChange={(value: "Baja" | "Media" | "Alta") =>
                    setIntensity(value)
                  }
                  defaultValue={intensity}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Selecciona la intensidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baja">Baja</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button className="text-xs" size="sm" type="submit">
              Agregar ejercicio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
