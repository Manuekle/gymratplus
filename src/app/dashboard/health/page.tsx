"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Activity01Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  RulerIcon,
  WeightScaleIcon,
} from "hugeicons-react";
import { useState, useEffect } from "react";
import { WeightChart } from "@/components/weight-chart";
import { useSession } from "next-auth/react";

interface UserProfile {
  id: string;
  gender: string;
  height: number;
  weight: {
    current: number;
    target: number;
  };
  activity: {
    level: string;
    daily: string;
    trainingFrequency: number;
  };
  nutrition: {
    calorieTarget: number;
    proteinTarget: number;
    carbTarget: number;
    fatTarget: number;
  };
  waterIntake: number;
  goal: string;
  createdAt: string;
  updatedAt: string;
}

export default function HealthPage() {
  const { data: session } = useSession();

  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    const profile = (session.user as { profile: UserProfile })?.profile;

    if (!profile) return;

    setUser({
      id: profile.id,
      gender: profile.gender,
      height: Number(profile.height),
      weight: {
        current: Number(profile.weight.current),
        target: Number(profile.weight.target),
      },
      activity: {
        level: profile.activity.level,
        daily: profile.activity.daily,
        trainingFrequency: Number(profile.activity.trainingFrequency),
      },
      nutrition: {
        calorieTarget: Number(profile.nutrition.calorieTarget),
        proteinTarget: Number(profile.nutrition.proteinTarget),
        carbTarget: Number(profile.nutrition.carbTarget),
        fatTarget: Number(profile.nutrition.fatTarget),
      },
      waterIntake: Number(profile.waterIntake),
      goal: profile.goal,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    });
  }, [session?.user]); // Se ejecuta cuando el perfil del usuario cambia

  console.log(user);

  // Calculate BMI
  const heightInMeters = user && user.height ? user.height / 100 : 0; // Convertir cm a metros
  const weight = user?.weight.current;
  const bmi = weight && heightInMeters ? weight / heightInMeters ** 2 : 0;
  console.log(bmi);
  const bodyFat = 18;

  const minIMC = 15;
  const maxIMC = 40;
  const progressValue = ((bmi - minIMC) / (maxIMC - minIMC)) * 100;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Datos Físicos</CardTitle>
          <CardDescription className="text-xs">
            Métricas corporales actuales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <WeightScaleIcon className="mr-1 h-4 w-4" />
                  Peso Actual
                </div>
                <div className="text-2xl font-bold">
                  {user?.weight.current} kg
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <RulerIcon className="mr-1 h-4 w-4" />
                  Estatura
                </div>
                <div className="text-2xl font-bold">{user?.height} cm</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Activity01Icon className="mr-1 h-4 w-4" />
                  IMC (Índice de Masa Corporal)
                </div>
                <span className="text-sm font-medium">{bmi.toFixed(0)}</span>
              </div>
              <Progress value={progressValue} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Bajo peso</span>
                <span>Normal</span>
                <span>Sobrepeso</span>
                <span>Obesidad</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Porcentaje de grasa corporal
                </span>
                <span className="text-sm font-medium">{bodyFat}%</span>
              </div>
              <Progress value={bodyFat * 3} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Objetivos y Actividad</CardTitle>
          <CardDescription>Metas y nivel de actividad física</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Objetivo</label>
              <Select disabled value={user?.goal}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose-weight">
                    <div className="flex items-center">
                      <ArrowDown01Icon className="mr-2 h-4 w-4 text-red-500" />
                      Bajar de peso
                    </div>
                  </SelectItem>
                  <SelectItem value="maintain">
                    <div className="flex items-center">
                      <ArrowRight01Icon className="mr-2 h-4 w-4 text-amber-500" />
                      Mantener peso
                    </div>
                  </SelectItem>
                  <SelectItem value="gain-muscle">
                    <div className="flex items-center">
                      <ArrowUp01Icon className="mr-2 h-4 w-4 text-green-500" />
                      Aumentar peso
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">
                Nivel de actividad física
              </label>
              <Select value={user?.activity?.daily} disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu nivel de actividad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office-work">
                    Trabajo de oficina (sedentario)
                  </SelectItem>
                  <SelectItem value="light-physical">
                    Trabajo físico ligero
                  </SelectItem>
                  <SelectItem value="moderate-physical">
                    Trabajo físico moderado
                  </SelectItem>
                  <SelectItem value="heavy-physical">
                    Trabajo físico pesado
                  </SelectItem>
                  <SelectItem value="very-heavy-physical">
                    Trabajo físico muy pesado
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <WeightChart />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
