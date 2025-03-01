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
import { Dumbbell, Calendar } from "lucide-react";
import { ExerciseProgressChart } from "@/components/exercise-progress-chart";

export default function TrainingMetrics() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Rutina de Entrenamiento</CardTitle>
          <CardDescription>
            Información sobre tu plan de entrenamiento actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rutina actual</label>
              <Select defaultValue="hypertrophy">
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
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Días de entrenamiento por semana</span>
                </div>
                <span className="font-medium">5</span>
              </div>
              <Progress value={5 * 14.28} className="h-2" />
              <div className="grid grid-cols-7 gap-2 text-xs text-center">
                <div className="bg-primary/20 rounded-sm py-1">L</div>
                <div className="bg-primary/20 rounded-sm py-1">M</div>
                <div className="py-1">X</div>
                <div className="bg-primary/20 rounded-sm py-1">J</div>
                <div className="bg-primary/20 rounded-sm py-1">V</div>
                <div className="bg-primary/20 rounded-sm py-1">S</div>
                <div className="py-1">D</div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center text-sm">
                <Dumbbell className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Ejercicios principales</span>
              </div>
              <div className="grid gap-3">
                <div className="flex justify-between items-center">
                  <span>Sentadilla</span>
                  <span className="font-medium">100 kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Press de banca</span>
                  <span className="font-medium">80 kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Peso muerto</span>
                  <span className="font-medium">120 kg</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Progreso de Ejercicios</CardTitle>
          <CardDescription>
            Evolución de tus levantamientos principales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExerciseProgressChart />
        </CardContent>
      </Card>
    </div>
  );
}
