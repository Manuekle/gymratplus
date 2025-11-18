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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import Link from "next/link";
import { format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { InstructorProfileForm } from "@/components/instructor/instructor-profile-form";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Dollar02Icon,
  FireIcon,
  Target01Icon,
  Tick02Icon,
  UserGroupIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

interface StudentData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  agreedPrice: number | null;
  status: string;
  lastWorkoutAt: Date | null;
  currentWorkoutStreak: number;
  completedWorkoutsLast7Days: number;
  hasActiveWorkoutPlan?: boolean;
  hasActiveMealPlan?: boolean;
}

interface PendingRequestData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  agreedPrice: number | null;
  status: string;
  lastWorkoutAt?: Date | null;
  currentWorkoutStreak?: number;
  completedWorkoutsLast7Days?: number;
}

export default function InstructorDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequestData[]>(
    [],
  );
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [stats, setStats] = useState<{
    totalStudents: number;
    activeToday: number;
    avgStreak: number;
    studentsWithWorkoutPlans: number;
    studentsWithMealPlans: number;
    totalRevenue: number;
  } | null>(null);

  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const response = await fetch("/api/instructors/students");
      if (!response.ok) {
        throw new Error("Error al cargar los alumnos.");
      }
      const data: (StudentData | PendingRequestData)[] = await response.json();

      const activeStudents = data.filter(
        (item): item is StudentData =>
          item.status === "accepted" || item.status === "active",
      );
      const pRequests = data.filter(
        (item): item is PendingRequestData => item.status === "pending",
      );

      setStudents(activeStudents);
      setPendingRequests(pRequests);
    } catch (error: unknown) {
      let errorMessage = "Hubo un error al cargar tus alumnos.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
      console.error("Error fetching students:", error);
    } finally {
      setIsLoadingStudents(false);
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
    } catch (error) {
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

    // Si es instructor, establecer el estado y cargar datos
    setIsLoadingProfile(false);
    fetchStudents();
    fetchStats();
  }, [session, status, router]);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await fetch(
        `/api/student-instructor-requests/${requestId}/accept`,
        {
          method: "PUT",
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al aceptar la solicitud.");
      }
      toast.success("Solicitud aceptada", {
        description: "El alumno ha sido añadido a tu lista.",
      });
      fetchStudents();
    } catch (error: unknown) {
      let errorMessage = "Hubo un error al aceptar la solicitud.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
      console.error("Error accepting request:", error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const response = await fetch(
        `/api/student-instructor-requests/${requestId}/reject`,
        {
          method: "PUT",
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al rechazar la solicitud.");
      }
      toast.success("Solicitud rechazada", {
        description: "La solicitud ha sido rechazada.",
      });
      fetchStudents();
    } catch (error: unknown) {
      let errorMessage = "Hubo un error al rechazar la solicitud.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
      console.error("Error rejecting request:", error);
    }
  };

  if (isLoadingProfile || status === "loading") {
    return (
      <div className="space-y-8">
        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent className="px-4">
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pending Requests Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="space-y-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4">
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2 md:gap-0">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1 min-w-0 flex-1">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-24 md:w-auto" />
                  </div>
                  {i < 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Students Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <div className="space-y-1">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          </CardHeader>
          <CardContent className="px-4">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 rounded-lg p-3 -m-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1 min-w-0 flex-1">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-3 w-40" />
                        <div className="flex gap-2 mt-1">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-5 w-28" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col items-center gap-2 md:gap-1 mt-2 md:mt-0">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  {i < 2 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructor Profile Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-3 w-80" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4">
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si no es instructor, no mostrar nada (ya se redirigió)
  if (!session?.user?.isInstructor) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Total Alumnos</CardTitle>
            <HugeiconsIcon
              icon={UserGroupIcon}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent className="px-4">
            <div className="text-2xl font-semibold tracking-heading">
              {stats?.totalStudents || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeToday || 0} activos hoy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">
              Planes Activos
            </CardTitle>
            <HugeiconsIcon
              icon={Target01Icon}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent className="px-4">
            <div className="text-2xl font-semibold tracking-heading">
              {stats?.studentsWithWorkoutPlans || 0} entrenamiento
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.studentsWithMealPlans || 0} nutrición
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">
              Racha Promedio
            </CardTitle>
            <HugeiconsIcon
              icon={FireIcon}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent className="px-4">
            <div className="text-2xl font-semibold tracking-heading">
              {stats?.avgStreak || 0}
            </div>
            <p className="text-xs text-muted-foreground">días consecutivos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Ingresos</CardTitle>
            <HugeiconsIcon
              icon={Dollar02Icon}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent className="px-4">
            <div className="text-2xl font-semibold tracking-heading">
              ${stats?.totalRevenue || 0}
            </div>
            <p className="text-xs text-muted-foreground">mensuales</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="space-y-1">
                <CardTitle className="flex tracking-heading text-2xl items-center gap-2">
                  Solicitudes Pendientes
                  <Badge variant="secondary">{pendingRequests.length}</Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Revisa y gestiona las solicitudes de nuevos alumnos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4">
            <div className="space-y-4">
              {pendingRequests.map((request, index) => (
                <div key={request.id} className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage
                          src={request.image || "/placeholder-avatar.jpg"}
                          alt={request.name || "Alumno"}
                        />
                        <AvatarFallback>
                          {request.name?.charAt(0).toUpperCase() || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-xs font-semibold leading-none truncate">
                          {request.name || "Sin nombre"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {request.email}
                        </p>
                        {request.agreedPrice && (
                          <div className="flex items-center gap-1 mt-1">
                            <HugeiconsIcon
                              icon={Dollar02Icon}
                              className="h-3 w-3 text-muted-foreground"
                            />
                            <p className="text-xs text-muted-foreground">
                              Precio sugerido: ${request.agreedPrice}/mes
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-stretch sm:items-end gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleAcceptRequest(request.id)}
                        className="text-xs flex-1 sm:flex-none sm:w-auto"
                      >
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          className="h-4 w-4 mr-1.5"
                        />
                        Aceptar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectRequest(request.id)}
                        className="text-xs flex-1 sm:flex-none sm:w-auto border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <HugeiconsIcon
                          icon={Cancel01Icon}
                          className="h-4 w-4 mr-1.5"
                        />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                  {index < pendingRequests.length - 1 && (
                    <Separator className="mt-1" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Students */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
            <div className="space-y-1">
              <CardTitle className="text-2xl tracking-heading font-semibold">
                Alumnos activos
              </CardTitle>
              <CardDescription className="text-xs">
                Supervisa el progreso de tus alumnos
              </CardDescription>
            </div>
            <Link
              href="/dashboard/students/list"
              className="group inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-2 md:mt-0"
            >
              Ver todos
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="px-4">
          {isLoadingStudents ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-xs font-medium mb-2">
                No tienes alumnos activos
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Cuando aceptes solicitudes de alumnos, aparecerán aquí para que
                puedas supervisar su progreso.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {students.slice(0, 5).map((student, index) => (
                <Link
                  key={student.id}
                  href={`/dashboard/students/list/${student.id}`}
                  className="block group"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 rounded-lg p-3 -m-3 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={student.image || "/placeholder-avatar.jpg"}
                          alt={student.name || "Alumno"}
                        />
                        <AvatarFallback>
                          {student.name?.charAt(0).toUpperCase() || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs font-medium leading-none truncate group-hover:text-primary transition-colors">
                          {student.name || "Sin nombre"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {student.email}
                        </p>
                        {student.agreedPrice && (
                          <p className="text-xs text-muted-foreground">
                            ${student.agreedPrice}/mes
                          </p>
                        )}
                        <div className="flex gap-2 mt-1 overflow-x-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300">
                          {student.hasActiveWorkoutPlan && (
                            <Badge
                              variant="outline"
                              className="text-xs whitespace-nowrap bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors"
                            >
                              Plan de entrenamiento
                            </Badge>
                          )}
                          {student.hasActiveMealPlan && (
                            <Badge
                              variant="outline"
                              className="text-xs whitespace-nowrap bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/40 transition-colors"
                            >
                              Plan de nutrición
                            </Badge>
                          )}
                          {!student.hasActiveWorkoutPlan &&
                            !student.hasActiveMealPlan && (
                              <Badge
                                variant="outline"
                                className="text-xs whitespace-nowrap bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800"
                              >
                                Sin planes activos
                              </Badge>
                            )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col items-center gap-2 md:gap-1 mt-2 md:mt-0 text-right">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {student.currentWorkoutStreak}{" "}
                          {student.currentWorkoutStreak === 1 ? "día" : "días"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {student.completedWorkoutsLast7Days} entrenos/sem
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {student.lastWorkoutAt ? (
                          isToday(new Date(student.lastWorkoutAt)) ? (
                            <span className="text-green-600 font-medium">
                              Entrenó hoy
                            </span>
                          ) : (
                            `Último: ${format(new Date(student.lastWorkoutAt), "d MMM", { locale: es })}`
                          )
                        ) : (
                          "Sin entrenamientos"
                        )}
                      </p>
                    </div>
                  </div>
                  {index < Math.min(students.length, 5) - 1 && (
                    <Separator className="mt-4" />
                  )}
                </Link>
              ))}
              {students.length > 5 && (
                <div className="pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full group"
                    asChild
                  >
                    <Link
                      href="/dashboard/students/list"
                      className="flex items-center justify-center gap-1.5"
                    >
                      Ver todos los alumnos ({students.length})
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                      />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructor Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl tracking-heading font-semibold">
                Mi Perfil de Instructor
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Gestiona tu información profesional y haz que los estudiantes te
                encuentren
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4">
          <InstructorProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}
