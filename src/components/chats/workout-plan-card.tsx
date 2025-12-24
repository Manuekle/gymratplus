"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils/utils";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restTime: number;
  notes?: string;
  muscleGroup: string;
}

interface WorkoutDay {
  day: string;
  exercises: Exercise[];
}

interface WorkoutPlanCardProps {
  plan: {
    focus: string;
    daysPerWeek: number;
    durationMinutes: number;
    difficulty: string;
    description?: string;
    days?: WorkoutDay[];
  };
  onSave?: () => void;
  isSaved?: boolean;
}

export function WorkoutPlanCard({
  plan,
  onSave,
  isSaved,
}: WorkoutPlanCardProps) {
  return (
    <Card className="w-full min-w-[320px] overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-3 border-b bg-muted/30">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold leading-none">Plan de Entrenamiento</h3>
              <Badge variant="secondary" className="font-bold text-[10px] uppercase tracking-wider">
                {plan.difficulty}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium capitalize">
              {plan.focus.replace("_", " ")} • {plan.daysPerWeek} días/sem • {plan.durationMinutes} min
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Workout Days Tabs */}
        {plan.days && plan.days.length > 0 ? (
          <Tabs defaultValue="0" className="w-full">
            <div className="px-4 pt-3 overflow-x-auto">
              <TabsList className="h-9 bg-muted/60 p-1 justify-start w-max min-w-full">
                {plan.days.map((day, index) => {
                  const muscleGroup = day.day.includes(" - ")
                    ? day.day.split(" - ")[1]
                    : day.day;

                  return (
                    <TabsTrigger
                      key={index}
                      value={index.toString()}
                      className="text-xs px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      {muscleGroup}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {plan.days.map((workoutDay, dayIndex) => (
              <TabsContent key={dayIndex} value={dayIndex.toString()} className="mt-0 p-4 pt-4 animate-in fade-in-0">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                    {workoutDay.day}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {workoutDay.exercises.map((exercise, exIndex) => (
                    <div
                      key={exercise.id || exIndex}
                      className="group flex flex-col gap-1 p-3 rounded-lg border bg-background hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span className="font-semibold text-sm">
                          {exercise.name}
                        </span>
                        <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded text-xs text-muted-foreground font-mono font-medium shrink-0">
                          <span>{exercise.sets} sets</span>
                          <span className="opacity-30">|</span>
                          <span>{exercise.reps} reps</span>
                        </div>
                      </div>
                      {exercise.notes && (
                        <p className="text-muted-foreground text-[11px] line-clamp-2 pl-2 border-l-2 border-primary/20">
                          {exercise.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="p-6 text-center">
            {plan.description && (
              <p className="text-sm text-muted-foreground italic">
                {plan.description}
              </p>
            )}
          </div>
        )}
      </CardContent>

      {/* Save Button */}
      <CardFooter className="bg-muted/20 p-3 border-t">
        <Button
          onClick={onSave}
          disabled={isSaved}
          className={cn("w-full font-bold uppercase tracking-wide", isSaved && "bg-green-600 hover:bg-green-700")}
        >
          {isSaved ? "Plan Guardado" : "Guardar Plan"}
        </Button>
      </CardFooter>
    </Card>
  );
}
