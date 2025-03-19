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
import { cn } from "@/lib/utils";
import { useGoals, type Goal, type GoalType } from "@/hooks/use-goals";
import { Icons } from "./icons";

interface GoalFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Partial<Goal>;
}

export default function GoalForm({
  onClose,
  onSuccess,
  initialData,
}: GoalFormProps) {
  const isEditing = !!initialData?.id;
  const [type, setType] = useState<GoalType>(
    (initialData?.type as GoalType) || "weight"
  );
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [initialValue, setInitialValue] = useState<string>(
    initialData?.initialValue?.toString() || ""
  );
  const [targetValue, setTargetValue] = useState<string>(
    initialData?.targetValue?.toString() || ""
  );
  const [unit, setUnit] = useState(initialData?.unit || "kg");
  const [exerciseType, setExerciseType] = useState(
    initialData?.exerciseType || ""
  );
  const [measurementType, setMeasurementType] = useState(
    initialData?.measurementType || ""
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.startDate ? new Date(initialData.startDate) : new Date()
  );
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    initialData?.targetDate ? new Date(initialData.targetDate) : undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      onSuccess();
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4">
          {isEditing ? "Editar objetivo" : "Nuevo objetivo"}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de objetivo</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as GoalType)}
              disabled={isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight">Peso</SelectItem>
                <SelectItem value="strength">Fuerza</SelectItem>
                <SelectItem value="measurement">Medidas corporales</SelectItem>
                <SelectItem value="activity">Actividad</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Ej: Perder 5kg"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Describe tu objetivo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initialValue">Valor inicial</Label>
              <Input
                id="initialValue"
                type="number"
                step="0.1"
                placeholder={`Ej: 80`}
                value={initialValue}
                onChange={(e) => setInitialValue(e.target.value)}
                disabled={isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetValue">Valor objetivo</Label>
              <Input
                id="targetValue"
                type="number"
                step="0.1"
                placeholder={`Ej: 75`}
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unidad</Label>
            <Input
              id="unit"
              placeholder="Ej: kg, cm, veces/semana"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>

          {type === "strength" && (
            <div className="space-y-2">
              <Label htmlFor="exerciseType">Ejercicio</Label>
              <Select value={exerciseType} onValueChange={setExerciseType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un ejercicio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="benchPress">Press banca</SelectItem>
                  <SelectItem value="squat">Sentadilla</SelectItem>
                  <SelectItem value="deadlift">Peso muerto</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {type === "measurement" && (
            <div className="space-y-2">
              <Label htmlFor="measurementType">Parte del cuerpo</Label>
              <Select
                value={measurementType}
                onValueChange={setMeasurementType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una parte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="waist">Cintura</SelectItem>
                  <SelectItem value="chest">Pecho</SelectItem>
                  <SelectItem value="arms">Brazos</SelectItem>
                  <SelectItem value="legs">Piernas</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
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
              <Label htmlFor="targetDate">Fecha objetivo (opcional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !targetDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
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
