"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CancelPlanDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCancelPlan = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/instructors/cancel-plan", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Error al cancelar el plan");
      }

      toast.success("Plan cancelado exitosamente");
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error canceling plan:", error);
      toast.error("Error al cancelar el plan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-heading">¿Cancelar plan de instructor?</DialogTitle>
          <DialogDescription className="text-sm">
            Esta acción cancelará tu plan de instructor. Perderás acceso a las
            funciones exclusivas para instructores. Esta acción no se puede
            deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Volver
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancelPlan}
            disabled={isLoading}
          >
            {isLoading ? "Procesando..." : "Sí, cancelar plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
