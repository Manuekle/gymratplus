"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { WorkoutTable, type Exercise } from "@/components/tables/workout-table";

// Tipo para los días de entrenamiento
export type WorkoutDay = {
  id: string;
  day: string;
  date: string;
  exercises: Exercise[];
  type: string;
};

interface WorkoutAccordionProps {
  workoutDays: WorkoutDay[];
  isLoading?: boolean;
  defaultOpen?: string[];
}

export function WorkoutAccordion({
  workoutDays,
  isLoading = false,
  defaultOpen = [],
}: WorkoutAccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const handleToggle = (value: string) => {
    setOpenItems((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  return (
    <Accordion type="multiple" value={openItems} className="w-full">
      {workoutDays.map((day) => (
        <AccordionItem key={day.id} value={day.id}>
          <AccordionTrigger
            onClick={() => handleToggle(day.id)}
            className="px-4 hover:no-underline"
          >
            <div className="flex flex-1 items-center justify-between pr-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">{day.day}</span>
                <span className="text-sm text-muted-foreground">
                  {day.date}
                </span>
              </div>
              <Badge variant="outline" className="ml-auto mr-4">
                {day.type}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-2 pb-4">
            <WorkoutTable exercises={day.exercises} isLoading={isLoading} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
