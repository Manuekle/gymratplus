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
import { useProgress } from "@/hooks/use-progress";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";

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
    weight?: number;
    bodyFatPercentage?: number;
    muscleMassPercentage?: number;
    date?: Date;
    notes?: string;
  };
}

export function NewProgress({ onSuccess, initialData }: ProgressProps) {
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
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="text-xs px-4">
          Añadir registro
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold  tracking-heading">
            Nuevo registro de progreso
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Ingresa los datos de tu progreso
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
            <Label className="text-xs md:text-sm" htmlFor="weight">
              Peso (kg)
            </Label>
            <Input
              className="text-xs md:text-sm"
              id="weight"
              type="number"
              step="0.1"
              placeholder="Ej: 75.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs md:text-sm" htmlFor="bodyFat">
              Grasa corporal (%)
            </Label>
            <Input
              className="text-xs md:text-sm"
              id="bodyFat"
              type="number"
              step="0.1"
              placeholder="Ej: 18.5"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs md:text-sm" htmlFor="muscleMass">
              Masa muscular (%)
            </Label>
            <Input
              className="text-xs md:text-sm"
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
              className="text-xs md:text-sm"
              id="notes"
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
              type="submit"
              disabled={isSubmitting || !date}
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
