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
import {
  ArrowLeft01Icon,
  Calendar02Icon,
  Dumbbell01Icon,
  ChartLineData01Icon,
} from "@hugeicons/core-free-icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState<{
    volumeHistory: { date: string; volume: number }[];
    exercises: { id: string; name: string; history: { date: string; oneRm: number }[] }[];
  } | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("all");

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

    // Fetch Analytics Data
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics/progress");
        if (response.ok) {
          const data = await response.json();
          setAnalyticsData(data);
          if (data.exercises.length > 0) {
            setSelectedExerciseId(data.exercises[0].id);
          }
        }
      } catch (error) {
        console.error("Error loading analytics:", error);
      }
    };
    fetchAnalytics();
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4 px-4">
        <h2 className="text-xs font-medium">
          No hay entrenamientos completados
        </h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          Aún no has completado ningún entrenamiento. Inicia uno para comenzar a
          registrar tu progreso.
        </p>
        <Button
          size="default"
          className="text-xs"
          onClick={() => router.push("/dashboard/workout")}
        >
          Iniciar un entrenamiento
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="md:w-auto w-full">
          <Button
            variant="outline"
            size="default"
            onClick={() => router.push("/dashboard/workout")}
            className="mb-2 text-xs md:w-auto w-full"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />{" "}
            Volver a la lista
          </Button>
          <CardTitle className="text-2xl font-semibold  tracking-heading pt-4">
            Historial de entrenamientos
          </CardTitle>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-background">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-medium text-muted-foreground">Total Sesiones</span>
            <span className="text-4xl font-bold tracking-[-0.04em] mt-2">
              {stats.totalSessions}
            </span>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-background">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-medium text-muted-foreground">Ejercicios</span>
            <span className="text-4xl font-bold tracking-[-0.04em] mt-2">
              {stats.totalExercises}
            </span>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-background">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-medium text-muted-foreground">Total Sets</span>
            <span className="text-4xl font-bold tracking-[-0.04em] mt-2">
              {stats.totalSets}
            </span>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-background">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-medium text-muted-foreground">Promedio (min)</span>
            <span className="text-4xl font-bold tracking-[-0.04em] mt-2">
              {stats.averageDuration}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Pestañas para filtrar */}
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <div className="w-full md:w-fit overflow-x-auto md:overflow-visible">
          <TabsList className="inline-flex flex-wrap h-auto gap-1.5 sm:gap-2 p-1.5 w-full sm:w-auto min-w-0 mb-4">
            <TabsTrigger value="all" className="text-xs flex-shrink-0">
              Todos
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs flex-shrink-0">
              Completados
            </TabsTrigger>
            <TabsTrigger value="inProgress" className="text-xs flex-shrink-0">
              En progreso
            </TabsTrigger>
            <TabsTrigger value="charts" className="text-xs flex-shrink-0">
              Estadísticas
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="charts" className="space-y-6">
          {/* Volume Chart */}
          <Card className="p-4 md:p-6">
            <CardTitle className="text-lg font-semibold mb-4 flex items-center gap-2">
              <HugeiconsIcon icon={ChartLineData01Icon} className="w-5 h-5 text-primary" />
              Volumen Total por Sesión (kg)
            </CardTitle>
            <div className="h-[300px] w-full">
              {analyticsData?.volumeHistory && analyticsData.volumeHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.volumeHistory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(val) => format(parseISO(val), "dd/MM", { locale: es })}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                      labelFormatter={(label) => format(parseISO(label), "PPP", { locale: es })}
                    />
                    <Bar dataKey="volume" fill="currentColor" className="fill-primary" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                  No hay suficientes datos para mostrar la gráfica de volumen.
                </div>
              )}
            </div>
          </Card>

          {/* Strength Chart */}
          <Card className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <HugeiconsIcon icon={Dumbbell01Icon} className="w-5 h-5 text-primary" />
                Progresión de Fuerza (1RM Estimado)
              </CardTitle>
              <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                <SelectTrigger className="w-full sm:w-[200px] text-xs h-9">
                  <SelectValue placeholder="Selecciona ejercicio" />
                </SelectTrigger>
                <SelectContent>
                  {analyticsData?.exercises.map((ex) => (
                    <SelectItem key={ex.id} value={ex.id} className="text-xs">
                      {ex.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="h-[300px] w-full">
              {analyticsData?.exercises.find(e => e.id === selectedExerciseId)?.history.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.exercises.find(e => e.id === selectedExerciseId)?.history}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(val) => format(parseISO(val), "dd/MM", { locale: es })}
                    />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                      labelFormatter={(label) => format(parseISO(label), "PPP", { locale: es })}
                    />
                    <Line
                      type="monotone"
                      dataKey="oneRm"
                      stroke="currentColor"
                      className="stroke-primary"
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                  Selecciona un ejercicio con historial para ver su progresión.
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

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
                className={`overflow-hidden transition-all duration-300 ${isExpanded
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
                <CardContent className="px-4 pt-4">
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
                      size="default"
                      className="w-full text-xs text-muted-foreground"
                      onClick={() => handleSessionExpand(session.id)}
                    >
                      {isExpanded ? "Ocultar detalles" : "Ver detalles"}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="default"
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
                          className="border rounded-md p-2 text-xs"
                        >
                          <h4 className="font-semibold  tracking-heading text-xs md:text-xs truncate border-b pb-1 mb-1">
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
