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

      // 2. Update the session with the new instructor status
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isInstructor: false }),
        credentials: 'include',
      });
      
      // 3. Update the local session
      if (session?.user) {
        await update();
      }
      
      // 4. Show success message
      toast.success("Plan cancelado", {
        description: "Tu plan de instructor ha sido cancelado correctamente."
      });
      
      // 5. Close the dialog
      onOpenChange(false);
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
      <DialogContent className="overflow-y-auto pt-20 xl:pt-0">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-heading">¿Cancelar plan de instructor?</DialogTitle>
          <DialogDescription className="text-sm">
            Esta acción cancelará tu plan de instructor. Perderás acceso a las
            funciones exclusivas para instructores. Esta acción no se puede
            deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
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
