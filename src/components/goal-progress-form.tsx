"use client";

import type React from "react";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar02Icon, Cancel01Icon } from "hugeicons-react";
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
import { useGoals, type Goal } from "@/hooks/use-goals";
import { Icons } from "./icons";

interface GoalProgressFormProps {
  goal: Goal;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GoalProgressForm({
  goal,
  onClose,
  onSuccess,
}: GoalProgressFormProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [value, setValue] = useState<string>(
    goal.currentValue?.toString() || ""
  );
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addProgressUpdate } = useGoals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación básica
    if (!date) {
      setError("La fecha es obligatoria");
      return;
    }

    if (!value) {
      setError("El valor es obligatorio");
      return;
    }

    setIsSubmitting(true);

    try {
      await addProgressUpdate(goal.id!, {
        value: Number.parseFloat(value),
        date: date.toISOString(),
        notes,
      });

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
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-gray-700"
        >
          <Cancel01Icon size={20} />
        </Button>

        <h2 className="text-xl font-semibold  mb-4">Actualizar progreso</h2>
        <p className="text-muted-foreground mb-4">{goal.title}</p>

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
            <Label htmlFor="value">Valor actual ({goal.unit || ""})</Label>
            <Input
              id="value"
              type="number"
              step="0.1"
              placeholder={`Ej: ${goal.targetValue || ""}`}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
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
