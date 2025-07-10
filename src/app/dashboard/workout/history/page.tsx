"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
// import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Calendar01Icon, Calendar02Icon, CheckmarkCircle02Icon, Clock02Icon, Dumbbell01Icon,  } from "@hugeicons/core-free-icons";
// import { Icons } from "@/components/icons";

export default function WorkoutHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalSessions: 0,
    totalExercises: 0,
    totalSets: 0,
    averageDuration: 0,
  });

  useEffect(() => {
    const fetchWorkoutHistory = async () => {
      try {
        const response = await fetch("/api/workout-session/history");
        if (response.ok) {
          const data: WorkoutSession[] = await response.json();
          setWorkoutSessions(data);

          // Calcular estadísticas
          if (data.length > 0) {
            const totalExercises = data.reduce(
              (acc: number, session: WorkoutSession) =>
                acc + session.exercises.length,
              0,
            );
            const totalSets = data.reduce(
              (acc: number, session: WorkoutSession) => {
                return (
                  acc +
                  session.exercises.reduce(
                    (exAcc: number, ex: Exercise) => exAcc + ex.sets.length,
                    0,
                  )
                );
              },
              0,
            );
            const totalDuration = data.reduce(
              (acc: number, session: WorkoutSession) =>
                acc + (session.duration || 0),
              0,
            );

            setStats({
              totalSessions: data.length,
              totalExercises,
              totalSets,
              averageDuration: Math.round(totalDuration / data.length),
            });
          }
        }
      } catch (error) {
        console.error("Error al cargar el historial de entrenamientos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutHistory();
  }, []);

  // Filtrar sesiones según la pestaña activa
  const filteredSessions = () => {
    if (activeTab === "all") return workoutSessions;
    if (activeTab === "completed")
      return workoutSessions.filter((session) => session.completed);
    if (activeTab === "inProgress")
      return workoutSessions.filter((session) => !session.completed);
    return workoutSessions;
  };

  // Calcular el progreso de una sesión
  const calculateSessionProgress = (session: WorkoutSession) => {
    const totalSets = session.exercises.reduce(
      (acc: number, ex: Exercise) => acc + ex.sets.length,
      0,
    );
    const completedSets = session.exercises.reduce(
      (acc: number, ex: Exercise) =>
        acc + ex.sets.filter((set: Set) => set.completed).length,
      0,
    );
    return totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  };

  // Manejar la expansión de una sesión
  const handleSessionExpand = (sessionId: string) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  if (loading) {
    return (
      <>
        <div className="mb-4 flex justify-between w-full items-center pb-2">
          <Button variant="outline" className="w-32">
            <Skeleton className="h-4 w-full" />
          </Button>
        </div>
        {/* Skeleton de estadísticas */}
        <Skeleton className="h-4 w-56 mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-6 pt-6">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Card
                key={i}
                className="px-4 py-8 flex flex-row justify-between items-center"
              >
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </Card>
            ))}
        </div>

        {/* Skeleton de Tabs */}
        <div className="flex gap-4 pb-6">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>

        {/* Skeleton de tarjetas de entrenamiento */}
        <div className="grid grid-cols-3 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="p-4 space-y-4 col-span-3 md:col-span-1">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-40" />

                <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>

                <Skeleton className="h-10 w-full rounded-md" />
              </Card>
            ))}
        </div>
      </>
    );
  }

  if (workoutSessions.length === 0) {
    return (
      <Card className="text-center py-56 items-center flex">
        <h2 className="text-sm font-medium">
          No hay entrenamientos completados
        </h2>
        <Button
          size="sm"
          className="text-xs px-6"
          onClick={() => router.push("/dashboard/workout")}
        >
          Iniciar un entrenamiento
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/workout")}
            className="mb-2 text-xs"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" /> Volver a la lista
          </Button>
          <CardTitle className="text-2xl font-semibold  tracking-heading pt-4">
            Historial de entrenamientos
          </CardTitle>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-pink-50 to-white dark:from-pink-900 dark:to-gray-800">
          <CardContent className="pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground dark:text-muted-foreground">
                  Total de sesiones
                </p>
                <p className="text-xl md:text-3xl font-semibold  tracking-heading">
                  {stats.totalSessions}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-pink-100 dark:bg-pink-800 flex items-center justify-center">
                <HugeiconsIcon icon={Calendar01Icon} className="h-6 w-6 text-pink-600 dark:text-pink-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900 dark:to-gray-800">
          <CardContent className="pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground dark:text-muted-foreground">
                  Ejercicios realizados
                </p>
                <p className="text-xl md:text-3xl font-semibold ">
                  {stats.totalExercises}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                <HugeiconsIcon icon={Dumbbell01Icon} className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-900 dark:to-gray-800">
          <CardContent className="pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground dark:text-muted-foreground">
                  Sets completados
                </p>
                <p className="text-xl md:text-3xl font-semibold ">
                  {stats.totalSets}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900 dark:to-gray-800">
          <CardContent className="pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground dark:text-muted-foreground">
                  Duración promedio
                </p>
                <p className="text-xl md:text-3xl font-semibold ">
                  {stats.averageDuration} min
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
                <HugeiconsIcon icon={Clock02Icon} className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pestañas para filtrar */}
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="completed">Completados</TabsTrigger>
          <TabsTrigger value="inProgress">En progreso</TabsTrigger>
        </TabsList>

        <TabsContent
          value={activeTab}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredSessions().map((session) => {
            const sessionDate = parseISO(session.date);
            const progress = calculateSessionProgress(session);
            const isExpanded = expandedSession === session.id;

            return (
              <Card
                key={session.id}
                className={`overflow-hidden transition-all duration-300 ${
                  isExpanded
                    ? "col-span-1 sm:col-span-2 lg:col-span-3 row-span-2"
                    : ""
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-2xl font-semibold  tracking-heading flex items-center gap-2">
                        {session.notes?.replace("Día: ", "") || "Entrenamiento"}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground flex items-center gap-2 pt-1">
                        <HugeiconsIcon icon={Calendar02Icon} size={12} />
                        {format(sessionDate, "PPP", { locale: es })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium">
                        {progress}% completado
                      </p>
                      <Progress value={progress} className="h-2 w-full" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-2 rounded-md border">
                      <p className="text-xs text-muted-foreground">Duración</p>
                      <p className="font-semibold tracking-heading">
                        {session.duration ? `${session.duration} min` : "N/A"}
                      </p>
                    </div>
                    <div className="text-center p-2 rounded-md border">
                      <p className="text-xs text-muted-foreground">
                        Ejercicios
                      </p>
                      <p className="font-semibold tracking-heading">
                        {session.exercises.length}
                      </p>
                    </div>
                    <div className="text-center p-2 rounded-md border">
                      <p className="text-xs text-muted-foreground">Sets</p>
                      <p className="font-semibold tracking-heading">
                        {session.exercises.reduce(
                          (acc: number, ex: Exercise) =>
                            acc +
                            ex.sets.filter((set: Set) => set.completed).length,
                          0,
                        )}
                      </p>
                    </div>
                  </div>

                  {session.completed ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs text-muted-foreground"
                      onClick={() => handleSessionExpand(session.id)}
                    >
                      {isExpanded ? "Ocultar detalles" : "Ver detalles"}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs text-muted-foreground"
                      onClick={() => {
                        if (!session.completed) {
                          router.push("/dashboard/workout/active");
                        }
                      }}
                      disabled={session.completed}
                    >
                      Continuar entrenamiento
                    </Button>
                  )}

                  {isExpanded && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pt-3">
                      {session.exercises.map((exercise: Exercise) => (
                        <div
                          key={exercise.id}
                          className="border rounded-md p-2 text-sm"
                        >
                          <h4 className="font-semibold  tracking-heading text-xs md:text-sm truncate border-b pb-1 mb-1">
                            {exercise.exercise.name}
                          </h4>

                          <div className="grid grid-cols-3 gap-1 text-xs font-medium text-muted-foreground">
                            <div>Set</div>
                            <div>Kg</div>
                            <div>Rep</div>
                          </div>

                          <div className="max-h-24 overflow-y-auto">
                            {exercise.sets.map((set: Set) => (
                              <div
                                key={set.id}
                                className="grid grid-cols-3 gap-1 text-xs py-0.5 border-t dark:border-zinc-800"
                              >
                                <div>{set.setNumber}</div>
                                <div>{set.weight || "-"}</div>
                                <div>{set.reps || "-"}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Define types
interface WorkoutSession {
  id: string;
  date: string;
  notes?: string;
  duration?: number;
  completed: boolean;
  exercises: Exercise[];
}

interface Exercise {
  id: string;
  exercise: {
    name: string;
  };
  completed: boolean;
  sets: Set[];
}

interface Set {
  id: string;
  setNumber: number;
  weight?: number;
  reps?: number;
  completed: boolean;
}

interface Stats {
  totalSessions: number;
  totalExercises: number;
  totalSets: number;
  averageDuration: number;
}
