"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowRight01Icon, UserIcon } from "hugeicons-react";
import Link from "next/link";
import { format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { InstructorProfileForm } from "@/components/instructor/instructor-profile-form";

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
}

interface PendingRequestData {
  id: string;
  studentId: string;
  instructorProfileId: string;
  status: string;
  agreedPrice: number | null;
  createdAt: Date;
  student: { // Detalles del estudiante que envió la solicitud
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export default function InstructorDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isInstructor, setIsInstructor] = useState(false);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequestData[]>([]); // Nuevo estado para solicitudes pendientes
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  useEffect(() => {
    if (status === "loading") return; // Todavía cargando la sesión

    if (!session || !session.user) {
      router.push("/auth/signin"); // Redirigir si no hay sesión
      return;
    }

    const checkInstructorStatus = async () => {
      setIsLoadingProfile(true);
      try {
        if (session.user.isInstructor) {
          setIsInstructor(true);
          // Si es instructor, cargar sus alumnos y solicitudes pendientes
          fetchStudentsAndRequests();
        } else {
          toast.error("Acceso denegado", { description: "Debes ser un instructor para acceder a esta página." });
          router.push("/dashboard/profile");
        }
      } catch (error) {
        console.error("Error checking instructor status:", error);
        toast.error("Error", { description: "No se pudo verificar tu rol de instructor." });
        router.push("/dashboard");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    checkInstructorStatus();
  }, [session, status, router]);

  const fetchStudentsAndRequests = async () => {
    setIsLoadingStudents(true);
    try {
      const response = await fetch("/api/instructors/students");
      if (!response.ok) {
        throw new Error("Error al cargar los alumnos.");
      }
      const data: (StudentData | PendingRequestData)[] = await response.json(); // Tipado más específico
      
      const activeStudents = data.filter((item): item is StudentData => item.status === 'active');
      const pRequests = data.filter((item): item is PendingRequestData => item.status === 'pending');
      
      setStudents(activeStudents);
      setPendingRequests(pRequests);

    } catch (error: unknown) {
      let errorMessage = "Hubo un error al cargar tus alumnos.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      toast.error(errorMessage);
      console.error("Error fetching students:", error);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Funciones para aceptar/rechazar solicitudes
  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/student-instructor-requests/${requestId}/accept`, {
        method: "PUT",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al aceptar la solicitud.");
      }
      toast.success("Solicitud aceptada", { description: "El alumno ha sido añadido a tu lista." });
      fetchStudentsAndRequests(); // Recargar datos
    } catch (error: unknown) {
      let errorMessage = "Hubo un error al aceptar la solicitud.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      toast.error(errorMessage);
      console.error("Error accepting request:", error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/student-instructor-requests/${requestId}/reject`, {
        method: "PUT",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al rechazar la solicitud.");
      }
      toast.success("Solicitud rechazada", { description: "La solicitud ha sido marcada como rechazada." });
      fetchStudentsAndRequests(); // Recargar datos
    } catch (error: unknown) {
      let errorMessage = "Hubo un error al rechazar la solicitud.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      toast.error(errorMessage);
      console.error("Error rejecting request:", error);
    }
  };

  if (isLoadingProfile || status === "loading") {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-10 w-1/2 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!isInstructor) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-semibold mb-6">Panel del Instructor</h1>

      {/* Solicitudes Pendientes */}
      <Card className="mb-6">
        <CardHeader className="flex-row justify-between items-center">
          <div>
            <CardTitle>Solicitudes Pendientes</CardTitle>
            <CardDescription>Revisa las solicitudes de nuevos alumnos.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingStudents ? (
            <div className="flex justify-center p-8">
              <Skeleton className="h-24 w-full" />
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
              <UserIcon className="h-16 w-16 mb-4 opacity-40" />
              <p className="text-center">No hay solicitudes pendientes en este momento.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center space-x-4 border-b pb-4 last:border-b-0 last:pb-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={request.student.image || "/placeholder-avatar.jpg"} alt={request.student.name || "Alumno"} />
                    <AvatarFallback>{request.student.name?.charAt(0) || "A"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-md font-semibold">{request.student.name}</p>
                    <p className="text-sm text-muted-foreground">{request.student.email}</p>
                    {request.agreedPrice && (
                      <p className="text-xs text-muted-foreground">Precio sugerido: ${request.agreedPrice}/mes</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleAcceptRequest(request.id)}
                    >
                      Aceptar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRejectRequest(request.id)}
                    >
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Resumen de Alumnos Activos */}
      <Card className="mb-6">
        <CardHeader className="flex-row justify-between items-center">
          <div>
            <CardTitle>Mis Alumnos Activos</CardTitle>
            <CardDescription>Visualiza el progreso de tus alumnos activos.</CardDescription>
          </div>
          <Link
            href="/dashboard/instructors/students"
            className="text-xs text-muted-foreground flex items-center gap-1"
          >
            Ver todos <ArrowRight01Icon className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {isLoadingStudents ? (
            <div className="flex justify-center p-8">
              <Skeleton className="h-24 w-full" />
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
              <UserIcon className="h-16 w-16 mb-4 opacity-40" />
              <p className="text-center">Aún no tienes alumnos activos.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.id} className="flex items-center space-x-4 border-b pb-4 last:border-b-0 last:pb-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={student.image || "/placeholder-avatar.jpg"} alt={student.name || "Alumno"} />
                    <AvatarFallback>{student.name?.charAt(0) || "A"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-md font-semibold">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                    {student.agreedPrice && (
                      <p className="text-xs text-muted-foreground">Precio acordado: ${student.agreedPrice}/mes</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Racha: {student.currentWorkoutStreak} días</p>
                    <p className="text-sm text-muted-foreground">Entrenos (7 días): {student.completedWorkoutsLast7Days}</p>
                    {student.lastWorkoutAt ? (
                      <p className="text-xs text-muted-foreground">
                        Último entreno: {
                          isToday(new Date(student.lastWorkoutAt))
                            ? "Hoy"
                            : format(new Date(student.lastWorkoutAt), "d MMM yyyy", { locale: es })
                        }
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Sin entrenamientos recientes</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Otras secciones del panel (Placeholder) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Planes de Entrenamiento</CardTitle>
            <CardDescription>Crea y gestiona rutinas para tus alumnos.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Próximamente...</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Planes de Nutrición</CardTitle>
            <CardDescription>Diseña dietas personalizadas.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Próximamente...</p>
          </CardContent>
        </Card>
      </div>

      {/* Sección para editar el perfil del instructor */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Mi Perfil de Instructor</CardTitle>
          <CardDescription>Actualiza tu información de instructor y currículum.</CardDescription>
        </CardHeader>
        <CardContent>
          <InstructorProfileForm />
        </CardContent>
      </Card>
    </div>
  );
} 