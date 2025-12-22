"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BodyPartLegIcon,
  BodyPartSixPackIcon,
  WorkoutWarmUpIcon,
} from "@hugeicons/core-free-icons";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    icon: (
      <HugeiconsIcon
        icon={BodyPartSixPackIcon}
        size={18}
        className="text-muted-foreground"
      />
    ),
  },
  {
    id: "Push/Pull/Legs",
    name: "Push-Pull-Legs",
    description:
      "Un día empuje (push), otro jalón (pull) y otro pierna (6 días por semana)",
    icon: (
      <HugeiconsIcon
        icon={BodyPartLegIcon}
        size={18}
        className="text-muted-foreground"
      />
    ),
  },
  {
    id: "Weider",
    name: "Weider",
    description:
      "Se entrena un grupo muscular específico por día (5-6 días por semana)",
    icon: (
      <HugeiconsIcon
        icon={WorkoutWarmUpIcon}
        size={18}
        className="text-muted-foreground"
      />
    ),
  },
];

interface StepSplitProps {
  value: string;
  onChange: (value: string) => void;
}

export function StepSplit({ value, onChange }: StepSplitProps) {
  return (
    <div className="space-y-3 md:space-y-4">
      <DialogHeader className="space-y-1.5 md:space-y-2">
        <DialogTitle className="text-2xl font-semibold tracking-heading">
          ¿Qué tipo de rutina prefieres?
        </DialogTitle>
        <DialogDescription className="text-xs md:text-xs text-muted-foreground">
          Elige cómo quieres distribuir los grupos musculares en tu
          entrenamiento
        </DialogDescription>
      </DialogHeader>

      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="grid gap-2 md:gap-3"
      >
        {splits.map((split) => (
          <Label key={split.id} htmlFor={split.id} className="cursor-pointer">
            <RadioGroupItem
              value={split.id}
              id={split.id}
              className="peer sr-only"
            />
            <div className="w-full rounded-lg border border-border/50 peer-data-[state=checked]:border-0 peer-data-[state=checked]:bg-zinc-100 dark:peer-data-[state=checked]:bg-zinc-800 hover:border-border transition-all">
              <div className="flex items-center p-2.5 md:p-3.5 gap-2.5 md:gap-3.5">
                <div className="flex-shrink-0 p-1.5 md:p-2 rounded-full border border-border/50 peer-data-[state=checked]:border-0 peer-data-[state=checked]:bg-transparent bg-background transition-all">
                  <div className="w-4 h-4 md:w-[18px] md:h-[18px] flex items-center justify-center text-muted-foreground peer-data-[state=checked]:text-black dark:peer-data-[state=checked]:text-white transition-colors">
                    {split.icon}
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <h3 className="text-xs font-medium leading-tight text-foreground peer-data-[state=checked]:text-black dark:peer-data-[state=checked]:text-white transition-colors">
                    {split.name}
                  </h3>
                  <p className="text-xs md:text-xs text-muted-foreground peer-data-[state=checked]:text-black/70 dark:peer-data-[state=checked]:text-white/80 leading-tight line-clamp-2 transition-colors">
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
