"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Calendar01Icon,
  Dumbbell01Icon,
  LayersIcon,
  Target01Icon,
  ClockIcon,
  Note05Icon,
} from "@hugeicons/core-free-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface WorkoutExercise {
  id: string;
  sets: number;
  reps: number;
  weight: number | null;
  restTime: number | null;
  order: number;
  notes: string | null;
  day?: string | null;
  exercise: {
    id: string;
    name: string;
  };
}

interface AssignedWorkout {
  id: string;
  name: string;
  description: string | null;
  assignedDate: string;
  dueDate: string | null;
  status: string;
  notes: string | null;
  exercises: WorkoutExercise[];
  assignedTo: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  instructor: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

export default function AssignedWorkoutViewPage() {
  const params = useParams();
  const router = useRouter();
  const workoutId = params?.id as string;

  const [workout, setWorkout] = useState<AssignedWorkout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkout = async () => {
      if (!workoutId) return;

      setLoading(true);
      try {
        // Intentar primero como estudiante, luego como instructor
        let res = await fetch(`/api/students/workouts/${workoutId}`);
        if (!res.ok) {
          res = await fetch(`/api/instructors/workouts/assigned/${workoutId}`);
        }
        if (!res.ok) {
          throw new Error("No se pudo cargar la rutina");
        }
        const data = await res.json();
        setWorkout(data);
      } catch (error) {
        console.error("Error fetching workout:", error);
        toast.error("Error al cargar la rutina", {
          description: "Hubo un problema al obtener la información del plan.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [workoutId]);

  // Agrupar ejercicios por día
  const groupedExercises = useMemo(() => {
    if (!workout) return {};

    const grouped: Record<string, WorkoutExercise[]> = {};
    workout.exercises.forEach((ex) => {
      // Si no hay campo day, agrupar todos en "Todos los ejercicios"
      const dayKey = "Todos los ejercicios";
      if (!grouped[dayKey]) grouped[dayKey] = [];
      grouped[dayKey].push(ex);
    });
    return grouped;
  }, [workout]);

  // Datos para gráfica de volumen total por ejercicio
  const volumeData = useMemo(() => {
    if (!workout) return [];

    return workout.exercises.map((ex) => {
      const volume = ex.sets * ex.reps * (ex.weight || 0);
      return {
        name:
          ex.exercise.name.length > 15
            ? ex.exercise.name.substring(0, 15) + "..."
            : ex.exercise.name,
        volumen: volume,
        sets: ex.sets,
        reps: ex.reps,
      };
    });
  }, [workout]);

  // Estadísticas del plan
  const stats = useMemo(() => {
    if (!workout) return null;

    const totalExercises = workout.exercises.length;
    const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets, 0);
    const totalVolume = workout.exercises.reduce(
      (sum, ex) => sum + ex.sets * ex.reps * (ex.weight || 0),
      0,
    );
    const avgRestTime =
      workout.exercises.reduce((sum, ex) => sum + (ex.restTime || 0), 0) /
      totalExercises;

    return {
      totalExercises,
      totalSets,
      totalVolume,
      avgRestTime: Math.round(avgRestTime),
    };
  }, [workout]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-32" />
        </div>

        {/* Workout Info Card Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          </CardHeader>
          <CardContent className="px-4">
            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col p-3 rounded-lg bg-muted/50"
                >
                  <Skeleton className="h-3 w-20 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>

        {/* Chart Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
          </CardHeader>
          <CardContent className="px-4">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>

        {/* Exercises Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="px-4">
            <div className="rounded-md border">
              <div className="p-4 space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-40" />
          </CardHeader>
          <CardContent className="px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col p-4 rounded-lg bg-muted/30 border"
                >
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
        <h1 className="text-2xl font-semibold mb-2">Rutina no encontrada</h1>
        <p className="text-xs text-muted-foreground mb-4">
          La rutina que buscas no existe o no tienes acceso a ella.
        </p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Volver
        </Button>
      </div>
    );
  }

  const workoutDays = Object.keys(groupedExercises);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => router.back()}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      {/* Workout Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl tracking-heading font-semibold">
                {workout.name}
              </CardTitle>
              {workout.description && (
                <p className="text-xs text-muted-foreground">
                  {workout.description}
                </p>
              )}
            </div>
            <Badge
              variant={
                workout.status === "completed"
                  ? "default"
                  : workout.status === "in_progress"
                    ? "secondary"
                    : "outline"
              }
              className="text-xs"
            >
              {workout.status === "completed"
                ? "Completado"
                : workout.status === "in_progress"
                  ? "En progreso"
                  : "Activo"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex flex-col p-3 rounded-lg bg-muted/50">
              <span className="text-xs text-muted-foreground mb-1">
                Fecha asignada
              </span>
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon
                  icon={Calendar01Icon}
                  className="h-3.5 w-3.5 text-muted-foreground"
                />
                <span className="text-xs font-semibold">
                  {format(new Date(workout.assignedDate), "d MMM yyyy", {
                    locale: es,
                  })}
                </span>
              </div>
            </div>
            {workout.dueDate && (
              <div className="flex flex-col p-3 rounded-lg bg-muted/50">
                <span className="text-xs text-muted-foreground mb-1">
                  Fecha límite
                </span>
                <div className="flex items-center gap-1.5">
                  <HugeiconsIcon
                    icon={Target01Icon}
                    className="h-3.5 w-3.5 text-muted-foreground"
                  />
                  <span className="text-xs font-semibold">
                    {format(new Date(workout.dueDate), "d MMM yyyy", {
                      locale: es,
                    })}
                  </span>
                </div>
              </div>
            )}
            <div className="flex flex-col p-3 rounded-lg bg-muted/50">
              <span className="text-xs text-muted-foreground mb-1">
                Ejercicios
              </span>
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon
                  icon={Dumbbell01Icon}
                  className="h-3.5 w-3.5 text-muted-foreground"
                />
                <span className="text-xs font-semibold">
                  {stats?.totalExercises || 0}
                </span>
              </div>
            </div>
            <div className="flex flex-col p-3 rounded-lg bg-muted/50">
              <span className="text-xs text-muted-foreground mb-1">
                Series totales
              </span>
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon
                  icon={LayersIcon}
                  className="h-3.5 w-3.5 text-muted-foreground"
                />
                <span className="text-xs font-semibold">
                  {stats?.totalSets || 0}
                </span>
              </div>
            </div>
          </div>

          {workout.notes && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-2">
                <HugeiconsIcon
                  icon={Note05Icon}
                  className="h-4 w-4 text-primary mt-0.5 flex-shrink-0"
                />
                <div>
                  <span className="text-xs font-semibold text-primary">
                    Notas del instructor:
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {workout.notes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Chart */}
      {volumeData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl tracking-heading font-semibold">
              Volumen de Entrenamiento
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--muted))"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="volumen" radius={[4, 4, 0, 0]}>
                    {volumeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(var(--primary))`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercises by Day */}
      {workoutDays.length > 0 && (
        <div className="space-y-4">
          {workoutDays.map((day) => (
            <Card key={day}>
              <CardHeader>
                <CardTitle className="text-xl tracking-heading font-semibold">
                  {day}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Ejercicio</TableHead>
                        <TableHead className="text-xs text-center">
                          Series
                        </TableHead>
                        <TableHead className="text-xs text-center">
                          Reps
                        </TableHead>
                        <TableHead className="text-xs text-center">
                          Peso (kg)
                        </TableHead>
                        <TableHead className="text-xs text-center">
                          Descanso
                        </TableHead>
                        {groupedExercises[day].some((ex) => ex.notes) && (
                          <TableHead className="text-xs">Notas</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedExercises[day].map((exercise) => (
                        <TableRow key={exercise.id}>
                          <TableCell className="font-medium text-xs">
                            {exercise.exercise.name}
                          </TableCell>
                          <TableCell className="text-center text-xs">
                            {exercise.sets}
                          </TableCell>
                          <TableCell className="text-center text-xs">
                            {exercise.reps}
                          </TableCell>
                          <TableCell className="text-center text-xs">
                            {exercise.weight ? `${exercise.weight} kg` : "-"}
                          </TableCell>
                          <TableCell className="text-center text-xs">
                            {exercise.restTime ? (
                              <div className="flex items-center justify-center gap-1">
                                <HugeiconsIcon
                                  icon={ClockIcon}
                                  className="h-3 w-3 text-muted-foreground"
                                />
                                <span>{exercise.restTime}s</span>
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          {groupedExercises[day].some((ex) => ex.notes) && (
                            <TableCell className="text-xs text-muted-foreground">
                              {exercise.notes || "-"}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl tracking-heading font-semibold">
              Resumen del Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col p-4 rounded-lg bg-muted/30 border">
                <span className="text-xs text-muted-foreground mb-2">
                  Total Ejercicios
                </span>
                <span className="text-2xl font-semibold tracking-heading">
                  {stats.totalExercises}
                </span>
              </div>
              <div className="flex flex-col p-4 rounded-lg bg-muted/30 border">
                <span className="text-xs text-muted-foreground mb-2">
                  Total Series
                </span>
                <span className="text-2xl font-semibold tracking-heading">
                  {stats.totalSets}
                </span>
              </div>
              <div className="flex flex-col p-4 rounded-lg bg-muted/30 border">
                <span className="text-xs text-muted-foreground mb-2">
                  Volumen Total
                </span>
                <span className="text-2xl font-semibold tracking-heading">
                  {stats.totalVolume.toLocaleString()} kg
                </span>
              </div>
              <div className="flex flex-col p-4 rounded-lg bg-muted/30 border">
                <span className="text-xs text-muted-foreground mb-2">
                  Descanso Promedio
                </span>
                <span className="text-2xl font-semibold tracking-heading">
                  {stats.avgRestTime}s
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
