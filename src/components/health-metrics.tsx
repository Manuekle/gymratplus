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
import { useState } from "react";
import { WeightChart } from "@/components/weight-chart";

export default function HealthMetrics() {
  const [goal, setGoal] = useState("maintain");
  const [activityLevel, setActivityLevel] = useState("moderate");

  // Calculate BMI
  const weight = 75; // kg
  const height = 175; // cm
  const bmi = weight / ((height / 100) * (height / 100));
  const bodyFat = 18; // %

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Datos Físicos</CardTitle>
          <CardDescription>Métricas corporales actuales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <WeightScaleIcon className="mr-1 h-4 w-4" />
                  Peso Actual
                </div>
                <div className="text-2xl font-bold">{weight} kg</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <RulerIcon className="mr-1 h-4 w-4" />
                  Estatura
                </div>
                <div className="text-2xl font-bold">{height} cm</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Activity01Icon className="mr-1 h-4 w-4" />
                  IMC (Índice de Masa Corporal)
                </div>
                <span className="text-sm font-medium">{bmi.toFixed(1)}</span>
              </div>
              <Progress value={bmi * 4} className="h-2" />
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Objetivo</label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose">
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
                  <SelectItem value="gain">
                    <div className="flex items-center">
                      <ArrowUp01Icon className="mr-2 h-4 w-4 text-green-500" />
                      Aumentar peso
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Nivel de actividad física
              </label>
              <Select value={activityLevel} onValueChange={setActivityLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu nivel de actividad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">
                    Sedentario (poco o nada de ejercicio)
                  </SelectItem>
                  <SelectItem value="light">
                    Ligero (ejercicio 1-3 días/semana)
                  </SelectItem>
                  <SelectItem value="moderate">
                    Moderado (ejercicio 3-5 días/semana)
                  </SelectItem>
                  <SelectItem value="active">
                    Activo (ejercicio 6-7 días/semana)
                  </SelectItem>
                  <SelectItem value="very-active">
                    Muy activo (ejercicio intenso diario)
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
