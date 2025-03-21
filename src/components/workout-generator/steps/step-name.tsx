"use client";

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { File01Icon } from "hugeicons-react";

interface StepNameProps {
  value: string;
  onChange: (value: string) => void;
}

export function StepName({ value, onChange }: StepNameProps) {
  return (
    <div className="space-y-6 py-4">
      <DialogHeader>
        <DialogTitle className="font-medium text-md">
          Dale un nombre a tu entrenamiento
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Elige un nombre que te motive y te ayude a identificar tu rutina
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-full text-muted-foreground border">
            <File01Icon size={18} />
          </div>
          <p className="text-xs text-muted-foreground">
            Un buen nombre te ayudará a mantener la motivación y el enfoque en
            tus objetivos
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs md:text-sm" htmlFor="workout-name">
            Nombre del entrenamiento
          </Label>
          <Input
            className="text-xs md:text-sm"
            id="workout-name"
            placeholder="Ej: Mi rutina de hipertrofia"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>

        {!value && (
          <p className="text-sm text-muted-foreground mt-4">
            Sugerencias: &quot;Mi rutina de fuerza&quot;, &quot;Plan de pérdida
            de grasa&quot;, &quot;Entrenamiento para ganar músculo&quot;
          </p>
        )}
      </div>
    </div>
  );
}
