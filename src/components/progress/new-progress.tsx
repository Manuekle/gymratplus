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
import { cn } from "@/lib/utils/utils";

import { Icons } from "../icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar02Icon } from "@hugeicons/core-free-icons";
interface ProgressProps {
  onSuccess: () => void;
  onRecordAdded?: () => void;
  initialData?: {
    id?: string;
    weight?: number;
    bodyFatPercentage?: number;
    muscleMassPercentage?: number;
    date?: Date;
    notes?: string;
  };
}

export function NewProgress({
  onSuccess,
  initialData,
  onRecordAdded,
}: ProgressProps) {
  const isEditing = !!initialData?.id;
  const [date, setDate] = useState<Date | undefined>(
    initialData?.date || new Date(),
  );
  const [weight, setWeight] = useState<number | undefined>(initialData?.weight);
  const [bodyFat, setBodyFat] = useState<number | undefined>(
    initialData?.bodyFatPercentage,
  );
  const [muscleMass, setMuscleMass] = useState<number | undefined>(
    initialData?.muscleMassPercentage,
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [progressType, setProgressType] = useState<
    "weight" | "bodyFat" | "muscleMass" | ""
  >("");

  const { createProgressRecord, updateProgressRecord, progressData } =
    useProgress();

  const validateNumberInput = (
    value: string,
    min: number = 0,
    max: number = 1000,
  ): number | null => {
    const num = parseFloat(value);
    if (isNaN(num)) return null;
    if (num < min || num > max) return null;
    return num;
  };

  const handleNumberChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<number | undefined>>,
    fieldName: string,
  ) => {
    if (value === "") {
      setter(undefined);
      return;
    }

    const num = validateNumberInput(value);
    if (num !== null) {
      setter(num);
      setError(null);
    } else {
      setError(`Por favor ingresa un valor válido para ${fieldName}`);
    }
  };

  // Check if a progress record of the same type already exists for the selected date
  const checkForDuplicate = (
    type: string,
    value: string | number | undefined,
  ): boolean => {
    if (!value) return false;

    return progressData.some((record) => {
      if (!record.date) return false;

      const recordDate = new Date(record.date).toDateString();
      const selectedDate = date ? date.toDateString() : "";

      return (
        recordDate === selectedDate &&
        ((type === "weight" && record.weight !== undefined) ||
          (type === "bodyFat" && record.bodyFatPercentage !== undefined) ||
          (type === "muscleMass" && record.muscleMassPercentage !== undefined))
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError("La fecha es obligatoria");
      return;
    }

    if (!progressType) {
      setError("Por favor selecciona un tipo de registro");
      return;
    }

    // Validate based on selected type
    if (progressType === "weight" && !weight) {
      setError("Por favor ingresa tu peso");
      return;
    } else if (progressType === "bodyFat" && !bodyFat) {
      setError("Por favor ingresa tu porcentaje de grasa corporal");
      return;
    } else if (progressType === "muscleMass" && !muscleMass) {
      setError("Por favor ingresa tu masa muscular");
      return;
    }

    // Check for duplicate entries
    if (!isEditing) {
      if (progressType === "weight" && checkForDuplicate("weight", weight)) {
        setError("Ya tienes un registro de peso para esta fecha");
        return;
      } else if (
        progressType === "bodyFat" &&
        checkForDuplicate("bodyFat", bodyFat)
      ) {
        setError("Ya tienes un registro de grasa corporal para esta fecha");
        return;
      } else if (
        progressType === "muscleMass" &&
        checkForDuplicate("muscleMass", muscleMass)
      ) {
        setError("Ya tienes un registro de masa muscular para esta fecha");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const data = {
        date: date.toISOString(),
        weight: progressType === "weight" ? (weight ?? undefined) : undefined,
        bodyFatPercentage:
          progressType === "bodyFat" ? (bodyFat ?? undefined) : undefined,
        muscleMassPercentage:
          progressType === "muscleMass" ? (muscleMass ?? undefined) : undefined,
        notes: notes.trim() || undefined,
      };

      if (isEditing && initialData.id) {
        await updateProgressRecord(initialData.id, data);
      } else {
        await createProgressRecord(data);
      }

      // Reset form and close dialog on success
      if (!isEditing) {
        setWeight(undefined);
        setBodyFat(undefined);
        setMuscleMass(undefined);
        setNotes("");
      }

      onSuccess();
      if (onRecordAdded) {
        onRecordAdded();
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      setError(
        "Ocurrió un error al guardar los datos. Por favor, inténtalo de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  // Reset form when dialog is opened/closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form when closing
      setWeight(undefined);
      setBodyFat(undefined);
      setMuscleMass(undefined);
      setNotes("");
      setProgressType("");
      setError(null);
    }
    setIsOpen(open);
  };

  const getInputValue = (value: number | undefined) => {
    return value === undefined ? "" : String(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="default" className="text-xs px-4">
          Añadir registro
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-auto pt-8 xl:pt-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-heading">
            {isEditing ? "Editar registro" : "Nuevo registro de progreso"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Selecciona el tipo de registro y completa los datos
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="text-xs md:text-xs">
              Tipo de registro <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={progressType === "weight" ? "default" : "outline"}
                className="h-10 text-xs"
                onClick={() => setProgressType("weight")}
              >
                Peso
              </Button>
              <Button
                type="button"
                variant={progressType === "bodyFat" ? "default" : "outline"}
                className="h-10 text-xs"
                onClick={() => setProgressType("bodyFat")}
              >
                Grasa
              </Button>
              <Button
                type="button"
                variant={progressType === "muscleMass" ? "default" : "outline"}
                className="h-10 text-xs"
                onClick={() => setProgressType("muscleMass")}
              >
                Músculo
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs md:text-xs" htmlFor="date">
              Fecha
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal text-xs md:text-xs",
                    !date && "text-muted-foreground",
                  )}
                >
                  <HugeiconsIcon
                    icon={Calendar02Icon}
                    className="mr-2 h-4 w-4"
                  />
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

          {progressType === "weight" && (
            <div className="space-y-2">
              <Label className="text-xs md:text-xs" htmlFor="weight">
                Peso (kg) <span className="text-red-500">*</span>
              </Label>
              <Input
                className="text-xs md:text-xs"
                id="weight"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Ej: 75.5"
                value={getInputValue(weight)}
                onChange={(e) =>
                  handleNumberChange(e.target.value, setWeight, "el peso")
                }
              />
            </div>
          )}

          {progressType === "bodyFat" && (
            <div className="space-y-2">
              <Label className="text-xs md:text-xs" htmlFor="bodyFat">
                Grasa corporal (%) <span className="text-red-500">*</span>
              </Label>
              <Input
                className="text-xs md:text-xs"
                id="bodyFat"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                step="0.1"
                min="0"
                max="100"
                placeholder="Ej: 18.5"
                value={getInputValue(bodyFat)}
                onChange={(e) =>
                  handleNumberChange(
                    e.target.value,
                    setBodyFat,
                    "el porcentaje de grasa corporal",
                  )
                }
              />
            </div>
          )}

          {progressType === "muscleMass" && (
            <div className="space-y-2">
              <Label className="text-xs md:text-xs" htmlFor="muscleMass">
                Masa muscular (kg) <span className="text-red-500">*</span>
              </Label>
              <Input
                className="text-xs md:text-xs"
                id="muscleMass"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                step="0.1"
                placeholder="Ej: 42.3"
                value={getInputValue(muscleMass)}
                onChange={(e) =>
                  handleNumberChange(
                    e.target.value,
                    setMuscleMass,
                    "la masa muscular",
                  )
                }
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs md:text-xs" htmlFor="notes">
              Notas
            </Label>
            <Textarea
              className="resize-none text-xs md:text-xs"
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
              variant="outline"
              size="default"
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              size="default"
              className="text-xs px-6"
              type="submit"
              disabled={
                isSubmitting ||
                !date ||
                !progressType ||
                (progressType === "weight" && weight === undefined) ||
                (progressType === "bodyFat" && bodyFat === undefined) ||
                (progressType === "muscleMass" && muscleMass === undefined)
              }
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
