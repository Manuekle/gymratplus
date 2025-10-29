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

  if (isLoadingProfile || status === "loading") {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Total Alumnos</CardTitle>
            <HugeiconsIcon
              icon={UserGroupIcon}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
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
          <CardContent>
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
          <CardContent>
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
          <CardContent>
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
                <CardTitle className="flex items-center gap-2">
                  Solicitudes Pendientes
                  <Badge variant="secondary">{pendingRequests.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Revisa y gestiona las solicitudes de nuevos alumnos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request, index) => (
                <div key={request.id} className="flex flex-col gap-2 md:gap-0">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={request.image || "/placeholder-avatar.jpg"}
                          alt={request.name || "Alumno"}
                        />
                        <AvatarFallback>
                          {request.name?.charAt(0).toUpperCase() || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs font-medium leading-none truncate">
                          {request.name || "Sin nombre"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {request.email}
                        </p>
                        {request.agreedPrice && (
                          <p className="text-xs text-muted-foreground">
                            Precio sugerido: ${request.agreedPrice}/mes
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col items-center gap-2 md:gap-1 mt-2 md:mt-0">
                      <Button
                        size="default"
                        variant="outline"
                        onClick={() => handleAcceptRequest(request.id)}
                        className="text-xs w-full md:w-auto"
                      >
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          className="h-4 w-4 mr-0 md:mr-1"
                        />
                        <span className="hidden md:inline">Aceptar</span>
                      </Button>
                    </div>
                  </div>
                  {index < pendingRequests.length - 1 && (
                    <Separator className="mt-4" />
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
              className="text-xs text-muted-foreground flex items-center gap-1 w-full md:w-1/6 justify-end mt-2 md:mt-0"
            >
              Ver todos{" "}
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
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
                <div key={student.id}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
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
                        <p className="text-xs font-medium leading-none truncate">
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
                              className="text-xs whitespace-nowrap"
                            >
                              Plan de entrenamiento
                            </Badge>
                          )}
                          {student.hasActiveMealPlan && (
                            <Badge
                              variant="outline"
                              className="text-xs whitespace-nowrap"
                            >
                              Plan de nutrición
                            </Badge>
                          )}
                          {!student.hasActiveWorkoutPlan &&
                            !student.hasActiveMealPlan && (
                              <Badge
                                variant="outline"
                                className="text-xs whitespace-nowrap"
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
                          {student.currentWorkoutStreak} días
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
                </div>
              ))}
              {students.length > 5 && (
                <div className="pt-4 border-t">
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="/dashboard/instructors/students">
                      Ver todos los alumnos ({students.length})
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className="h-4 w-4 ml-1"
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
          <CardTitle className="text-2xl tracking-heading font-semibold">
            Mi Perfil de Instructor
          </CardTitle>
          <CardDescription className="text-xs">
            Actualiza tu información profesional y currículum
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InstructorProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}
