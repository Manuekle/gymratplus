"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BodyPartLegIcon,
  BodyPartSixPackIcon,
  WorkoutWarmUpIcon,
} from "hugeicons-react";

const splits = [
  {
    id: "Full Body",
    name: "Full Body",
    description:
      "Se trabaja todo el cuerpo en cada sesión (3-4 días por semana)",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={18}
        height={18}
        color="currentColor"
        fill={"none"}
      >
        <path
          d="M17 7L19 7.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 17.5C8 17.5 5 16 5 12.5C5 9 7.5 7.5 12 6C15 5 17 4 17 2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.99973 16C5.99973 16 5.5 17.3846 5.5 19.2308C5.5 20.6154 5.99973 22 5.99973 22"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 15L12.8125 16.2188C13.5544 17.3316 14.8033 18 16.1407 18H19"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 15V15.01"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13 16.5L13 22"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "Upper/Lower Split",
    name: "Torso-Pierna",
    description:
      "Se alternan días de torso y días de pierna (4 días por semana)",
    icon: <BodyPartSixPackIcon size={18} className="text-muted-foreground" />,
  },
  {
    id: "Push/Pull/Legs",
    name: "Push-Pull-Legs",
    description:
      "Un día empuje (push), otro jalón (pull) y otro pierna (6 días por semana)",
    icon: <BodyPartLegIcon size={18} className="text-muted-foreground" />,
  },
  {
    id: "Weider",
    name: "Weider",
    description:
      "Se entrena un grupo muscular específico por día (5-6 días por semana)",
    icon: <WorkoutWarmUpIcon size={18} className="text-muted-foreground" />,
  },
];

interface StepSplitProps {
  value: string;
  onChange: (value: string) => void;
}

export function StepSplit({ value, onChange }: StepSplitProps) {
  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold tracking-tight">
          ¿Qué tipo de rutina prefieres?
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Elige cómo quieres distribuir los grupos musculares en tu
          entrenamiento
        </DialogDescription>
      </DialogHeader>

      <RadioGroup value={value} onValueChange={onChange} className="grid gap-4">
        {splits.map((split) => (
          <Label key={split.id} htmlFor={split.id} className="cursor-pointer">
            <RadioGroupItem
              value={split.id}
              id={split.id}
              className="peer sr-only"
            />
            <div className="w-full rounded-lg border border-accent peer-data-[state=checked]:border-zinc-200 peer-data-[state=checked]:shadow-sm hover:border-zinc-200 transform transition-all">
              <div className="flex items-center p-4 gap-4">
                <div className="mt-0.5 p-2 rounded-full border text-muted-foreground">
                  {split.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm">{split.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {split.description}
                  </p>
                </div>
              </div>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}
