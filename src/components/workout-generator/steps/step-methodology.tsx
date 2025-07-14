"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ScrollArea } from "@/components/ui/scroll-area";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock05Icon, EquipmentBenchPressIcon, Flowchart02Icon, GitCompareIcon, MayanPyramidIcon,  } from "@hugeicons/core-free-icons";

const methodologies = [
  {
    id: "standard",
    name: "Estándar",
    description:
      "Entrenamiento tradicional con series y repeticiones definidas",
    icon: (
      <HugeiconsIcon icon={EquipmentBenchPressIcon} size={18} className="text-muted-foreground" />
    ),
  },
  {
    id: "circuit",
    name: "Circuito",
    description:
      "Ejercicios consecutivos sin descanso (ideal para quemar grasa)",
    icon: <HugeiconsIcon icon={GitCompareIcon} size={18} className="text-muted-foreground" />,
  },
  {
    id: "hiit",
    name: "HIIT",
    description: "Alternancia de esfuerzo máximo y descanso",
    icon: <HugeiconsIcon icon={Clock05Icon} size={18} className="text-muted-foreground" />,
  },
  {
    id: "drop-sets",
    name: "Drop Sets",
    description: "Se baja el peso sin descansar hasta el fallo muscular",
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
          d="M3.5 10.5V19.5C3.5 19.9659 3.5 20.1989 3.57612 20.3827C3.67761 20.6277 3.87229 20.8224 4.11732 20.9239C4.30109 21 4.53406 21 5 21C5.46594 21 5.69891 21 5.88268 20.9239C6.12771 20.8224 6.32239 20.6277 6.42388 20.3827C6.5 20.1989 6.5 19.9659 6.5 19.5V10.5C6.5 10.0341 6.5 9.80109 6.42388 9.61732C6.32239 9.37229 6.12771 9.17761 5.88268 9.07612C5.69891 9 5.46594 9 5 9C4.53406 9 4.30109 9 4.11732 9.07612C3.87229 9.17761 3.67761 9.37229 3.57612 9.61732C3.5 9.80109 3.5 10.0341 3.5 10.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M17.5 8L19.5 10.5L17 12.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19.0001 10.502C19.0001 10.502 11.5001 10.502 4.00012 3.00195"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.5 14V19.5C10.5 19.9659 10.5 20.1989 10.5761 20.3827C10.6776 20.6277 10.8723 20.8224 11.1173 20.9239C11.3011 21 11.5341 21 12 21C12.4659 21 12.6989 21 12.8827 20.9239C13.1277 20.8224 13.3224 20.6277 13.4239 20.3827C13.5 20.1989 13.5 19.9659 13.5 19.5V14C13.5 13.5341 13.5 13.3011 13.4239 13.1173C13.3224 12.8723 13.1277 12.6776 12.8827 12.5761C12.6989 12.5 12.4659 12.5 12 12.5C11.5341 12.5 11.3011 12.5 11.1173 12.5761C10.8723 12.6776 10.6776 12.8723 10.5761 13.1173C10.5 13.3011 10.5 13.5341 10.5 14Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M17.5 16.5V19.5C17.5 19.9659 17.5 20.1989 17.5761 20.3827C17.6776 20.6277 17.8723 20.8224 18.1173 20.9239C18.3011 21 18.5341 21 19 21C19.4659 21 19.6989 21 19.8827 20.9239C20.1277 20.8224 20.3224 20.6277 20.4239 20.3827C20.5 20.1989 20.5 19.9659 20.5 19.5V16.5C20.5 16.0341 20.5 15.8011 20.4239 15.6173C20.3224 15.3723 20.1277 15.1776 19.8827 15.0761C19.6989 15 19.4659 15 19 15C18.5341 15 18.3011 15 18.1173 15.0761C17.8723 15.1776 17.6776 15.3723 17.5761 15.6173C17.5 15.8011 17.5 16.0341 17.5 16.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "pyramid",
    name: "Piramidal",
    description: "Se sube o baja el peso progresivamente en cada serie",
    icon: <HugeiconsIcon icon={MayanPyramidIcon} size={18} className="text-muted-foreground" />,
  },
  {
    id: "supersets",
    name: "Superseries",
    description: "Dos ejercicios seguidos sin descanso",
    icon: <HugeiconsIcon icon={Flowchart02Icon} size={18} className="text-muted-foreground" />,
  },
];

interface StepMethodologyProps {
  value: string;
  onChange: (value: string) => void;
}

export function StepMethodology({ value, onChange }: StepMethodologyProps) {
  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold  tracking-heading">
          ¿Qué metodología te interesa?
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Selecciona la técnica de entrenamiento que prefieres utilizar
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="md:h-full h-96">
        <RadioGroup
          value={value}
          onValueChange={onChange}
          className="grid gap-4"
        >
          {methodologies.map((method) => (
            <Label
              key={method.id}
              htmlFor={method.id}
              className="cursor-pointer"
            >
              <RadioGroupItem
                value={method.id}
                id={method.id}
                className="peer sr-only"
              />
              <div className="w-full rounded-lg border border-accent peer-data-[state=checked]:border-zinc-200 dark:peer-data-[state=checked]:border-zinc-700 peer-data-[state=checked]:shadow-sm hover:border-zinc-200 dark:hover:border-zinc-700 transform transition-all">
                <div className="flex items-center p-4 gap-4">
                  <div className="mt-0.5 p-2 rounded-full border text-muted-foreground">
                    {method.icon}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm">{method.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                </div>
              </div>
            </Label>
          ))}
        </RadioGroup>
      </ScrollArea>
    </div>
  );
}
