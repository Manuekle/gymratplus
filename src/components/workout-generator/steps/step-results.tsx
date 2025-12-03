"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ScrollArea } from "@/components/ui/scroll-area";

import { useState } from "react";

import { Workout } from "@/types/workout-types";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon } from "@hugeicons/core-free-icons";

interface StepResultsProps {
  workout: Workout;
}

export function StepResults({ workout }: StepResultsProps) {
  const [selectedDay, setSelectedDay] = useState(workout.days[0]?.day);

  if (!workout) {
    return (
      <div className="text-center py-12">
        <p>No se ha generado ningún entrenamiento todavía.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold ">¡Tu entrenamiento está listo!</h2>
        <p className="text-muted-foreground mt-1">
          Aquí tienes tu plan de entrenamiento personalizado
        </p>
      </div> */}
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold  tracking-heading">
          ¡Tu entrenamiento está listo!
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Aquí tienes tu plan de entrenamiento personalizado
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold tracking-tight">
              {workout.name}
            </h3>
            {workout.description && (
              <p className="text-xs text-muted-foreground">
                {workout.description}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="px-3 py-1 text-xs">
              {workout.type}
            </Badge>
            <Badge
              variant="outline"
              className="px-3 py-1 text-xs flex items-center gap-1"
            >
              <HugeiconsIcon icon={Calendar01Icon} className="h-3.5 w-3.5" />
              {workout.days.length} {workout.days.length === 1 ? "día" : "días"}{" "}
              por semana
            </Badge>
          </div>
        </div>
        <div className="pt-4">
          <div className="sticky top-0 bg-background z-10 pb-2 pt-1">
            <div className="flex flex-nowrap overflow-x-auto pb-1 gap-1.5 hide-scrollbar">
              {workout.days.map((day, index) => (
                <Button
                  key={index}
                  variant={selectedDay === day.day ? "default" : "outline"}
                  size="default"
                  onClick={() => setSelectedDay(day.day)}
                  className="flex-shrink-0 px-2 py-1 text-xs rounded-full transition-all"
                >
                  {day.day}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-2">
            <ScrollArea className="max-h-[400px] w-full">
              <div className="space-y-1 pr-2">
                {workout.days
                  .find((day) => day.day === selectedDay)
                  ?.exercises.map((exercise, exIndex) => (
                    <div
                      key={exIndex}
                      className="flex flex-col border-b py-2 last:border-0"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-[13px] flex-1 truncate pr-2">
                          {exercise.name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs flex-shrink-0">
                          <span className="text-muted-foreground whitespace-nowrap">
                            {exercise.sets}×{exercise.reps || "Tiempo"}
                          </span>
                          <span className="font-medium whitespace-nowrap">
                            ⏱️{exercise.restTime}s
                          </span>
                        </div>
                      </div>
                      {exercise.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {exercise.notes}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
