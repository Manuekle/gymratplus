"use client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { DialogHeader } from "@/components/ui/dialog";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BodyPartMuscleIcon,
  EquipmentBenchPressIcon,
  TapeMeasureIcon,
  WorkoutRunIcon,
  YogaMatIcon,
} from "@hugeicons/core-free-icons";

const goals = [
  {
    id: "hypertrophy",
    name: "Hipertrofia",
    description: "Aumento de masa muscular (6-12 repeticiones por serie)",
    icon: (
      <HugeiconsIcon
        icon={BodyPartMuscleIcon}
        size={18}
        className="text-muted-foreground"
      />
    ),
  },
  {
    id: "strength",
    name: "Fuerza",
    description: "Levantamiento de cargas pesadas (1-6 repeticiones por serie)",
    icon: (
      <HugeiconsIcon
        icon={EquipmentBenchPressIcon}
        size={18}
        className="text-muted-foreground"
      />
    ),
  },
  {
    id: "fat-loss",
    name: "Pérdida de grasa",
    description: "Rutinas con alta intensidad, circuitos o HIIT",
    icon: (
      <HugeiconsIcon
        icon={TapeMeasureIcon}
        size={18}
        className="text-muted-foreground"
      />
    ),
  },
  {
    id: "endurance",
    name: "Resistencia",
    description:
      "Aumentar la capacidad muscular y cardiovascular (más de 12 repeticiones)",
    icon: (
      <HugeiconsIcon
        icon={WorkoutRunIcon}
        size={18}
        className="text-muted-foreground"
      />
    ),
  },
  {
    id: "mobility",
    name: "Movilidad y flexibilidad",
    description: "Yoga, pilates o estiramientos dinámicos",
    icon: (
      <HugeiconsIcon
        icon={YogaMatIcon}
        size={18}
        className="text-muted-foreground"
      />
    ),
  },
];

interface StepGoalProps {
  value: string;
  onChange: (value: string) => void;
}

export function StepGoal({ value, onChange }: StepGoalProps) {
  return (
    <div className="space-y-3 md:space-y-4">
      <DialogHeader className="space-y-1.5 md:space-y-2">
        <DialogTitle className="text-2xl font-semibold tracking-heading">
          ¿Cuál es tu objetivo principal?
        </DialogTitle>
        <DialogDescription className="text-[10px] md:text-xs text-muted-foreground">
          Selecciona el objetivo que mejor se adapte a tus metas actuales
        </DialogDescription>
      </DialogHeader>

      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="grid gap-2 md:gap-3"
      >
        {goals.map((goal) => (
          <Label key={goal.id} htmlFor={goal.id} className="cursor-pointer">
            <RadioGroupItem
              value={goal.id}
              id={goal.id}
              className="peer sr-only"
            />
            <div className="w-full rounded-lg border border-border/50 peer-data-[state=checked]:border-0 peer-data-[state=checked]:bg-zinc-100 dark:peer-data-[state=checked]:bg-zinc-800 hover:border-border transition-all">
              <div className="flex items-center p-2.5 md:p-3.5 gap-2.5 md:gap-3.5">
                <div className="flex-shrink-0 p-1.5 md:p-2 rounded-full border border-border/50 peer-data-[state=checked]:border-0 peer-data-[state=checked]:bg-transparent bg-background transition-all">
                  <div className="w-4 h-4 md:w-[18px] md:h-[18px] flex items-center justify-center text-muted-foreground peer-data-[state=checked]:text-black dark:peer-data-[state=checked]:text-white transition-colors">
                    {goal.icon}
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <h3 className="text-xs font-medium leading-tight text-foreground peer-data-[state=checked]:text-black dark:peer-data-[state=checked]:text-white transition-colors">
                    {goal.name}
                  </h3>
                  <p className="text-[10px] md:text-xs text-muted-foreground peer-data-[state=checked]:text-black/70 dark:peer-data-[state=checked]:text-white/80 leading-tight line-clamp-2 transition-colors">
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
