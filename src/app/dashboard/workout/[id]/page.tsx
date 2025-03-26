"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import WorkoutExercise from "../../../../components/workouts/workout-exercise";
import { Button } from "@/components/ui/button";
import { ArrowLeft01Icon, Calendar01Icon } from "hugeicons-react";
import { CardDescription, CardTitle } from "@/components/ui/card";
import WorkoutSkeleton from "@/components/skeleton/workout-skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StartWorkout from "@/components/workouts/start-workout";

interface Workout {
  id: string;
  name: string;
  description: string;
  type: string;
  days: {
    day: string;
    exercises: {
      id: string;
      name: string;
      sets: number;
      reps: number;
      restTime: number;
      notes?: string;
    }[];
  }[];
  exercises: {
    id: string;
    name: string;
    sets: number;
    reps: number;
  }[];
}

export default function WorkouPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!session) return;

    const fetchWorkout = async () => {
      const res = await fetch(`/api/workouts/${id}`);
      if (res.ok) {
        const data = await res.json();
        setWorkout(data);
        // console.log(data);
      } else {
        router.push("/workouts");
      }
    };

    fetchWorkout();
  }, [id, session, router]);

  // const [exerciseAdded, setExerciseAdded] = useState(false);

  if (!workout) return <WorkoutSkeleton />;

  return (
    <div>
      <div className="mb-4 flex md:flex-row flex-col justify-between w-full items-center gap-4 md:gap-2">
        <Button
          variant="outline"
          className="text-xs w-full md:w-auto"
          size="sm"
          onClick={() => router.push("/dashboard/workout")}
        >
          <ArrowLeft01Icon className="mr-2 h-4 w-4" /> Volver a la lista
        </Button>
        <span className="flex flex-row gap-2 text-xs w-full md:w-auto">
          <StartWorkout workout={workout} />
        </span>
      </div>
      <WorkoutExercise
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workoutId={workout.id}
      />
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-start gap-8">
          <div className="flex flex-col gap-1 w-full">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {workout.name}
            </CardTitle>
            <CardDescription className="text-xs">
              {workout.description}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {/* <Badge variant="outline" className="flex items-center gap-1">
              {workout.id}
            </Badge> */}
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar01Icon className="h-3 w-3" />
              {workout.days.length} días
            </Badge>
          </div>
        </div>
        <div className="pt-4">
          <Tabs defaultValue={workout.days[0]?.day}>
            <TabsList className="mb-4 flex flex-wrap h-auto gap-4 ">
              {workout.days.map((day, index) => (
                <TabsTrigger
                  key={index}
                  value={day.day}
                  className="flex-1 text-xs capitalize"
                >
                  {day.day}
                </TabsTrigger>
              ))}
            </TabsList>

            {workout.days.map((day, dayIndex) => (
              <TabsContent key={dayIndex} value={day.day}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {day.exercises.map((exercise, exIndex) => (
                    <div key={exIndex} className="border rounded-lg shadow-sm">
                      <div className="flex items-center p-4 border-b ">
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
                            Series
                          </p>
                          <p className="font-semibold">{exercise.sets}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Repeticiones
                          </p>
                          <p className="font-semibold">
                            {exercise.reps || "Tiempo"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Descanso
                          </p>
                          <p className="font-semibold flex items-center justify-center gap-1">
                            {exercise.restTime}s
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
