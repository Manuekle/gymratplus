"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { WorkoutAssignmentDialog } from "@/components/instructor/workout-assignment-dialog";

import { HugeiconsIcon } from "@hugeicons/react";

import {
  Activity02Icon,
  FireIcon,
  Note05Icon,
  Calendar01Icon,
  Dumbbell01Icon,
  LayersIcon,
  Target01Icon,
  CalendarCheckIn01Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner"; // Asegurar que toast está disponible

// --- Tipos de Datos ---
interface StudentDetail {
  id: string; // ID de la relación Instructor-Estudiante
  studentId: string; // ID del Usuario Estudiante
  name: string | null;
  email: string | null;
  image: string | null;
  agreedPrice: number | null;
  status: "active" | "pending" | "suspended" | string;
  lastWorkoutAt: string | null; // Usar string para fechas obtenidas de la API
  currentWorkoutStreak: number;
  completedWorkoutsLast7Days: number;
  totalWorkouts: number;
  averageWorkoutsPerWeek: number;
  lastNutritionLog?: string | null; // Usar string
  hasActiveMealPlan: boolean;
  hasActiveWorkoutPlan: boolean;
}

interface AssignedWorkout {
  id: string;
  name: string;
  description?: string;
  assignedDate: string;
  dueDate?: string;
  status: string;
  notes?: string;
  exercises: AssignedWorkoutExercise[];
  assignedToId?: string; // ID del estudiante asignado (User.id)
}

interface AssignedWorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restTime?: number; // En segundos
  exercise?: { name: string };
  day?: string; // Si es un workout plan con días
  notes?: string;
}

// --- Componente Principal ---
export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  // El ID que viene de los parámetros es el ID de la relación, no el studentId
  const studentRelationId = params?.id as string;

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [workouts, setWorkouts] = useState<AssignedWorkout[]>([]);
  const [foodPlans, setFoodPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingWorkouts, setLoadingWorkouts] = useState<boolean>(true);
  const [loadingFoodPlans, setLoadingFoodPlans] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] =
    useState<AssignedWorkout | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  // --- Lógica de Fetch de Detalles del Alumno ---
  useEffect(() => {
    const fetchStudent = async () => {
      if (!studentRelationId) return; // Evitar fetch si no hay ID

      setLoading(true);
      try {
        // Asumiendo que esta API devuelve la lista de estudiantes del instructor
        const res = await fetch("/api/instructors/students");
        if (!res.ok) {
          const errorData = await res
            .json()
            .catch(() => ({ message: "Error de servidor" }));
          throw new Error(
            errorData.message || "No se pudo cargar la lista de alumnos",
          );
        }
        const data: StudentDetail[] = await res.json();

        // Buscar al alumno por el ID de la relación
        const found = data.find(
          (s: StudentDetail) => s.id === studentRelationId,
        );

        if (!found) throw new Error("Alumno no encontrado");

        // Convertir strings de fecha a Date (aunque se manejan como strings en el renderizado)
        if (found.lastWorkoutAt)
          found.lastWorkoutAt = new Date(found.lastWorkoutAt).toISOString();
        if (found.lastNutritionLog)
          found.lastNutritionLog = new Date(
            found.lastNutritionLog,
          ).toISOString();

        setStudent(found);
        setError(null);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Error inesperado";
        setError(message);
        toast.error("Error al cargar el perfil", { description: message });
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [studentRelationId]);

  // --- Lógica de Fetch de Rutinas Asignadas ---
  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!student?.studentId) return;

      setLoadingWorkouts(true);
      try {
        // Asumiendo que esta API devuelve TODAS las rutinas asignadas del instructor
        const res = await fetch("/api/instructors/workouts/assigned");
        if (!res.ok) throw new Error("No se pudieron cargar las rutinas");
        const data: AssignedWorkout[] = await res.json();

        // Filtrar solo las rutinas de este alumno (usando studentId, que es el ID de usuario)
        const studentWorkouts = data.filter(
          (w) => w.assignedToId === student.studentId,
        );

        setWorkouts(studentWorkouts);
      } catch {
        toast.error("Error al cargar rutinas", {
          description: "Hubo un problema al obtener las rutinas asignadas.",
        });
        setWorkouts([]);
      } finally {
        setLoadingWorkouts(false);
      }
    };
    fetchWorkouts();
  }, [student]); // Se ejecuta cuando 'student' se ha cargado

  // --- Lógica de Fetch de Planes de Alimentación ---
  useEffect(() => {
    const fetchFoodPlans = async () => {
      if (!student?.studentId) return;

      setLoadingFoodPlans(true);
      try {
        const res = await fetch(
          `/api/instructors/students/${student.studentId}/food-plans`,
        );
        if (!res.ok) throw new Error("No se pudieron cargar los planes");
        const data = await res.json();

        // Parsear los JSON strings si es necesario
        const parsedData = data.map((item: any) => ({
          ...item,
          macros:
            typeof item.macros === "string"
              ? JSON.parse(item.macros)
              : item.macros,
          meals:
            typeof item.meals === "string"
              ? JSON.parse(item.meals)
              : item.meals,
        }));

        setFoodPlans(parsedData);
      } catch (error) {
        console.error("Error fetching food plans:", error);
        toast.error("Error al cargar planes de alimentación", {
          description: "Hubo un problema al obtener los planes asignados.",
        });
        setFoodPlans([]);
      } finally {
        setLoadingFoodPlans(false);
      }
    };
    fetchFoodPlans();
  }, [student]); // Se ejecuta cuando 'student' se ha cargado

  // --- Lógica del Modal (Agrupación de ejercicios por día) ---
  const groupedExercises = useMemo(() => {
    if (!selectedWorkout) return {};

    const grouped: Record<string, AssignedWorkoutExercise[]> = {};
    selectedWorkout.exercises.forEach((ex) => {
      // Usar el campo 'day' o 'notes' como fallback para agrupar
      const dayKey =
        ex.day?.trim() || ex.notes?.trim() || "Día único / Principal";
      if (!grouped[dayKey]) grouped[dayKey] = [];
      grouped[dayKey].push(ex);
    });
    return grouped;
  }, [selectedWorkout]);

  const workoutDays = useMemo(
    () => Object.keys(groupedExercises),
    [groupedExercises],
  );

  const [selectedDay, setSelectedDay] = useState<string>("");

  useEffect(() => {
    if (workoutDays.length > 0) {
      setSelectedDay(workoutDays[0]);
    }
  }, [workoutDays]);

  // --- Estados de Carga y Error ---
  if (loading) {
    return (
      <div>
        <div className="mb-4">
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-80 space-y-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col items-center gap-2">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardHeader>
              <CardContent className="px-4 space-y-2">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-48" />
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent className="px-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
        <Button
          onClick={() => (window.location.href = "/dashboard/students/list")}
          size="sm"
        >
          Volver a alumnos
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          className="md:w-auto w-full text-xs"
          onClick={() => (window.location.href = "/dashboard/students/list")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />{" "}
          Volver a alumnos
        </Button>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Compact Sidebar */}

        <div className="w-full md:w-80 space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={student.image || undefined}
                    alt={student.name || "Alumno"}
                  />
                  <AvatarFallback className="text-xl tracking-heading font-semibold">
                    {student.name?.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center space-y-1">
                  <h2 className="text-lg tracking-heading font-semibold">
                    {student.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {student.email}
                  </p>
                </div>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  <Badge
                    variant={
                      student.status === "active" ? "default" : "secondary"
                    }
                    className="text-xs px-2 py-0"
                  >
                    {student.status === "active"
                      ? "Activo"
                      : student.status === "pending"
                        ? "Pendiente"
                        : student.status.charAt(0).toUpperCase() +
                          student.status.slice(1)}
                  </Badge>
                  {student.agreedPrice && (
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      ${student.agreedPrice.toFixed(2)}/mes
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 space-y-3">
              {/* Compact Stats Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex flex-col p-2 rounded-md bg-muted/50">
                  <span className="text-muted-foreground">Racha</span>
                  <span className="font-semibold text-xs flex items-center gap-1">
                    <HugeiconsIcon icon={FireIcon} className="h-3 w-3" />
                    {student.currentWorkoutStreak}{" "}
                    {student.currentWorkoutStreak === 1 ? "día" : "días"}
                  </span>
                </div>
                <div className="flex flex-col p-2 rounded-md bg-muted/50">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold text-xs flex items-center gap-1">
                    <HugeiconsIcon icon={Dumbbell01Icon} className="h-3 w-3" />
                    {student.totalWorkouts}
                  </span>
                </div>
                <div className="flex flex-col p-2 rounded-md bg-muted/50">
                  <span className="text-muted-foreground">Últ. 7 días</span>
                  <span className="font-semibold text-xs flex items-center gap-1">
                    <HugeiconsIcon icon={Activity02Icon} className="h-3 w-3" />
                    {student.completedWorkoutsLast7Days}
                  </span>
                </div>
                <div className="flex flex-col p-2 rounded-md bg-muted/50">
                  <span className="text-muted-foreground">Último</span>
                  <span className="font-semibold text-xs">
                    {student.lastWorkoutAt
                      ? isToday(new Date(student.lastWorkoutAt))
                        ? "Hoy"
                        : format(new Date(student.lastWorkoutAt), "d MMM", {
                            locale: es,
                          })
                      : "N/A"}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Active Plans */}
              <div className="space-y-1.5">
                <h3 className="text-xs tracking-heading font-semibold">
                  Planes Activos
                </h3>
                {student.hasActiveWorkoutPlan && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <HugeiconsIcon
                      icon={Target01Icon}
                      className="h-3.5 w-3.5 text-primary"
                    />
                    <span>Plan de entrenamiento</span>
                  </div>
                )}
                {student.hasActiveMealPlan && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <HugeiconsIcon
                      icon={Activity02Icon}
                      className="h-3.5 w-3.5 text-green-600"
                    />
                    <span>Plan de nutrición</span>
                  </div>
                )}
                {!student.hasActiveWorkoutPlan &&
                  !student.hasActiveMealPlan && (
                    <p className="text-xs text-muted-foreground italic">
                      Sin planes activos
                    </p>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Compact */}
        <div className="flex-1 space-y-3">
          {/* Workouts Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl tracking-heading font-semibold">
                  Rutinas Asignadas
                </CardTitle>
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 text-xs"
                  onClick={() => setIsAssignDialogOpen(true)}
                >
                  Asignar Rutina
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4">
              {loadingWorkouts ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : workouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/50">
                  <h3 className="text-xs font-medium mb-2">
                    No hay rutinas asignadas
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Este alumno aún no tiene rutinas asignadas.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {workouts.map((w: AssignedWorkout) => {
                    const statusColor =
                      w.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : w.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800";
                    const totalSets = w.exercises.reduce(
                      (sum, ex) => sum + (ex.sets || 0),
                      0,
                    );

                    return (
                      <div
                        key={w.id}
                        className="group relative p-4 border rounded-xl cursor-pointer hover:shadow-md transition-all duration-200 bg-background hover:border-zinc-200 dark:hover:border-zinc-800/50 overflow-hidden"
                        onClick={() => {
                          setSelectedWorkout(w);
                          setIsModalOpen(true);
                        }}
                      >
                        {/* Status Badge */}
                        {w.status !== "pending" && (
                          <div className="absolute top-3 right-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
                            >
                              {w.status === "completed"
                                ? "Completado"
                                : w.status === "in_progress"
                                  ? "En progreso"
                                  : ""}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-col h-full">
                          {/* Workout Name */}
                          <h3 className="text-lg tracking-heading font-semibold mb-2 pr-8 group-hover:text-primary transition-colors">
                            {w.name}
                          </h3>

                          {/* Workout Stats */}
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <HugeiconsIcon
                                icon={Calendar01Icon}
                                className="h-3.5 w-3.5 flex-shrink-0"
                              />
                              <span className="truncate">
                                {format(
                                  new Date(w.assignedDate),
                                  "d MMM yyyy",
                                  { locale: es },
                                )}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <HugeiconsIcon
                                icon={Dumbbell01Icon}
                                className="h-3.5 w-3.5 flex-shrink-0"
                              />
                              <span>
                                {w.exercises.length}{" "}
                                {w.exercises.length === 1
                                  ? "ejercicio"
                                  : "ejercicios"}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <HugeiconsIcon
                                icon={LayersIcon}
                                className="h-3.5 w-3.5 flex-shrink-0"
                              />
                              <span>
                                {totalSets}{" "}
                                {totalSets === 1 ? "serie" : "series"}
                              </span>
                            </div>

                            {w.dueDate && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <HugeiconsIcon
                                  icon={CalendarCheckIn01Icon}
                                  className="h-3.5 w-3.5 flex-shrink-0"
                                />
                                <span>
                                  Vence{" "}
                                  {format(new Date(w.dueDate), "d MMM", {
                                    locale: es,
                                  })}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Progress indicator for in-progress workouts */}
                          {w.status === "in_progress" && (
                            <div className="mt-3">
                              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all duration-500"
                                  style={{ width: "60%" }} // Replace with actual progress
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 text-right">
                                60% completado
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Food Plans Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl tracking-heading font-semibold">
                  Planes de Alimentación
                </CardTitle>
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 text-xs"
                  onClick={() =>
                    router.push(
                      `/dashboard/students/list/${studentRelationId}/mealplan`,
                    )
                  }
                >
                  Crear Plan
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4">
              {loadingFoodPlans ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : foodPlans.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <h3 className="text-xs font-medium mb-2">
                    No hay planes de alimentación
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mb-4">
                    Crea un plan de alimentación personalizado para este alumno
                    basado en su perfil nutricional.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {foodPlans.map((plan: any) => {
                    const macros =
                      typeof plan.macros === "string"
                        ? JSON.parse(plan.macros)
                        : plan.macros;

                    return (
                      <div
                        key={plan.id}
                        className="group relative p-4 border rounded-xl hover:shadow-md transition-all duration-200 bg-background hover:border-zinc-200 dark:hover:border-zinc-800/50 overflow-hidden"
                      >
                        <div className="flex flex-col h-full">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg tracking-heading font-semibold pr-2">
                              Plan de Alimentación
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {format(new Date(plan.createdAt), "d MMM yyyy", {
                                locale: es,
                              })}
                            </Badge>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <HugeiconsIcon
                                icon={FireIcon}
                                className="h-3.5 w-3.5 flex-shrink-0"
                              />
                              <span>{plan.calorieTarget} kcal objetivo</span>
                            </div>

                            {macros && (
                              <div className="space-y-1 pt-2 border-t">
                                {macros.protein && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Proteína:
                                    </span>
                                    <span className="font-medium">
                                      {macros.protein}
                                    </span>
                                  </div>
                                )}
                                {macros.carbs && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Carbohidratos:
                                    </span>
                                    <span className="font-medium">
                                      {macros.carbs}
                                    </span>
                                  </div>
                                )}
                                {macros.fat && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Grasas:
                                    </span>
                                    <span className="font-medium">
                                      {macros.fat}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {plan.notes && (
                              <div className="pt-2 border-t">
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {plan.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl tracking-heading font-semibold">
                Resumen de Actividad
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Promedio semanal
                  </span>
                  <span className="font-normal">
                    {student.averageWorkoutsPerWeek.toFixed(1)} entrenos
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Racha actual</span>
                  <span className="font-normal flex items-center gap-1">
                    <HugeiconsIcon icon={FireIcon} className="h-3 w-3 " />
                    {student.currentWorkoutStreak}{" "}
                    {student.currentWorkoutStreak === 1 ? "día" : "días"}
                  </span>
                </div>
                {student.lastNutritionLog && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Último registro nutricional
                    </span>
                    <span className="font-semibold">
                      {format(new Date(student.lastNutritionLog), "d MMM", {
                        locale: es,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {student && (
        <>
          <WorkoutAssignmentDialog
            open={isAssignDialogOpen}
            onOpenChange={setIsAssignDialogOpen}
            studentId={student.studentId}
            studentName={student.name || "el alumno"}
            onSuccess={() => {
              // Refresh the workouts list after successful assignment
              // You might want to add a refetch function for workouts
              setIsAssignDialogOpen(false);
            }}
          />
        </>
      )}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader>
            <DialogTitle className="text-2xl tracking-heading font-semibold">
              {selectedWorkout?.name || "Detalle de Rutina"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Información completa y ejercicios de la rutina asignada.
            </DialogDescription>
          </DialogHeader>

          {selectedWorkout && (
            <div className="space-y-3">
              {/* Metadata */}
              <div className="space-y-2">
                <div className="flex gap-1.5 flex-wrap text-xs">
                  <Badge variant="secondary" className="gap-1">
                    <HugeiconsIcon icon={Calendar01Icon} className="h-3 w-3" />
                    {format(
                      new Date(selectedWorkout.assignedDate),
                      "d MMM yy",
                      { locale: es },
                    )}
                  </Badge>
                  {selectedWorkout.dueDate && (
                    <Badge variant="secondary" className="gap-1">
                      Vence:{" "}
                      {format(new Date(selectedWorkout.dueDate), "d MMM yy", {
                        locale: es,
                      })}
                    </Badge>
                  )}
                </div>

                {selectedWorkout.description && (
                  <p className="text-xs text-muted-foreground">
                    {selectedWorkout.description}
                  </p>
                )}

                {selectedWorkout.notes && (
                  <div className="text-xs bg-accent/50 rounded-lg p-2 flex items-start gap-2">
                    <HugeiconsIcon
                      icon={Note05Icon}
                      className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <span className="font-semibold text-primary">Notas:</span>
                      <p className="text-muted-foreground">
                        {selectedWorkout.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Exercises */}
              {workoutDays.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <h3 className="text-xs font-medium mb-2">
                    No hay ejercicios registrados
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Esta rutina aún no tiene ejercicios asignados.
                  </p>
                </div>
              ) : (
                <div className="w-full">
                  <div className="sticky top-0 bg-background z-10 pb-2 pt-1">
                    <div className="flex flex-nowrap overflow-x-auto pb-1 gap-1.5 hide-scrollbar">
                      {workoutDays.map((day) => (
                        <button
                          key={day}
                          onClick={() => setSelectedDay(day)}
                          className={`flex-shrink-0 px-2 py-1 text-xs rounded-full border transition-all ${
                            selectedDay === day
                              ? "bg-primary/80 dark:bg-primary/20 border-primary/20 text-white dark:text-white font-medium"
                              : "border-border/50 text-black dark:text-white hover:bg-muted/50"
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="max-h-[400px] w-full overflow-y-auto scroll-hidden">
                    <div className="space-y-1 pr-2">
                      {(groupedExercises[selectedDay] ?? []).map(
                        (ex: AssignedWorkoutExercise, idx: number) => (
                          <div
                            key={ex.id || idx}
                            className="flex flex-col border-b py-2 last:border-0"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-medium text-[13px] flex-1 truncate pr-2">
                                {ex.exercise?.name || ex.name}
                              </h4>
                              <div className="flex items-center gap-3 text-xs flex-shrink-0">
                                <span className="text-muted-foreground whitespace-nowrap">
                                  {ex.sets} × {ex.reps}
                                </span>
                                {ex.restTime && (
                                  <span className="font-medium whitespace-nowrap">
                                    ⏱️ {ex.restTime}s
                                  </span>
                                )}
                              </div>
                            </div>
                            {ex.notes && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {ex.notes}
                              </p>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
