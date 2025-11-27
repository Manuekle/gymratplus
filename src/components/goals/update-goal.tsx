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
        toast.success("Progreso actualizado correctamente");
        setTimeout(() => {
          setOpen(false);
          setValue(goal.currentValue?.toString() || "");
          setNotes("");
          setDate(new Date());
        }, 1000);
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
        <Button size="default" variant="outline" className="text-xs h-8 px-3">
          Actualizar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-2xl font-semibold tracking-heading">
            Actualizar Progreso
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fecha */}
          <div className="space-y-1.5">
            <Label htmlFor="date" className="text-xs text-muted-foreground">
              Fecha
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-9 text-xs",
                    !date && "text-muted-foreground",
                  )}
                >
                  <HugeiconsIcon
                    icon={Calendar01Icon}
                    className="mr-2 h-3.5 w-3.5"
                  />
                  {date
                    ? format(date, "PPP", { locale: es })
                    : "Selecciona una fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
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

          {/* Valor */}
          <div className="space-y-1.5">
            <Label htmlFor="value" className="text-xs text-muted-foreground">
              Valor actual
              {goal.unit && (
                <span className="text-muted-foreground ml-1">
                  ({goal.unit})
                </span>
              )}
            </Label>
            <Input
              id="value"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={`Ej: ${goal.targetValue || ""}`}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {/* Notas */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs text-muted-foreground">
              Notas <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="notes"
              className="text-xs resize-none min-h-[80px]"
              placeholder="Observaciones adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-destructive bg-destructive/10 p-2 rounded-md">
              {error}
            </p>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="default"
              className="text-xs h-8"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="default"
              className="text-xs h-8 px-4"
              disabled={isSubmitting || !isOwner}
            >
              {isSubmitting ? (
                <>
                  <Icons.spinner className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Guardando...
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
