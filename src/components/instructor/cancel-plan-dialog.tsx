"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, update } = useSession();

  const handleCancelPlan = async () => {
    setIsLoading(true);
    try {
      // 1. Cancelar el plan
      const response = await fetch("/api/instructors/cancel-plan", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al cancelar el plan");
      }

      // 2. Actualizar la sesión local
      if (session?.user) {
        await update();
        window.location.href = '/dashboard/profile';
      }
      
      // 4. Mostrar mensaje de éxito
      toast.success("Plan cancelado", {
        description: "Tu plan de instructor ha sido cancelado correctamente."
      });
      
      // 5. Cerrar el diálogo y redirigir siempre a profile
      onOpenChange(false);
      window.location.href = '/dashboard/profile';
    } catch (error) {
      console.error("Error al cancelar el plan:", error);
      toast.error("Error", {
        description: error instanceof Error ? error.message : "No se pudo cancelar el plan"
      });
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
