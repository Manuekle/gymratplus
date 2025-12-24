"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/icons";
import { toast } from "sonner";

interface WorkoutPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workoutPlan: {
    name: string;
    description: string;
    days: Array<{
      day: string;
      exercises: Array<{
        id: string;
        name: string;
        sets: number;
        reps: number;
        restTime: number;
        muscleGroup?: string;
      }>;
    }>;
  } | null;
}

export function AIWorkoutPlanDialog({
  open,
  onOpenChange,
  workoutPlan,
}: WorkoutPlanDialogProps) {
  const [saving, setSaving] = useState(false);

  const handleAccept = async () => {
    if (!workoutPlan) return;

    setSaving(true);
    try {
      // Transform to format expected by /api/personalized-workout
      const exerciseIds = workoutPlan.days.flatMap((day) =>
        day.exercises.map((ex) => ({
          exerciseId: ex.id,
          day: day.day,
          sets: ex.sets,
          reps: ex.reps,
          restTime: ex.restTime,
        })),
      );

      const response = await fetch("/api/personalized-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workoutPlan.name,
          exerciseIds,
          days: workoutPlan.days.map((d) => d.day),
          workoutType: "custom",
        }),
      });

      if (!response.ok) {
        throw new Error("Error guardando el plan");
      }

      toast.success("¡Plan de entrenamiento guardado con éxito!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving workout plan:", error);
      toast.error("Error al guardar el plan de entrenamiento");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = () => {
    onOpenChange(false);
    toast.info("Plan descartado");
  };

  if (!workoutPlan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-heading">
            {workoutPlan.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {workoutPlan.description}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={workoutPlan.days[0]?.day} className="w-full">
          <ScrollArea className="w-full pb-2">
            <TabsList className="flex flex-nowrap h-auto w-auto px-1">
              {workoutPlan.days.map((day) => (
                <TabsTrigger
                  key={day.day}
                  value={day.day}
                  className="text-xs px-3 py-1 whitespace-nowrap"
                >
                  {day.day}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>

          <ScrollArea className="h-[50vh] sm:h-[400px] mt-4">
            {workoutPlan.days.map((day) => (
              <TabsContent key={day.day} value={day.day} className="m-0">
                <div className="space-y-3">
                  {day.exercises.map((exercise, idx) => (
                    <div
                      key={`${exercise.id}-${idx}`}
                      className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2 p-3 sm:p-4 border rounded-lg bg-muted/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs sm:text-xs truncate">
                          {exercise.name}
                        </p>
                        {exercise.muscleGroup && (
                          <p className="text-xs sm:text-xs text-muted-foreground capitalize">
                            {exercise.muscleGroup}
                          </p>
                        )}
                        <p className="text-xs sm:text-xs text-muted-foreground mt-1">
                          {exercise.sets} series × {exercise.reps} repeticiones
                        </p>
                      </div>
                      <div className="bg-background px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs font-medium whitespace-nowrap self-start sm:self-auto">
                        ⏱️ {exercise.restTime}s
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </ScrollArea>
        </Tabs>

        <DialogFooter className="gap-2 flex-col-reverse sm:flex-row">
          <Button
            variant="outline"
            onClick={handleReject}
            disabled={saving}
            className="text-xs"
          >
            Rechazar
          </Button>
          <Button onClick={handleAccept} disabled={saving} className="text-xs">
            {saving ? (
              <>
                <Icons.spinner className="h-3 w-3 animate-spin mr-2" />
                Guardando...
              </>
            ) : (
              "Aceptar y guardar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
