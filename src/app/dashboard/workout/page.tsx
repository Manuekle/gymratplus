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
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit02Icon, Calendar01Icon } from "@hugeicons/core-free-icons";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const daysOfWeek = [
  { id: "mon", label: "L" },
  { id: "tue", label: "M" },
  { id: "wed", label: "X" },
  { id: "thu", label: "J" },
  { id: "fri", label: "V" },
  { id: "sat", label: "S" },
  { id: "sun", label: "D" },
];

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
  const { data: session, status, update } = useSession();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [showTrainingDialog, setShowTrainingDialog] = useState(false);
  const [trainingFrequency, setTrainingFrequency] = useState(0);
  const [trainingDays, setTrainingDays] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

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
    setTrainingFrequency(Number(profile.trainingFrequency) || 0);
    setTrainingDays((profile.trainingDays as string[]) || []);
  }, [session?.user]); // Se ejecuta cuando el perfil del usuario cambia

  const handleUpdateTrainingFrequency = async () => {
    try {
      setIsSaving(true);

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainingFrequency,
          trainingDays,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update training frequency");
      }

      const data = await response.json();

      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          profile: data.profile,
        },
      });

      // Update local state
      if (user) {
        setUser({
          ...user,
          activity: {
            ...user.activity,
            trainingFrequency,
            trainingDays,
          },
        });
      }

      setShowTrainingDialog(false);
      toast.success("Días de entrenamiento actualizados", {
        description: `Ahora entrenas ${trainingFrequency} día${trainingFrequency !== 1 ? "s" : ""} por semana`,
      });
    } catch (error) {
      toast.error("Error", {
        description: "No se pudo actualizar los días de entrenamiento",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
                <div className="flex items-center gap-2">
                  <span className="font-medium text-xs">
                    {user?.activity.trainingFrequency} día
                    {user?.activity.trainingFrequency !== 1 ? "s" : ""}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      setTrainingFrequency(
                        user?.activity.trainingFrequency || 0,
                      );
                      setTrainingDays(user?.activity.trainingDays || []);
                      setShowTrainingDialog(true);
                    }}
                  >
                    <HugeiconsIcon icon={Edit02Icon} className="h-3 w-3" />
                  </Button>
                </div>
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

      {/* Training Frequency Dialog */}
      <Dialog open={showTrainingDialog} onOpenChange={setShowTrainingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Días de entrenamiento</DialogTitle>
            <DialogDescription className="text-xs">
              ¿Cuántos días por semana entrenas?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-2">
                <HugeiconsIcon icon={Calendar01Icon} className="w-4 h-4" />
                Días de entrenamiento por semana
              </Label>
              <ToggleGroup
                type="multiple"
                variant="outline"
                value={trainingDays}
                onValueChange={(value) => {
                  setTrainingDays(value);
                  setTrainingFrequency(value.length);
                }}
                className="justify-start"
              >
                {daysOfWeek.map((day) => (
                  <ToggleGroupItem
                    key={day.id}
                    value={day.id}
                    aria-label={day.label}
                    className="w-10 h-10"
                  >
                    {day.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              {trainingFrequency > 0 && (
                <p className="text-xs text-muted-foreground">
                  {trainingFrequency} día{trainingFrequency !== 1 ? "s" : ""}{" "}
                  seleccionado{trainingFrequency !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTrainingDialog(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateTrainingFrequency} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
