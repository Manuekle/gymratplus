"use client";

import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

interface WaterControlsProps {
  intake: number;
  onAdd: () => void;
  onRemove: () => void;
  isUpdating: boolean;
}

export function WaterControls({
  intake,
  onAdd,
  onRemove,
  isUpdating,
}: WaterControlsProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <Button
        variant="outline"
        size="icon"
        className="md:h-14 h-12 w-12 md:w-14 rounded-xl text-black dark:text-white border"
        onClick={onAdd}
        disabled={isUpdating || intake >= 10}
        aria-label="Añadir agua"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <div className="text-center">
        <div className="text-4xl md:text-5xl font-bold tracking-tighter">
          {intake.toFixed(2).replace(/\.00$/, "")}
        </div>
        <div className="text-muted-foreground text-xs md:text-sm">litros</div>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="md:h-14 h-12 w-12 md:w-14 rounded-xl text-black dark:text-white border"
        onClick={onRemove}
        disabled={isUpdating || intake <= 0}
        aria-label="Quitar agua"
      >
        <Minus className="h-6 w-6" />
      </Button>
    </div>
  );
}
