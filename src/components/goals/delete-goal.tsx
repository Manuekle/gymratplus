"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useGoals, type Goal } from "@/hooks/use-goals";
import { Icons } from "../icons";
import { AlertCircleIcon } from "hugeicons-react";
import { AlertDescription, AlertTitle } from "../ui/alert";
interface GoalProps {
  onSuccess: () => void;
  goal: Goal;
}

export function DeleteGoal({ onSuccess, goal }: GoalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { deleteGoal } = useGoals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setIsSubmitting(true);

    try {
      await deleteGoal(goal.id!);

      onSuccess();
    } catch (error) {
      console.error("Error al eliminar:", error);
      //   setError("Ocurrió un error al eliminar el progreso");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive" className="text-xs px-4">
          Eliminar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Eliminar progreso
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4 w-full border rounded-lg p-4 flex flex-col">
            <span className="flex items-center gap-2 pb-1 text-destructive">
              <AlertCircleIcon size={14} />
              <AlertTitle className="text-sm">¡Cuidado!</AlertTitle>
            </span>
            <AlertDescription className="text-xs text-destructive">
              ¿Estás seguro de que deseas eliminar este progreso? Esta acción no
              se puede deshacer.
            </AlertDescription>
            <div className="flex flex-col md:flex-row gap-2 max-w-full pt-4">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                size="sm"
                className="text-xs px-4"
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Eliminando
                  </>
                ) : (
                  "Eliminar"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
