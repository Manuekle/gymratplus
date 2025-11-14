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
import { cn } from "@/lib/utils/utils";

import { Icons } from "../icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
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
    if (!value || isNaN(Number(value))) {
      setError("Por favor ingresa un valor numérico válido");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!goal.id) {
        throw new Error("ID de objetivo inválido");
      }

      const result = await addProgressUpdate(goal.id, {
        value: Number.parseFloat(value),
        date: date.toISOString(),
        notes: notes || "",
      });

      if (result) {
        // Mostrar mensaje de éxito
        toast.success("Progreso actualizado correctamente");

        // Cerrar el diálogo después de un breve retraso
        setTimeout(() => {
          setOpen(false);
          // Resetear el formulario
          setValue(goal.currentValue?.toString() || "");
          setNotes("");
          setDate(new Date());
        }, 1000);

        // Notificar al componente padre para actualizar la lista
        onSuccess();
      }
    } catch (error: unknown) {
      console.error("Error al guardar:", error);
      let errorMessage =
        "Ocurrió un error al guardar los datos. Por favor, inténtalo de nuevo.";

      if (error instanceof Error) {
        if (error.message === "Objetivo no encontrado") {
          errorMessage =
            "No se pudo encontrar el objetivo. Por favor, recarga la página e intenta de nuevo.";
        } else if (error.message === "ID de objetivo inválido") {
          errorMessage =
            "ID de objetivo inválido. Por favor, recarga la página e intenta de nuevo.";
        } else if (error.message.includes("Network Error")) {
          errorMessage =
            "Error de conexión. Por favor, verifica tu conexión a internet.";
        }
      }

      setError(errorMessage);
      toast.error(errorMessage);
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
      <DialogContent className="overflow-y-auto pt-8 xl:pt-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
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
              className="text-xs md:text-xs resize-none"
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
