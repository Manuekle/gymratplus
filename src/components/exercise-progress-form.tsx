"use client";

import type React from "react";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useExerciseProgress } from "@/hooks/use-exercise-progress";
import { Icons } from "./icons";

interface ExerciseProgressFormProps {
  onClose: () => void;
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

export default function ExerciseProgressForm({
  onClose,
  onSuccess,
  initialData,
}: ExerciseProgressFormProps) {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <Button
          size="sm"
          onClick={onClose}
          className="text-xs absolute top-2 right-2"
        >
          <X size={20} />
        </Button>

        <h2 className="text-xl font-bold mb-4">
          {isEditing ? "Editar registro" : "Nuevo registro de ejercicios"}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
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
            <Label htmlFor="benchPress">Press banca (kg)</Label>
            <Input
              id="benchPress"
              type="number"
              step="0.5"
              placeholder="Ej: 80"
              value={benchPress}
              onChange={(e) => setBenchPress(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="squat">Sentadilla (kg)</Label>
            <Input
              id="squat"
              type="number"
              step="0.5"
              placeholder="Ej: 100"
              value={squat}
              onChange={(e) => setSquat(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadlift">Peso muerto (kg)</Label>
            <Input
              id="deadlift"
              type="number"
              step="0.5"
              placeholder="Ej: 120"
              value={deadlift}
              onChange={(e) => setDeadlift(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Observaciones adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
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
      </div>
    </div>
  );
}
