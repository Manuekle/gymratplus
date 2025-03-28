"use client";

import { CardDescription, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar01Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";

import { Workout } from "@/types/workout-types";

interface StepResultsProps {
  workout: Workout;
}

export function StepResults({ workout }: StepResultsProps) {
  const router = useRouter();

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
        <h2 className="text-2xl font-bold">¡Tu entrenamiento está listo!</h2>
        <p className="text-muted-foreground mt-1">
          Aquí tienes tu plan de entrenamiento personalizado
        </p>
      </div> */}
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold tracking-tight">
          ¡Tu entrenamiento está listo!
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Aquí tienes tu plan de entrenamiento personalizado
        </DialogDescription>
      </DialogHeader>

      <div>
        <div className="pb-2">
          <div className="flex justify-between items-start gap-8">
            <div className="flex flex-col gap-1 w-full">
              <CardTitle className="text-sm">{workout.name}</CardTitle>
              <CardDescription className="text-xs">
                {workout.description}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                {workout.type}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar01Icon className="h-3 w-3" />
                {workout.days.length} días
              </Badge>
            </div>
          </div>
        </div>
        <div className="pt-4">
          <Tabs defaultValue={workout.days[0]?.day}>
            <TabsList className="w-full mb-4 flex flex-wrap h-auto ">
              {workout.days.map((day, index) => (
                <TabsTrigger key={index} value={day.day} className="flex-1">
                  {day.day}
                </TabsTrigger>
              ))}
            </TabsList>

            <ScrollArea className="h-[400px] mt-0 pr-4">
              {workout.days.map((day, dayIndex) => (
                <TabsContent key={dayIndex} value={day.day}>
                  <div className="grid md:grid-cols-2 gap-6">
                    {day.exercises.map((exercise, exIndex) => (
                      <div
                        key={exIndex}
                        className="border rounded-lg shadow-sm"
                      >
                        <div className="flex items-center p-4 border-b">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">
                              {exercise.name}
                            </h4>
                            {exercise.notes && (
                              <p className="text-xs text-muted-foreground">
                                {exercise.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="p-4 grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Sets
                            </p>
                            <p className="font-semibold text-sm">
                              {exercise.sets}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Reps
                            </p>
                            <p className="font-semibold text-sm">
                              {exercise.reps || "Tiempo"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Descanso
                            </p>
                            <p className="font-semibold flex items-center justify-center gap-1 text-sm">
                              {exercise.restTime}s
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </ScrollArea>
          </Tabs>
        </div>
        <div className="flex justify-end pt-5">
          <Button
            size="sm"
            className="text-xs"
            onClick={() => router.push("/dashboard/workout")}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
