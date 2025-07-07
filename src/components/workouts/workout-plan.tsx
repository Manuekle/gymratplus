"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

// Tipos para el plan de entrenamiento
export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restTime: number;
  notes?: string;
};

export type WorkoutDay = {
  day: string;
  exercises: Exercise[];
};

export type WorkoutPlan = {
  id: string;
  name: string;
  description: string;
  days: WorkoutDay[];
};

interface WorkoutPlanProps {
  workoutPlan: WorkoutPlan;
  isLoading?: boolean;
  defaultOpen?: string[];
}

export function WorkoutPlan({
  workoutPlan,
  isLoading = false,
  defaultOpen = [],
}: WorkoutPlanProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const handleToggle = (value: string) => {
    setOpenItems((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  if (isLoading) {
    return <WorkoutPlanSkeleton />;
  }

  // Validar que workoutPlan y workoutPlan.days existan
  if (!workoutPlan || !workoutPlan.days) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No se encontró información del plan de entrenamiento
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* <div>
        <h2 className="text-2xl font-semibold ">{workoutPlan.name}</h2>
        <p className="text-muted-foreground">{workoutPlan.description}</p>
      </div> */}

      <Accordion
        type="multiple"
        value={openItems}
        className="w-full border rounded-lg overflow-hidden"
      >
        {workoutPlan.days.map((day, index) => (
          <AccordionItem
            key={`${day.day}-${index}`}
            value={`${day.day}-${index}`}
            className="border-b last:border-0"
          >
            <AccordionTrigger
              onClick={() => handleToggle(`${day.day}-${index}`)}
              className="px-4 hover:no-underline"
            >
              <div className="flex flex-1 items-center justify-between pr-4">
                <div className="font-medium">{day.day}</div>
                <Badge variant="outline" className="ml-auto mr-4">
                  {day.exercises.length} ejercicios
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-2 pb-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ejercicio</TableHead>
                      <TableHead className="w-[80px] text-center">
                        Sets
                      </TableHead>
                      <TableHead className="w-[80px] text-center">
                        Reps
                      </TableHead>
                      <TableHead className="w-[100px] text-center">
                        Descanso
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {day.exercises.map((exercise) => (
                      <TableRow key={exercise.id}>
                        <TableCell className="font-medium">
                          {exercise.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {exercise.sets}
                        </TableCell>
                        <TableCell className="text-center">
                          {exercise.reps === 0 ? "-" : exercise.reps}
                        </TableCell>
                        <TableCell className="text-center">
                          {exercise.restTime}s
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function WorkoutPlanSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-8 w-3/4 max-w-md" />
        <Skeleton className="h-4 w-full max-w-lg mt-2" />
      </div>

      <div className="border rounded-lg overflow-hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="border-b last:border-0">
            <div className="flex items-center justify-between p-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
