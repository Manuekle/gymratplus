"use client";

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { CalendarAdd02Icon, CalendarMinus02Icon } from "hugeicons-react";

interface StepFrequencyProps {
  value: number;
  onChange: (value: number) => void;
}

export function StepFrequency({ value, onChange }: StepFrequencyProps) {
  return (
    <div className="space-y-8">
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold  tracking-heading">
          ¿Cuántos días a la semana puedes entrenar?
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Selecciona la frecuencia de entrenamiento que mejor se adapte a tu
          disponibilidad
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 ">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CalendarMinus02Icon size={18} className="text-muted-foreground" />
            <span className="text-xs text-accent-foreground">Pocos días</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-accent-foreground">Muchos días</span>
            <CalendarAdd02Icon size={18} className="text-muted-foreground" />
          </div>
        </div>

        <Slider
          value={[value]}
          min={1}
          max={7}
          step={1}
          onValueChange={(vals) => {
            const val = vals[0] ?? 1; // Default to 1 if undefined
            onChange(val);
          }}
          className="py-1"
        />

        <div className="flex justify-between">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <div
              key={day}
              className={`flex flex-col items-center ${
                value === day
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              }`}
            >
              <span>{day}</span>
              <span className="text-xs">día{day !== 1 ? "s" : ""}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="text-md font-semibold text-primary">
            {value} {value === 1 ? "día" : "días"} por semana
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {value <= 2 &&
              "Ideal para principiantes o personas con agenda muy ocupada."}
            {value > 2 &&
              value <= 4 &&
              "Frecuencia óptima para la mayoría de las personas."}
            {value > 4 &&
              "Frecuencia alta, ideal para personas con experiencia."}
          </p>
        </div>
      </div>
    </div>
  );
}
