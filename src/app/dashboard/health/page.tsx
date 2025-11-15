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

import { useState, useEffect } from "react";
import { WeightChart } from "@/components/weight-chart";
import { useSession } from "next-auth/react";
import { WaterIntakeTracker } from "@/components/water/water-intake-tracker";
import { GoalsDashboard } from "@/components/goals/goals-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Activity01Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  RulerIcon,
  SmileIcon,
  TapeMeasureIcon,
  WeightScaleIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

interface UserProfile {
  id: string;
  birthdate: string;
  gender: string;
  height: number;
  currentWeight: number;
  dailyActivity: string;
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
  const { data: session, status } = useSession();

  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    const profile = (session.user as unknown as { profile: UserProfile })
      ?.profile;
    if (!profile) return;

    setUser({
      id: profile.id,
      birthdate: profile.birthdate,
      gender: profile.gender,
      height: Number(profile.height),
      currentWeight: Number(profile.currentWeight),
      dailyActivity: profile.dailyActivity,
      nutrition: {
        calorieTarget: Number(profile.nutrition?.calorieTarget || 0),
        proteinTarget: Number(profile.nutrition?.proteinTarget || 0),
        carbTarget: Number(profile.nutrition?.carbTarget || 0),
        fatTarget: Number(profile.nutrition?.fatTarget || 0),
      },
      waterIntake: Number(profile.waterIntake),
      goal: profile.goal,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    });
  }, [session?.user]);

  // Calculate BMI
  const heightInMeters = user && user.height ? user.height / 100 : 0;
  const weight = user?.currentWeight;
  const bmi = weight && heightInMeters ? weight / heightInMeters ** 2 : 0;
  const bodyFat = 18;

  const minIMC = 15;
  const maxIMC = 40;
  const progressValue = ((bmi - minIMC) / (maxIMC - minIMC)) * 100;

  if (status === "loading" || !user) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-7 w-40 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="px-4">
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="px-4">
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-7 w-40 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="px-4">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Datos Físicos y Objetivos/Actividad */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Datos Físicos */}
        <Card className="rounded-lg border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold tracking-heading">
              Datos Físicos
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              Métricas corporales actuales
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4">
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center font-semibold tracking-heading text-xs text-muted-foreground">
                    <HugeiconsIcon icon={SmileIcon} className="mr-1 h-4 w-4" />
                    Edad
                  </div>
                  <div className="text-2xl font-semibold">
                    {user?.birthdate
                      ? new Date().getFullYear() -
                        new Date(user.birthdate).getFullYear()
                      : "--"}{" "}
                    años
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center font-semibold tracking-heading text-xs text-muted-foreground">
                    <HugeiconsIcon
                      icon={WeightScaleIcon}
                      className="mr-1 h-4 w-4"
                    />
                    Peso Actual
                  </div>
                  <div className="text-2xl font-semibold">
                    {user?.currentWeight} kg
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center font-semibold tracking-heading text-xs text-muted-foreground">
                    <HugeiconsIcon icon={RulerIcon} className="mr-1 h-4 w-4" />
                    Estatura
                  </div>
                  <div className="text-2xl font-semibold">
                    {user?.height} cm
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <HugeiconsIcon
                      icon={Activity01Icon}
                      className="mr-1 h-4 w-4"
                    />
                    IMC (Índice de Masa Corporal)
                  </div>
                  <span className="text-xs font-medium">{bmi.toFixed(0)}</span>
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
                  <div className="flex items-center text-xs text-muted-foreground">
                    <HugeiconsIcon
                      icon={TapeMeasureIcon}
                      className="mr-1 h-4 w-4"
                    />
                    Porcentaje de grasa corporal
                  </div>
                  <span className="text-xs font-medium">{bodyFat}%</span>
                </div>
                <Progress value={bodyFat * 3} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Objetivos y Actividad */}
        <Card className="rounded-lg border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold tracking-heading">
              Objetivos y Actividad
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              Metas y nivel de actividad física
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-medium">Objetivo</label>
                  <Select disabled value={user?.goal ?? ""}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona tu objetivo" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      <SelectItem value="lose-weight">
                        <div className="flex items-center">
                          <HugeiconsIcon
                            icon={ArrowDown01Icon}
                            className="mr-2 h-4 w-4 text-red-500"
                          />
                          Perder peso
                        </div>
                      </SelectItem>
                      <SelectItem value="maintain">
                        <div className="flex items-center">
                          <HugeiconsIcon
                            icon={ArrowRight01Icon}
                            className="mr-2 h-4 w-4 text-amber-500"
                          />
                          Mantener peso
                        </div>
                      </SelectItem>
                      <SelectItem value="gain-muscle">
                        <div className="flex items-center">
                          <HugeiconsIcon
                            icon={ArrowUp01Icon}
                            className="mr-2 h-4 w-4 text-green-500"
                          />
                          Ganar músculo
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-medium">
                    Nivel de actividad física
                  </label>
                  <Select value={user?.dailyActivity ?? ""} disabled>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona tu nivel de actividad" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
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
              </div>
              <div className="pt-2">
                <WeightChart />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progreso de Objetivos */}
      <Card className="rounded-lg border bg-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-semibold tracking-heading">
                Progreso de Objetivos
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Gestiona y actualiza el progreso de tus objetivos
              </CardDescription>
            </div>
            <Link
              href="/dashboard/health/goal"
              className="group inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Nuevo objetivo
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="px-4">
          <GoalsDashboard />
        </CardContent>
      </Card>

      {/* Agua */}
      <WaterIntakeTracker />
    </div>
  );
}
