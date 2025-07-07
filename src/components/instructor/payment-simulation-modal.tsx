"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface PaymentSimulationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function PaymentSimulationModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: PaymentSimulationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirmar Pago</DialogTitle>
          <DialogDescription>
            Simulación de pago para completar el registro
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 text-center space-y-4">
          <div className="text-2xl font-semibold">$29.99</div>
          <p className="text-sm text-gray-600">Tarifa de registro único</p>
          <div className="text-4xl">💳</div>
          <p className="text-xs text-gray-500">
            No se realizará ningún cobro real
          </p>
        </div>

        <DialogFooter className="flex flex-col gap-2">
          <Button onClick={onConfirm} className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Confirmar"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
