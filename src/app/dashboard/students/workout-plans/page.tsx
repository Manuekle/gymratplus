"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Target,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  BarChart3,
  Edit,
  Eye,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { format, isToday, isTomorrow } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkoutPlan {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentImage: string | null;
  templateName: string;
  status: "active" | "completed" | "paused";
  startDate: Date;
  endDate?: Date;
  progress: number;
  totalWorkouts: number;
  completedWorkouts: number;
  lastWorkoutDate?: Date;
  nextWorkoutDate?: Date;
}

export default function WorkoutPlansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<WorkoutPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user) {
      router.push("/auth/signin");
      return;
    }
    if (!session.user.isInstructor) {
      toast.error("Acceso denegado", {
        description: "Debes ser un instructor para acceder a esta página.",
      });
      router.push("/dashboard/profile");
      return;
    }
    fetchWorkoutPlans();
  }, [session, status, router]);

  useEffect(() => {
    let filtered = workoutPlans;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (plan) =>
          plan.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.templateName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((plan) => plan.status === statusFilter);
    }

    setFilteredPlans(filtered);
  }, [workoutPlans, searchTerm, statusFilter]);

  const fetchWorkoutPlans = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/instructors/workout-plans")
      if (!response.ok) {
        throw new Error("Error al cargar los planes de entrenamiento")
      }
      const data = await response.json()
      setWorkoutPlans(data)
    } catch (error: unknown) {
      let errorMessage = "Hubo un error al cargar los planes de entrenamiento."
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }
      toast.error(errorMessage)
      console.error("Error fetching workout plans:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "completed":
        return "secondary";
      case "paused":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activo";
      case "completed":
        return "Completado";
      case "paused":
        return "Pausado";
      default:
        return "Desconocido";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Play className="h-3 w-3" />;
      case "completed":
        return <CheckCircle className="h-3 w-3" />;
      case "paused":
        return <Pause className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const formatNextWorkout = (date?: Date) => {
    if (!date) return "Sin programar";
    if (isToday(date)) return "Hoy";
    if (isTomorrow(date)) return "Mañana";
    return format(date, "d MMM", { locale: es });
  };

  // Calcular estadísticas
  const totalPlans = workoutPlans.length;
  const activePlans = workoutPlans.filter((p) => p.status === "active").length;
  const avgProgress =
    totalPlans > 0
      ? Math.round(
          workoutPlans.reduce((acc, p) => acc + p.progress, 0) / totalPlans
        )
      : 0;
  const totalCompletedWorkouts = workoutPlans.reduce(
    (acc, p) => acc + p.completedWorkouts,
    0
  );
  const completedPlans = workoutPlans.filter(
    (p) => p.status === "completed"
  ).length;

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-20" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1 max-w-sm" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>

        {/* Plans List Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/students">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
        </div>
        <Button asChild>
          <Link href="/dashboard/instructors/workout-templates">
            <Plus className="h-4 w-4 mr-2" />
            Crear Template
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Planes</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sont-semibold">{totalPlans}</div>
            <p className="text-xs text-muted-foreground">
              {activePlans} activos, {completedPlans} completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Progreso Promedio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sont-semibold">{avgProgress}%</div>
            <div className="mt-2">
              <Progress value={avgProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Entrenamientos
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sont-semibold">{totalCompletedWorkouts}</div>
            <p className="text-xs text-muted-foreground">
              completados en total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alumnos Activos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sont-semibold">{activePlans}</div>
            <p className="text-xs text-muted-foreground">siguiendo rutinas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg">Filtros</CardTitle>
          </div>
          <CardDescription>
            Busca y filtra los planes de entrenamiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por alumno o template..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="completed">Completados</SelectItem>
                <SelectItem value="paused">Pausados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Plans List */}
      <div className="space-y-4">
        {filteredPlans.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Target className="h-16 w-16 text-muted-foreground/40 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No hay planes de entrenamiento
              </h3>
              <p className="text-muted-foreground max-w-md mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Intenta ajustar los filtros de búsqueda para encontrar los planes."
                  : "Crea templates y asígnalos a tus alumnos para comenzar a gestionar sus entrenamientos."}
              </p>
              <div className="flex gap-2">
                {(searchTerm || statusFilter !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                  >
                    Limpiar filtros
                  </Button>
                )}
                <Button asChild>
                  <Link href="/dashboard/instructors/workout-templates">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Template
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredPlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                      <AvatarImage
                        src={plan.studentImage || "/placeholder-avatar.jpg"}
                        alt={plan.studentName}
                      />
                      <AvatarFallback className="font-semibold">
                        {plan.studentName?.charAt(0).toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{plan.studentName}</p>
                        <Badge
                          variant={getStatusVariant(plan.status)}
                          className="gap-1"
                        >
                          {getStatusIcon(plan.status)}
                          {getStatusText(plan.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {plan.studentEmail}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {plan.templateName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Iniciado:{" "}
                        {format(new Date(plan.startDate), "d MMM yyyy", {
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {/* Progress */}
                    <div className="space-y-2 min-w-[120px]">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Progreso</span>
                        <span className="text-sm sont-semibold">
                          {plan.progress}%
                        </span>
                      </div>
                      <Progress value={plan.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground text-center">
                        {plan.completedWorkouts}/{plan.totalWorkouts}{" "}
                        entrenamientos
                      </p>
                    </div>

                    <Separator orientation="vertical" className="h-16" />

                    {/* Next Workout */}
                    <div className="text-center space-y-1 min-w-[100px]">
                      <div className="flex items-center justify-center gap-1">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {formatNextWorkout(plan.nextWorkoutDate)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Próximo entrenamiento
                      </p>
                      {plan.lastWorkoutDate && (
                        <p className="text-xs text-muted-foreground">
                          Último:{" "}
                          {format(new Date(plan.lastWorkoutDate), "d MMM", {
                            locale: es,
                          })}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver progreso detallado
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar plan
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="h-4 w-4 mr-2" />
                          Programar entrenamientos
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {plan.status === "active" && (
                          <>
                            <DropdownMenuItem>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Marcar como completado
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-amber-600">
                              <Pause className="h-4 w-4 mr-2" />
                              Pausar plan
                            </DropdownMenuItem>
                          </>
                        )}
                        {plan.status === "paused" && (
                          <DropdownMenuItem className="text-green-600">
                            <Play className="h-4 w-4 mr-2" />
                            Reanudar plan
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <XCircle className="h-4 w-4 mr-2" />
                          Eliminar plan
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredPlans.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Mostrando {filteredPlans.length} de {totalPlans} planes
              </span>
              <div className="flex items-center gap-4">
                <span>Progreso promedio: {avgProgress}%</span>
                <Separator orientation="vertical" className="h-4" />
                <span>
                  Entrenamientos completados: {totalCompletedWorkouts}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
