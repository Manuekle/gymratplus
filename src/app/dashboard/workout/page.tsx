"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ExerciseProgressChart } from "@/components/workout/exercise-progress-chart";
import WorkoutCreator from "@/components/workouts/workout-creator";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import WorkoutHistory from "@/components/workouts/workout-history";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  id: string;
  activity: {
    level: string;
    daily: string;
    trainingFrequency: number;
    trainingDays: string[];
  };
}

export default function WorkoutsPage() {
  const { data: session, status } = useSession();

  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    const profile = session.user.profile as
      | {
          id?: string;
          activityLevel?: string;
          dailyActivity?: string;
          trainingFrequency?: number;
          trainingDays?: string[];
        }
      | null
      | undefined;

    if (!profile || !profile.id) return;

    setUser({
      id: profile.id,
      activity: {
        level: profile.activityLevel || "",
        daily: profile.dailyActivity || "",
        trainingFrequency: Number(profile.trainingFrequency) || 0,
        trainingDays: (profile.trainingDays as string[]) || [],
      },
    });
  }, [session?.user]); // Se ejecuta cuando el perfil del usuario cambia

  console.log(user);

  if (status === "loading" || !user) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="px-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-2 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-7 w-44 mb-2" />
            <Skeleton className="h-4 w-52" />
          </CardHeader>
          <CardContent className="px-4">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <Skeleton className="h-7 w-40 mb-2" />
          </CardHeader>
          <CardContent className="px-4">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <Skeleton className="h-7 w-36 mb-2" />
          </CardHeader>
          <CardContent className="px-4">
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-semibold  tracking-heading">
            Rutina de Entrenamiento
          </CardTitle>
          <CardDescription className="text-xs">
            Información sobre tu plan de entrenamiento actual
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <div className="space-y-6">
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-medium">Rutina actual</label>
              <Select disabled defaultValue="custom">
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu rutina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">Fuerza</SelectItem>
                  <SelectItem value="hypertrophy">Hipertrofia</SelectItem>
                  <SelectItem value="endurance">Resistencia</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="custom">Personalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs">
                  {/* <Calendar02Icon className="mr-2 h-4 w-4 text-muted-foreground" /> */}
                  <span className="text-xs">
                    Días de entrenamiento por semana
                  </span>
                </div>
                <span className="font-medium text-xs">
                  {user?.activity.trainingFrequency} día
                  {user?.activity.trainingFrequency !== 1 ? "s" : ""}
                </span>
              </div>
              {user?.activity.trainingDays &&
                user.activity.trainingDays.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Días:{" "}
                    {user.activity.trainingDays
                      .map((dayId) => {
                        const dayMap: Record<string, string> = {
                          mon: "L",
                          tue: "M",
                          wed: "X",
                          thu: "J",
                          fri: "V",
                          sat: "S",
                          sun: "D",
                        };
                        return dayMap[dayId] || dayId;
                      })
                      .join(", ")}
                  </div>
                )}
              <Progress
                value={(user?.activity.trainingFrequency || 0) * 14.28}
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-semibold  tracking-heading">
            Progreso de Ejercicios
          </CardTitle>
          <CardDescription className="text-xs">
            Evolución de tus levantamientos principales
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <ExerciseProgressChart />
        </CardContent>
      </Card>
      <WorkoutCreator />
      <WorkoutHistory />
    </div>
  );
}
