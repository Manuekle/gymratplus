"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGoals, type Goal } from "@/hooks/use-goals";
import { useSession } from "next-auth/react";

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

import { Icons } from "../icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon } from "@hugeicons/core-free-icons";
interface GoalProps {
  onSuccess: () => void;
  goal: Goal;
}

export function UpdateGoal({ onSuccess, goal }: GoalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [value, setValue] = useState<string>(
    goal.currentValue?.toString() || "",
  );
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const { addProgressUpdate } = useGoals();
  const { data: session } = useSession();

  // Chequeo de dueño
  const isOwner =
    session?.user?.id && goal.userId && session.user.id === goal.userId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isOwner) {
      setError(
        "No tienes permiso para actualizar este objetivo. Por favor, revisa tu sesión.",
      );
      return;
    }
    // Validación básica
    if (!date) {
      setError("La fecha es obligatoria");
      return;
    }
    if (!value) {
      setError("El valor es obligatorio");
      return;
    }
    // LOGS DE DEPURACIÓN
    console.log("goal.id:", goal.id);
    console.log("goal.userId:", goal.userId);
    console.log("session.user.id:", session?.user?.id);
    console.log("Body enviado:", {
      value: Number.parseFloat(value),
      date: date?.toISOString(),
      notes,
    });
    setIsSubmitting(true);
    try {
      if (!goal.id) {
        throw new Error("ID de objetivo inválido");
      }
      const result = await addProgressUpdate(goal.id, {
        value: Number.parseFloat(value),
        date: date.toISOString(),
        notes,
      });
      if (result) {
        setOpen(false); // Cierra el diálogo
        onSuccess(); // Refresca la lista
      }
    } catch (error: unknown) {
      console.error("Error al guardar:", error);
      if (error instanceof Error) {
        if (error.message === "Objetivo no encontrado") {
          setError(
            "No se pudo encontrar el objetivo. Por favor, recarga la página e intenta de nuevo.",
          );
        } else if (error.message === "ID de objetivo inválido") {
          setError(
            "ID de objetivo inválido. Por favor, recarga la página e intenta de nuevo.",
          );
        } else {
          setError(
            "Ocurrió un error al guardar los datos. Por favor, inténtalo de nuevo.",
          );
        }
      } else {
        setError("Ocurrió un error inesperado. Por favor, inténtalo de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="text-xs px-4">
          Actualizar
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-auto pt-8 xl:pt-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold  tracking-heading">
            Actualizar progreso
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                    icon={Calendar01Icon}
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

          <div className="space-y-2">
            <Label className="text-xs md:text-xs" htmlFor="value">
              Valor actual ({goal.unit || ""})
            </Label>
            <Input
              className="text-xs md:text-xs"
              id="value"
              type="number"
              step="0.1"
              placeholder={`Ej: ${goal.targetValue || ""}`}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs md:text-xs" htmlFor="notes">
              Notas (opcional)
            </Label>
            <Textarea
              id="notes"
              className="text-xs md:text-xs"
              placeholder="Observaciones adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              size="sm"
              className="text-xs px-4"
              type="submit"
              disabled={isSubmitting || !isOwner}
            >
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
      </DialogContent>
    </Dialog>
  );
}
