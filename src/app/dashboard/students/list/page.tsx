"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import { format, isToday, isThisWeek, isYesterday } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkoutAssignmentDialog } from "@/components/instructor/workout-assignment-dialog";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Apple01Icon,
  Clock01Icon,
  EyeIcon,
  FireIcon,
  Search01Icon,
  Target02Icon,
} from "@hugeicons/core-free-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

interface StudentData {
  id: string;
  studentId: string;
  name: string | null;
  email: string | null;
  image: string | null;
  agreedPrice: number | null;
  status: string;
  lastWorkoutAt: Date | null;
  currentWorkoutStreak: number;
  completedWorkoutsLast7Days: number;
  totalWorkouts: number;
  averageWorkoutsPerWeek: number;
  lastNutritionLog?: Date | null;
  hasActiveMealPlan: boolean;
  hasActiveWorkoutPlan: boolean;
}

export default function StudentsListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activityFilter, setActivityFilter] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<{
    id: string;
    studentId: string;
    name: string | null;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const [isFoodPlanDialogOpen, setIsFoodPlanDialogOpen] = useState(false); // Reserved for future use
  const [stats, setStats] = useState<{
    totalStudents: number;
    activeToday: number;
    activeThisWeek: number;
    avgStreak: number;
    totalRevenue: number;
  } | null>(null);

  const hasActiveFilters =
    searchTerm !== "" || statusFilter !== "all" || activityFilter !== "all";

  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return "";
    return format(new Date(date), "dd/MM/yy", { locale: es });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setActivityFilter("all");
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/instructors/students");
      if (!response.ok) {
        throw new Error("Error al cargar estudiantes");
      }
      const data = await response.json();
      setStudents(data);
    } catch (error: unknown) {
      let errorMessage = "Hubo un error al cargar los estudiantes.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/instructors/students/stats");
      if (!response.ok) {
        throw new Error("Error al cargar estadísticas");
      }
      const data = await response.json();
      setStats(data);
    } catch (error: unknown) {
      console.error("Error fetching stats:", error);
    }
  };

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

    fetchStudents();
    fetchStats();
  }, [session, status, router]);

  useEffect(() => {
    let filtered = students;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((student) => student.status === statusFilter);
    }

    // Filtrar por actividad
    if (activityFilter !== "all") {
      switch (activityFilter) {
        case "active_today":
          filtered = filtered.filter(
            (student) =>
              student.lastWorkoutAt && isToday(new Date(student.lastWorkoutAt)),
          );
          break;
        case "active_week":
          filtered = filtered.filter(
            (student) =>
              student.lastWorkoutAt &&
              isThisWeek(new Date(student.lastWorkoutAt)),
          );
          break;
        case "inactive":
          filtered = filtered.filter(
            (student) =>
              !student.lastWorkoutAt ||
              !isThisWeek(new Date(student.lastWorkoutAt)),
          );
          break;
        case "high_streak":
          filtered = filtered.filter(
            (student) => student.currentWorkoutStreak >= 7,
          );
          break;
      }
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, statusFilter, activityFilter]);

  const getActivityStatus = (lastWorkoutAt: Date | null) => {
    if (!lastWorkoutAt)
      return {
        status: "inactive",
        text: "Inactivo",
        variant: "secondary" as const,
      };
    if (isToday(new Date(lastWorkoutAt)))
      return {
        status: "active",
        text: "Activo hoy",
        variant: "default" as const,
      };
    if (isYesterday(new Date(lastWorkoutAt)))
      return { status: "recent", text: "Ayer", variant: "outline" as const };
    if (isThisWeek(new Date(lastWorkoutAt)))
      return {
        status: "week",
        text: "Esta semana",
        variant: "outline" as const,
      };
    return { status: "old", text: "Inactivo", variant: "destructive" as const };
  };

  // Total students count
  const totalStudents = students.length;

  if (isLoading) {
    return (
      <div>
        <div className="space-y-4">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-16" />
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </div>

          {/* Students List Skeleton */}
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-2.5 w-40" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-5 w-14" />
                    <Skeleton className="h-7 w-7" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1 max-w-sm">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            placeholder="Buscar por nombre o email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-xs"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={activityFilter} onValueChange={setActivityFilter}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Actividad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toda actividad</SelectItem>
            <SelectItem value="active_today">Activos hoy</SelectItem>
            <SelectItem value="active_week">Activos esta semana</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
            <SelectItem value="high_streak">Racha alta (7+ días)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Students List */}
      <div className="space-y-3">
        {filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-xs font-medium mb-1.5">
              No se encontraron alumnos
            </h3>
            <p className="text-muted-foreground text-xs max-w-md">
              {hasActiveFilters
                ? "Intenta ajustar los filtros de búsqueda para encontrar a tus alumnos."
                : "No tienes alumnos activos en este momento. Cuando aceptes solicitudes, aparecerán aquí."}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 h-7 text-xs bg-transparent"
                onClick={clearFilters}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          filteredStudents.map((student) => {
            const activityStatus = getActivityStatus(student.lastWorkoutAt);

            return (
              <div
                key={student.id}
                className="border rounded-lg overflow-hidden"
              >
                <div className="p-3">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10 border border-background">
                      {student.image ? (
                        <AvatarImage
                          src={student.image}
                          alt={student.name || ""}
                        />
                      ) : null}
                      <AvatarFallback className="font-medium bg-muted">
                        {student.name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-xs truncate">
                            {student.name}
                          </p>
                          <Badge
                            variant={activityStatus.variant}
                            className="text-[10px] h-5"
                          >
                            {activityStatus.text}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Link href={`/dashboard/students/list/${student.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              title="Ver perfil"
                            >
                              <HugeiconsIcon
                                icon={EyeIcon}
                                className="h-3.5 w-3.5"
                              />
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Asignar rutina"
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsDialogOpen(true);
                            }}
                          >
                            <HugeiconsIcon
                              icon={Target02Icon}
                              className="h-3.5 w-3.5"
                            />
                          </Button>
                          <Link
                            href={`/dashboard/students/list/${student.id}/mealplan`}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              title="Crear plan de alimentación"
                            >
                              <HugeiconsIcon
                                icon={Apple01Icon}
                                className="h-3.5 w-3.5"
                              />
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground truncate">
                        {student.email}
                      </p>

                      <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <HugeiconsIcon icon={FireIcon} className="h-3 w-3" />
                          <span>
                            {student.currentWorkoutStreak}{" "}
                            {student.currentWorkoutStreak === 1
                              ? "día"
                              : "días"}
                          </span>
                        </div>
                        <div className="h-3 w-px bg-border" />
                        <div>
                          {student.lastWorkoutAt ? (
                            isToday(new Date(student.lastWorkoutAt)) ? (
                              <span className="text-emerald-600 font-medium flex items-center gap-1">
                                <HugeiconsIcon
                                  icon={Clock01Icon}
                                  className="h-3 w-3"
                                />
                                <span>Hoy</span>
                              </span>
                            ) : (
                              <span>
                                Últ: {formatDate(student.lastWorkoutAt)}
                              </span>
                            )
                          ) : (
                            <span>Sin entrenos</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        {student.hasActiveWorkoutPlan && (
                          <Badge variant="outline" className="text-[10px] h-5">
                            Entrenamiento
                          </Badge>
                        )}
                        {student.hasActiveMealPlan && (
                          <Badge variant="outline" className="text-[10px] h-5">
                            Nutrición
                          </Badge>
                        )}
                        {student.agreedPrice && (
                          <span className="text-xs font-medium">
                            ${student.agreedPrice.toLocaleString()}/mes
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      {filteredStudents.length > 0 && (
        <div className="text-xs text-muted-foreground py-2 px-4 border rounded-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span>
              Mostrando {filteredStudents.length} de {totalStudents} alumnos
            </span>
            <div className="flex items-center gap-3">
              <span>Activos esta semana: {stats?.activeThisWeek || 0}</span>
              <Separator orientation="vertical" className="h-3" />
              <span>Racha promedio: {stats?.avgStreak || 0} días</span>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo para asignar rutina */}
      {selectedStudent && (
        <>
          <WorkoutAssignmentDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            studentId={selectedStudent.studentId}
            studentName={selectedStudent.name || "el alumno"}
          />
        </>
      )}
    </div>
  );
}
