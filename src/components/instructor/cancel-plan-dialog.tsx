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
  onSuccess?: () => void;
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
        await update({
          ...session,
          user: {
            ...session.user,
            isInstructor: false,
            instructorProfile: null,
            _localStorage: {
              ...(session.user._localStorage || {}),
              isInstructor: false,
              instructorProfile: null,
            },
          },
        });
      }

      // 3. Forzar actualización de la sesión en el servidor
      const sessionResponse = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!sessionResponse.ok) {
        throw new Error("Error al actualizar la sesión");
      }
      
      // 4. Mostrar mensaje de éxito
      toast.success("Plan cancelado", {
        description: "Tu plan de instructor ha sido cancelado correctamente."
      });
      
      // 5. Cerrar el diálogo
      onOpenChange(false);
      
      // 6. Ejecutar callback o redirigir
      if (onSuccess) {
        onSuccess();
      } else {
        // Recargar después de un breve retraso
        setTimeout(() => {
          window.location.href = '/dashboard/profile';
        }, 1000);
      }
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
