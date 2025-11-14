"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGoals, type Goal, type GoalType } from "@/hooks/use-goals";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils/utils";

import { Icons } from "../icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar02Icon } from "@hugeicons/core-free-icons";
interface GoalProps {
  onSuccess: () => void;
  initialData?: Partial<Goal>;
}

export function NewGoal({ onSuccess, initialData }: GoalProps) {
  const isEditing = !!initialData?.id;
  const [type, setType] = useState<GoalType>(
    (initialData?.type as GoalType) || "weight",
  );
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [initialValue, setInitialValue] = useState<string>(
    initialData?.initialValue?.toString() || "",
  );
  const [targetValue, setTargetValue] = useState<string>(
    initialData?.targetValue?.toString() || "",
  );
  const [unit, setUnit] = useState(initialData?.unit || "");
  const [exerciseType, setExerciseType] = useState(
    initialData?.exerciseType || "",
  );
  const [measurementType, setMeasurementType] = useState(
    initialData?.measurementType || "",
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.startDate ? new Date(initialData.startDate) : new Date(),
  );
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    initialData?.targetDate ? new Date(initialData.targetDate) : undefined,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const { createGoal, updateGoal } = useGoals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación básica
    if (!title) {
      setError("El título es obligatorio");
      return;
    }

    if (!type) {
      setError("El tipo de objetivo es obligatorio");
      return;
    }

    if (!startDate) {
      setError("La fecha de inicio es obligatoria");
      return;
    }

    setIsSubmitting(true);

    try {
      const data: Partial<Goal> = {
        type,
        title,
        description,
        initialValue: initialValue
          ? Number.parseFloat(initialValue)
          : undefined,
        targetValue: targetValue ? Number.parseFloat(targetValue) : undefined,
        unit,
        startDate: startDate.toISOString(),
        targetDate: targetDate ? targetDate.toISOString() : undefined,
      };

      // Añadir campos específicos según el tipo
      if (type === "strength") {
        data.exerciseType = exerciseType;
      } else if (type === "measurement") {
        data.measurementType = measurementType;
      }

      if (isEditing && initialData.id) {
        await updateGoal(initialData.id, data);
      } else {
        await createGoal(data as Goal);
      }

      setOpen(false); // Cierra el diálogo
      await onSuccess(); // Espera el refresco del dashboard
    } catch (error) {
      console.error("Error al guardar:", error);
      setError("Ocurrió un error al guardar los datos");
    } finally {
      setIsSubmitting(false);
    }
  };

  // const getTypeLabel = (type: GoalType) => {
  //   switch (type) {
  //     case "weight":
  //       return "Peso";
  //     case "strength":
  //       return "Fuerza";
  //     case "measurement":
  //       return "Medidas corporales";
  //     case "activity":
  //       return "Actividad";
  //     default:
  //       return type;
  //   }
  // };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs px-4">
          Nuevo objetivo
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-auto pt-8 xl:pt-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold  tracking-heading">
            {isEditing ? "Editar objetivo" : "Nuevo objetivo"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Actualiza los datos de tu objetivo"
              : "Ingresa los datos de tu nuevo objetivo"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="text-xs md:text-xs" htmlFor="type">
              Tipo de objetivo
            </Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as GoalType)}
              disabled={isEditing}
            >
              <SelectTrigger className="text-xs md:text-xs">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="text-xs md:text-xs" value="weight">
                  Peso
                </SelectItem>
                <SelectItem className="text-xs md:text-xs" value="strength">
                  Fuerza
                </SelectItem>
                <SelectItem className="text-xs md:text-xs" value="measurement">
                  Medidas corporales
                </SelectItem>
                <SelectItem className="text-xs md:text-xs" value="activity">
                  Actividad
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs md:text-xs" htmlFor="title">
              Título
            </Label>
            <Input
              className="text-xs md:text-xs"
              id="title"
              placeholder="Ej: Perder 5kg"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs md:text-xs" htmlFor="description">
              Descripción (opcional)
            </Label>
            <Textarea
              className="text-xs md:text-xs"
              id="description"
              placeholder="Describe tu objetivo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs md:text-xs" htmlFor="initialValue">
                Valor inicial
              </Label>
              <Input
                className="text-xs md:text-xs"
                id="initialValue"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={`Ej: 80`}
                value={initialValue}
                onChange={(e) => setInitialValue(e.target.value)}
                disabled={isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs md:text-xs" htmlFor="targetValue">
                Valor objetivo
              </Label>
              <Input
                className="text-xs md:text-xs"
                id="targetValue"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={`Ej: 75`}
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs md:text-xs">Unidad</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="w-full text-xs md:text-xs">
                <SelectValue placeholder="Selecciona una unidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="lb">lb</SelectItem>
                <SelectItem value="cm">cm</SelectItem>
                <SelectItem value="m">m</SelectItem>
                <SelectItem value="veces/semana">veces/semana</SelectItem>
                <SelectItem value="minutos">minutos</SelectItem>
                <SelectItem value="horas">horas</SelectItem>
                <SelectItem value="días">días</SelectItem>
                <SelectItem value="semanas">semanas</SelectItem>
                <SelectItem value="meses">meses</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "strength" && (
            <div className="space-y-2">
              <Label className="text-xs md:text-xs" htmlFor="exerciseType">
                Ejercicio
              </Label>
              <Select value={exerciseType} onValueChange={setExerciseType}>
                <SelectTrigger className="text-xs md:text-xs">
                  <SelectValue placeholder="Selecciona un ejercicio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="text-xs md:text-xs" value="benchPress">
                    Press banca
                  </SelectItem>
                  <SelectItem className="text-xs md:text-xs" value="squat">
                    Sentadilla
                  </SelectItem>
                  <SelectItem className="text-xs md:text-xs" value="deadlift">
                    Peso muerto
                  </SelectItem>
                  <SelectItem className="text-xs md:text-xs" value="other">
                    Otro
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {type === "measurement" && (
            <div className="space-y-2">
              <Label className="text-xs md:text-xs" htmlFor="measurementType">
                Parte del cuerpo
              </Label>
              <Select
                value={measurementType}
                onValueChange={setMeasurementType}
              >
                <SelectTrigger className="text-xs md:text-xs">
                  <SelectValue placeholder="Selecciona una parte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="text-xs md:text-xs" value="waist">
                    Cintura
                  </SelectItem>
                  <SelectItem className="text-xs md:text-xs" value="chest">
                    Pecho
                  </SelectItem>
                  <SelectItem className="text-xs md:text-xs" value="arms">
                    Brazos
                  </SelectItem>
                  <SelectItem className="text-xs md:text-xs" value="legs">
                    Piernas
                  </SelectItem>
                  <SelectItem className="text-xs md:text-xs" value="other">
                    Otro
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs md:text-xs" htmlFor="startDate">
                Fecha de inicio
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal text-xs md:text-xs",
                      !startDate && "text-muted-foreground",
                    )}
                  >
                    <HugeiconsIcon
                      icon={Calendar02Icon}
                      className="mr-2 h-4 w-4"
                    />
                    {startDate ? (
                      format(startDate, "PPP", { locale: es })
                    ) : (
                      <span>Selecciona una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-xs md:text-xs" htmlFor="targetDate">
                Fecha objetivo (opcional)
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal text-xs md:text-xs",
                      !targetDate && "text-muted-foreground",
                    )}
                  >
                    <HugeiconsIcon
                      icon={Calendar02Icon}
                      className="mr-2 h-4 w-4"
                    />
                    {targetDate ? (
                      format(targetDate, "PPP", { locale: es })
                    ) : (
                      <span>Selecciona una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={targetDate}
                    onSelect={setTargetDate}
                    initialFocus
                    locale={es}
                    disabled={(date) =>
                      date < new Date() ||
                      (startDate ? date < startDate : false)
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <DialogFooter className="pt-2">
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
