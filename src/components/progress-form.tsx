"use client";

import type React from "react";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Cancel01Icon } from "hugeicons-react";
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
import { useProgress } from "@/hooks/use-progress";
import { Calendar01Icon } from "hugeicons-react";
import { Icons } from "./icons";

interface ProgressFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    id?: string;
    weight?: number;
    bodyFatPercentage?: number;
    muscleMassPercentage?: number;
    date?: Date;
    notes?: string;
  };
}

export default function ProgressForm({
  onClose,
  onSuccess,
  initialData,
}: ProgressFormProps) {
  const isEditing = !!initialData?.id;
  const [date, setDate] = useState<Date | undefined>(
    initialData?.date || new Date()
  );
  const [weight, setWeight] = useState<string>(
    initialData?.weight?.toString() || ""
  );
  const [bodyFat, setBodyFat] = useState<string>(
    initialData?.bodyFatPercentage?.toString() || ""
  );
  const [muscleMass, setMuscleMass] = useState<string>(
    initialData?.muscleMassPercentage?.toString() || ""
  );
  const [notes, setNotes] = useState<string>(initialData?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createProgressRecord, updateProgressRecord } = useProgress();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación básica
    if (!date) {
      setError("La fecha es obligatoria");
      return;
    }

    if (!weight && !bodyFat && !muscleMass) {
      setError("Debes proporcionar al menos un valor");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        date: date.toISOString(),
        weight: weight ? Number.parseFloat(weight) : undefined,
        bodyFatPercentage: bodyFat ? Number.parseFloat(bodyFat) : undefined,
        muscleMassPercentage: muscleMass
          ? Number.parseFloat(muscleMass)
          : undefined,
        notes,
      };

      if (isEditing && initialData.id) {
        await updateProgressRecord(initialData.id, data);
      } else {
        await createProgressRecord(data);
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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-gray-700"
        >
          <Cancel01Icon size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4">
          {isEditing ? "Editar registro" : "Nuevo registro de progreso"}
        </h2>

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
                  <Calendar01Icon className="mr-2 h-4 w-4" />
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
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="Ej: 75.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bodyFat">Grasa corporal (%)</Label>
            <Input
              id="bodyFat"
              type="number"
              step="0.1"
              placeholder="Ej: 18.5"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="muscleMass">Masa muscular (%)</Label>
            <Input
              id="muscleMass"
              type="number"
              step="0.1"
              placeholder="Ej: 42.3"
              value={muscleMass}
              onChange={(e) => setMuscleMass(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs md:text-sm" htmlFor="notes">
              Notas
            </Label>
            <Textarea
              id="notes"
              className="text-xs md:text-sm"
              placeholder="Observaciones adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <div className=" text-red-500 text-xs text-center">{error}</div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              size="sm"
              className="text-xs px-6"
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className="text-xs px-6"
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
      </div>
    </div>
  );
}
