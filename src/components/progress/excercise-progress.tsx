"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { useExerciseProgress } from "@/hooks/use-exercise-progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar02Icon } from "hugeicons-react";
import { Icons } from "../icons";
interface ProgressProps {
  onSuccess: () => void;
  initialData?: {
    id?: string;
    benchPress?: number;
    squat?: number;
    deadlift?: number;
    date?: Date;
    notes?: string;
  };
}

export function ExerciseProgress({ onSuccess, initialData }: ProgressProps) {
  const isEditing = !!initialData?.id;
  const [date, setDate] = useState<Date | undefined>(
    initialData?.date || new Date()
  );
  const [benchPress, setBenchPress] = useState<string>(
    initialData?.benchPress?.toString() || ""
  );
  const [squat, setSquat] = useState<string>(
    initialData?.squat?.toString() || ""
  );
  const [deadlift, setDeadlift] = useState<string>(
    initialData?.deadlift?.toString() || ""
  );
  const [notes, setNotes] = useState<string>(initialData?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createExerciseProgressRecord, updateExerciseProgressRecord } =
    useExerciseProgress();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación básica
    if (!date) {
      setError("La fecha es obligatoria");
      return;
    }

    if (!benchPress && !squat && !deadlift) {
      setError("Debes proporcionar al menos un valor de ejercicio");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        date: date.toISOString(),
        benchPress: benchPress ? Number.parseFloat(benchPress) : undefined,
        squat: squat ? Number.parseFloat(squat) : undefined,
        deadlift: deadlift ? Number.parseFloat(deadlift) : undefined,
        notes,
      };

      if (isEditing && initialData.id) {
        await updateExerciseProgressRecord(initialData.id, data);
      } else {
        await createExerciseProgressRecord(data);
      }

      onSuccess();
    } catch (error) {
      console.error("Error al guardar:", error);
      setError("Ocurrió un error al guardar los datos");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="text-xs px-4">
          Añadir
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {isEditing ? "Editar registro" : "Nuevo registro de ejercicios"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Actualiza los datos del registro de ejercicios"
              : "Añade un nuevo registro de ejercicios"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs md:text-sm" htmlFor="date">
              Fecha
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal text-xs md:text-sm",
                    !date && "text-muted-foreground"
                  )}
                >
                  <Calendar02Icon className="mr-2 h-4 w-4" />
                  {date ? (
                    format(date, "PPP", { locale: es })
                  ) : (
                    <span>Selecciona una fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-xs md:text-sm" htmlFor="benchPress">
              Press banca (kg)
            </Label>
            <Input
              className="text-xs md:text-sm"
              id="benchPress"
              type="number"
              step="0.5"
              placeholder="Ej: 80"
              value={benchPress}
              onChange={(e) => setBenchPress(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs md:text-sm" htmlFor="squat">
              Sentadilla (kg)
            </Label>
            <Input
              className="text-xs md:text-sm"
              id="squat"
              type="number"
              step="0.5"
              placeholder="Ej: 100"
              value={squat}
              onChange={(e) => setSquat(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs md:text-sm" htmlFor="deadlift">
              Peso muerto (kg)
            </Label>
            <Input
              className="text-xs md:text-sm"
              id="deadlift"
              type="number"
              step="0.5"
              placeholder="Ej: 120"
              value={deadlift}
              onChange={(e) => setDeadlift(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs md:text-sm" htmlFor="notes">
              Notas
            </Label>
            <Textarea
              className="text-xs md:text-sm"
              id="notes"
              placeholder="Observaciones adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          {error && <p className="text-red-500 text-xs md:text-sm">{error}</p>}

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              size="sm"
              className="text-xs px-4"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Guardando
                </>
              ) : isEditing ? (
                "Actualizar"
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
