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
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => Promise<void> | void;
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

      // 2. Actualizar la sesión usando el trigger "update" de NextAuth
      // Esto hará que el callback jwt recargue los datos desde la base de datos
      if (session?.user) {
        await update({
          ...session,
          user: {
            ...session.user,
            isInstructor: false,
          },
        });
      }

      // 3. Call onSuccess callback if provided
      if (onSuccess) {
        await onSuccess();
      }

      // 4. Show success message
      toast.success("Plan cancelado", {
        description: "Tu plan de instructor ha sido cancelado correctamente.",
      });

      // 5. Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error al cancelar el plan:", error);
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "No se pudo cancelar el plan",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-heading">
            ¿Cancelar plan de instructor?
          </DialogTitle>
          <DialogDescription className="text-xs">
            Esta acción cancelará tu plan de instructor. Perderás acceso a las
            funciones exclusivas para instructores. Esta acción no se puede
            deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            size="default"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Volver
          </Button>
          <Button
            size="default"
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
