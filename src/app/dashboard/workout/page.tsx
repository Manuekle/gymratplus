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
import { ExerciseProgressChart } from "@/components/exercise-progress-chart";
import WorkoutCreator from "@/components/workouts/workout-creator";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
// import { WorkoutGeneratorForm } from "@/components/workout-generator/workout-generator-form";
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
          <CardTitle className="text-2xl font-bold tracking-tight">
            Rutina de Entrenamiento
          </CardTitle>
          <CardDescription className="text-xs">
            Información sobre tu plan de entrenamiento actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Rutina actual</label>
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
                <div className="flex items-center text-sm">
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
              {/* <div className="grid grid-cols-7 gap-2 text-xs text-center pt-2">
                <div className="bg-primary/20 rounded-sm py-1">L</div>
                <div className="bg-primary/20 rounded-sm py-1">M</div>
                <div className="py-1">X</div>
                <div className="bg-primary/20 rounded-sm py-1">J</div>
                <div className="bg-primary/20 rounded-sm py-1">V</div>
                <div className="bg-primary/20 rounded-sm py-1">S</div>
                <div className="py-1">D</div>
              </div> */}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">
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
