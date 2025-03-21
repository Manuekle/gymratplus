"use client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { DialogHeader } from "@/components/ui/dialog";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import {
  BodyPartMuscleIcon,
  EquipmentBenchPressIcon,
  TapeMeasureIcon,
  WorkoutRunIcon,
  YogaMatIcon,
} from "hugeicons-react";

const goals = [
  {
    id: "hypertrophy",
    name: "Hipertrofia",
    description: "Aumento de masa muscular (6-12 repeticiones por serie)",
    icon: <BodyPartMuscleIcon size={18} className="text-muted-foreground" />,
  },
  {
    id: "strength",
    name: "Fuerza",
    description: "Levantamiento de cargas pesadas (1-6 repeticiones por serie)",
    icon: (
      <EquipmentBenchPressIcon size={18} className="text-muted-foreground" />
    ),
  },
  {
    id: "fat-loss",
    name: "Pérdida de grasa",
    description: "Rutinas con alta intensidad, circuitos o HIIT",
    icon: <TapeMeasureIcon size={18} className="text-muted-foreground" />,
  },
  {
    id: "endurance",
    name: "Resistencia",
    description:
      "Aumentar la capacidad muscular y cardiovascular (más de 12 repeticiones)",
    icon: <WorkoutRunIcon size={18} className="text-muted-foreground" />,
  },
  {
    id: "mobility",
    name: "Movilidad y flexibilidad",
    description: "Yoga, pilates o estiramientos dinámicos",
    icon: <YogaMatIcon size={18} className="text-muted-foreground" />,
  },
];

interface StepGoalProps {
  value: string;
  onChange: (value: string) => void;
}

export function StepGoal({ value, onChange }: StepGoalProps) {
  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="font-medium text-md">
          ¿Cuál es tu objetivo principal?
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Selecciona el objetivo que mejor se adapte a tus metas actuales
        </DialogDescription>
      </DialogHeader>

      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex flex-col"
      >
        {goals.map((goal) => (
          <Label key={goal.id} htmlFor={goal.id} className="cursor-pointer">
            <RadioGroupItem
              value={goal.id}
              id={goal.id}
              className="peer sr-only"
            />
            <div className="w-full rounded-lg border border-accent peer-data-[state=checked]:border-zinc-200 peer-data-[state=checked]:shadow-sm hover:border-zinc-200 transform transition-all">
              <div className="flex p-4 gap-4 items-center">
                <div className="mt-0.5 p-2 rounded-full border">
                  {goal.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm">{goal.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {goal.description}
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
