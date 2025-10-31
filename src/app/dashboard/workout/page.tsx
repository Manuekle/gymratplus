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

interface UserProfile {
  id: string;
  activity: {
    level: string;
    daily: string;
    trainingFrequency: number;
  };
}

export default function WorkoutsPage() {
  const { data: session } = useSession();

  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    const profile = (
      session.user as {
        profile?: {
          id: string;
          activityLevel: string;
          dailyActivity: string;
          trainingFrequency: number;
        };
      }
    )?.profile;

    if (!profile) return;

    setUser({
      id: profile.id,
      activity: {
        level: profile.activityLevel,
        daily: profile.dailyActivity,
        trainingFrequency: Number(profile.trainingFrequency),
      },
    });
  }, [session?.user]); // Se ejecuta cuando el perfil del usuario cambia

  console.log(user);

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
        <CardContent>
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
                  {user?.activity.trainingFrequency}
                </span>
              </div>
              <Progress value={5 * 14.28} className="h-2" />
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
        <CardContent>
          <ExerciseProgressChart />
        </CardContent>
      </Card>
      <WorkoutCreator />
      <WorkoutHistory />
    </div>
  );
}
