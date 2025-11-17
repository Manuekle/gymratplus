"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Mail01Icon,
  MapPinIcon,
  PhoneLockIcon,
  UserGroupIcon,
  Dumbbell01Icon,
  FireIcon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";
// Calendar01Icon removed - unused
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
// import type { InstructorProfile, User } from "@prisma/client";
type InstructorData = {
  id: string;
  userId: string;
  instructorProfileId: string; // Add instructorProfileId to the type
  name: string | null;
  image: string | null;
  bio: string | null;
  curriculum: string | null;
  pricePerMonth: number | null;
  contactEmail: string | null;
  contactPhone: string | null;
  country: string | null;
  city: string | null;
  isRemote: boolean;
  status: string;
  startDate: string;
  specialties?: string[];
  experienceYears?: number;
  rating?: number;
  totalStudents?: number;
};

export default function InstructorProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [instructor, setInstructor] = useState<InstructorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [countryFlag, setCountryFlag] = useState<string | null>(null);
  const [requestingInstructorId, setRequestingInstructorId] = useState<
    string | null
  >(null);
  const [requestedInstructors, setRequestedInstructors] = useState<Set<string>>(
    new Set(),
  );
  const [hiredInstructors, setHiredInstructors] = useState<Set<string>>(
    new Set(),
  );
  const [studentInstructorId, setStudentInstructorId] = useState<string | null>(
    null,
  );
  const [assignedWorkouts, setAssignedWorkouts] = useState<any[]>([]);
  const [assignedFoodPlans, setAssignedFoodPlans] = useState<any[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);
  const [loadingFoodPlans, setLoadingFoodPlans] = useState(false);

  const loadExistingRequests = useCallback(async () => {
    try {
      const [requestsResponse, hiredResponse] = await Promise.all([
        fetch("/api/student-instructor-requests"),
        fetch("/api/students/my-instructors"), // Use this endpoint which includes studentInstructorId
      ]);

      if (requestsResponse.ok) {
        const requests = await requestsResponse.json();
        const requestIds = requests
          .filter((req: { status: string }) => req.status === "pending")
          .map(
            (req: { instructorProfileId: string }) => req.instructorProfileId,
          );
        setRequestedInstructors(new Set(requestIds));
      }

      if (hiredResponse.ok) {
        const hiredInstructors = await hiredResponse.json();
        // Los IDs en hiredInstructors son los instructorProfileId
        const hiredIds = hiredInstructors.map(
          (instructor: { id: string }) => instructor.id,
        );
        setHiredInstructors(new Set(hiredIds));

        // Find the studentInstructorId for the current instructor
        // El id en la URL es el userId, pero necesitamos buscar por userId
        const instructorUserId = Array.isArray(id) ? id[0] : id;
        const currentInstructor = hiredInstructors.find(
          (inst: { userId: string; studentInstructorId?: string }) =>
            inst.userId === instructorUserId,
        );
        if (currentInstructor?.studentInstructorId) {
          setStudentInstructorId(currentInstructor.studentInstructorId);
        }
      }
    } catch (error) {
      console.error("Error loading instructor data:", error);
    }
  }, [id]);

  useEffect(() => {
    loadExistingRequests();
  }, [loadExistingRequests]);

  // Cargar planes asignados si el estudiante es estudiante de este instructor
  useEffect(() => {
    const instructorUserId = Array.isArray(id) ? id[0] : id;
    // Verificar si el estudiante es estudiante de este instructor
    // hiredInstructors contiene instructorProfileId, necesitamos verificar con el instructorProfileId del instructor actual
    if (
      !instructor?.instructorProfileId ||
      !hiredInstructors.has(instructor.instructorProfileId)
    )
      return;

    const fetchAssignedPlans = async () => {
      // Cargar rutinas asignadas
      setLoadingWorkouts(true);
      try {
        const workoutsRes = await fetch("/api/students/workouts/assigned");
        if (workoutsRes.ok) {
          const workouts = await workoutsRes.json();
          // Filtrar solo las rutinas asignadas por este instructor
          // El instructorId en los workouts es el userId del instructor
          const instructorWorkouts = workouts.filter(
            (w: any) => w.instructor?.id === instructorUserId,
          );
          setAssignedWorkouts(instructorWorkouts);
        }
      } catch (error) {
        console.error("Error loading assigned workouts:", error);
      } finally {
        setLoadingWorkouts(false);
      }

      // Cargar planes de alimentación
      setLoadingFoodPlans(true);
      try {
        const foodPlansRes = await fetch("/api/food-recommendations");
        if (foodPlansRes.ok) {
          const foodPlans = await foodPlansRes.json();
          // Filtrar solo los planes creados por este instructor
          // El instructorId en los planes es el userId del instructor
          const instructorFoodPlans = foodPlans.filter(
            (plan: any) => plan.instructorId === instructorUserId,
          );
          // Parsear JSON strings si es necesario
          const parsedPlans = instructorFoodPlans.map((plan: any) => ({
            ...plan,
            macros:
              typeof plan.macros === "string"
                ? JSON.parse(plan.macros)
                : plan.macros,
            meals:
              typeof plan.meals === "string"
                ? JSON.parse(plan.meals)
                : plan.meals,
          }));
          setAssignedFoodPlans(parsedPlans);
        }
      } catch (error) {
        console.error("Error loading assigned food plans:", error);
      } finally {
        setLoadingFoodPlans(false);
      }
    };

    fetchAssignedPlans();
  }, [id, instructor, hiredInstructors]);

  useEffect(() => {
    const storedRequests = localStorage.getItem("requestedInstructors");
    if (storedRequests) {
      setRequestedInstructors(new Set(JSON.parse(storedRequests)));
    }
  }, []);

  useEffect(() => {
    const instructorId = Array.isArray(id) ? id[0] : id;
    if (!instructorId) return;

    const fetchInstructor = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/instructors/${instructorId}`);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error("No se pudo cargar la información del instructor");
        }
        const data: InstructorData = await response.json();
        setInstructor(data);

        if (data.country) {
          try {
            const searchParam =
              data.country.length === 2
                ? `alpha/${data.country}`
                : `name/${data.country}`;

            const flagResponse = await fetch(
              `https://restcountries.com/v3.1/${searchParam}`,
            );

            if (flagResponse.ok) {
              const countryData = await flagResponse.json();
              const flagSvg = countryData[0]?.flags?.svg;
              if (flagSvg) {
                setCountryFlag(flagSvg);
              }
            }
          } catch (flagError) {
            console.error("Error fetching country flag:", flagError);
            setCountryFlag(null);
          }
        }
      } catch (error) {
        console.error("Error fetching instructor:", error);
        toast.error("Error al cargar la información del instructor");
        setInstructor(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstructor();
  }, [id]);

  const handleRequestInstructor = useCallback(
    async (instructorProfileId?: string) => {
      if (!instructorProfileId) {
        toast.error("Error", {
          description:
            "ID de instructor no disponible. Por favor, intenta de nuevo.",
        });
        return;
      }

      // Check if already has an active request for this instructor
      if (hiredInstructors.has(instructorProfileId)) {
        return; // No need to show a message, the UI already shows they're a student
      }

      // Check if already has a pending request for this instructor
      if (requestedInstructors.has(instructorProfileId)) {
        return; // No need to show a message, the UI already shows the request is pending
      }

      // Check if has any other pending requests
      if (requestedInstructors.size > 0) {
        return; // No need to show a message, the UI already handles this case
      }

      setRequestingInstructorId(instructorProfileId);

      try {
        const response = await fetch("/api/student-instructor-requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ instructorProfileId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          // Handle the case when the request already exists
          if (errorData.error && errorData.error.includes("ya existe")) {
            // Update the UI to reflect the existing request
            setRequestedInstructors(
              new Set([...requestedInstructors, instructorProfileId]),
            );
            return;
          }
          throw new Error(errorData.error || "Error al enviar la solicitud.");
        }

        setRequestedInstructors((prev) =>
          new Set(prev).add(instructorProfileId),
        );

        toast.success("Solicitud enviada", {
          description:
            "Tu solicitud ha sido enviada al instructor. ¡Pronto se pondrá en contacto contigo!",
        });
      } catch (error: unknown) {
        // Skip showing error for duplicate requests (already handled above)
        if (error instanceof Error && error.message.includes("ya existe")) {
          return;
        }

        let errorMessage = "Hubo un error al procesar tu solicitud.";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }

        toast.error("Error", {
          description: errorMessage,
        });
      } finally {
        setRequestingInstructorId(null);
      }
    },
    [requestedInstructors, hiredInstructors],
  );

  if (isLoading) {
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
                <Skeleton className="h-8 w-full" />
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

  if (!instructor) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
        <h1 className="text-2xl font-semibold mb-2">
          Instructor no encontrado
        </h1>
        <p className="text-xs text-muted-foreground mb-4 text-center max-w-md">
          El perfil que estás buscando no existe o hubo un problema de conexión.
        </p>
        <Button onClick={() => router.push("/dashboard/instructors")} size="sm">
          Volver a instructores
        </Button>
      </div>
    );
  }

  const isInactive =
    instructor.status && instructor.status.toLowerCase() !== "active";

  //   const isRequested = instructor ? requestedInstructors.has(instructor.instructorProfileId) : false;

  return (
    <div>
      {isInactive && (
        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4"
          role="alert"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs">
                Este instructor actualmente no está aceptando nuevos
                estudiantes.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          className="md:w-auto w-full text-xs"
          onClick={() => router.push("/dashboard/instructors")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />{" "}
          Volver a instructores
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
                    src={instructor.image || undefined}
                    alt={instructor.name || "Instructor"}
                  />
                  <AvatarFallback className="text-xl tracking-heading font-semibold">
                    {instructor.name?.charAt(0) || "I"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center space-y-1">
                  <h2 className="text-lg tracking-heading font-semibold">
                    {instructor.name || "Instructor"}
                  </h2>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <HugeiconsIcon icon={MapPinIcon} className="h-3 w-3" />
                    <span>
                      {instructor.city}
                      {instructor.country && `, ${instructor.country}`}
                    </span>
                    {countryFlag && (
                      <Image
                        src={countryFlag || "/placeholder.svg"}
                        alt={`${instructor.country}`}
                        width={16}
                        height={12}
                        className="h-3 w-4 object-cover rounded-sm"
                      />
                    )}
                  </div>
                </div>
                {instructor.specialties &&
                  instructor.specialties.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1">
                      {instructor.specialties.map((specialty, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs px-2 py-0"
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  )}
                {instructor.isRemote && (
                  <Badge variant="default" className="text-xs">
                    Clases en línea
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-4 space-y-3">
              {/* Compact Stats Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {instructor.pricePerMonth !== null && (
                  <div className="flex flex-col p-2 rounded-md bg-muted/50">
                    <span className="text-muted-foreground">Precio/mes</span>
                    <span className="font-semibold text-xs ">
                      ${instructor.pricePerMonth}
                    </span>
                  </div>
                )}
                {instructor.experienceYears !== null && (
                  <div className="flex flex-col p-2 rounded-md bg-muted/50">
                    <span className="text-muted-foreground">Experiencia</span>
                    <span className="font-semibold text-xs">
                      {instructor.experienceYears} años
                    </span>
                  </div>
                )}
                {instructor.totalStudents !== undefined && (
                  <div className="flex flex-col p-2 rounded-md bg-muted/50">
                    <span className="text-muted-foreground">Estudiantes</span>
                    <span className="font-semibold text-xs flex items-center gap-1">
                      <HugeiconsIcon icon={UserGroupIcon} className="h-3 w-3" />
                      {instructor.totalStudents}
                    </span>
                  </div>
                )}
                {instructor.rating !== undefined &&
                  instructor.rating !== null && (
                    <div className="flex flex-col p-2 rounded-md bg-muted/50">
                      <span className="text-muted-foreground">
                        Calificación
                      </span>
                      <span className="font-semibold text-xs text-amber-500 flex items-center gap-1">
                        {instructor.rating.toFixed(1)}
                        <svg
                          className="h-3 w-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </span>
                    </div>
                  )}
              </div>

              <Separator />

              {/* Compact Contact Info */}
              <div className="space-y-1.5">
                {instructor.contactEmail && (
                  <a
                    href={`mailto:${instructor.contactEmail}`}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <HugeiconsIcon icon={Mail01Icon} className="h-3.5 w-3.5" />
                    <span className="truncate">{instructor.contactEmail}</span>
                  </a>
                )}
                {instructor.contactPhone && (
                  <a
                    href={`tel:${instructor.contactPhone}`}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <HugeiconsIcon
                      icon={PhoneLockIcon}
                      className="h-3.5 w-3.5"
                    />
                    <span>{instructor.contactPhone}</span>
                  </a>
                )}
              </div>

              {!isInactive &&
                !hiredInstructors.has(instructor.instructorProfileId) &&
                (() => {
                  if (instructor) {
                    return (
                      <div className="w-full space-y-1">
                        <div className="flex flex-row gap-1.5">
                          <Button
                            size="sm"
                            className={`text-[11px] h-8 flex-1 ${
                              requestedInstructors.has(
                                instructor.instructorProfileId,
                              )
                                ? "bg-red-600 hover:bg-red-700"
                                : ""
                            }`}
                            onClick={() =>
                              handleRequestInstructor(
                                instructor.instructorProfileId,
                              )
                            }
                            disabled={
                              requestingInstructorId ===
                                instructor.instructorProfileId ||
                              (requestedInstructors.size > 0 &&
                                !requestedInstructors.has(
                                  instructor.instructorProfileId,
                                ))
                            }
                          >
                            {requestingInstructorId ===
                            instructor.instructorProfileId ? (
                              <span>Enviando...</span>
                            ) : requestedInstructors.has(
                                instructor.instructorProfileId,
                              ) ? (
                              <span className="text-white">
                                Solicitud Enviada
                              </span>
                            ) : (
                              "Solicitar"
                            )}
                          </Button>
                        </div>
                        {requestedInstructors.size > 0 &&
                          !requestedInstructors.has(
                            instructor.instructorProfileId,
                          ) && (
                            <p className="text-[10px] text-red-500 text-center leading-tight">
                              Debes cancelar tu solicitud actual primero
                            </p>
                          )}
                      </div>
                    );
                  }
                  return "";
                })()}
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Compact */}
        <div className="flex-1 space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl tracking-heading font-semibold">
                Sobre Mí
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              {instructor.bio ? (
                <div className="whitespace-pre-line break-words text-xs text-muted-foreground">
                  {instructor.bio}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Sin biografía disponible.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl tracking-heading font-semibold">
                Especialidades
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              {instructor.curriculum ? (
                <div className="flex flex-wrap gap-1.5">
                  {instructor.curriculum
                    .split(/[,\n]/)
                    .map((item) => item.trim())
                    .filter((item) => item !== "")
                    .map((item, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs px-2 py-0"
                      >
                        {item}
                      </Badge>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Sin información disponible.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Planes Asignados - Solo visible si el estudiante es estudiante de este instructor */}
          {hiredInstructors.has(instructor.instructorProfileId) && (
            <>
              {/* Planes de Entrenamiento */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl tracking-heading font-semibold">
                    Planes de Entrenamiento Asignados
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4">
                  {loadingWorkouts ? (
                    <div className="space-y-2">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : assignedWorkouts.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      No tienes planes de entrenamiento asignados aún.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {assignedWorkouts.map((workout: any) => (
                        <div key={workout.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-sm font-semibold flex-1">
                              {workout.name}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {format(
                                new Date(workout.assignedDate),
                                "d MMM yyyy",
                                { locale: es },
                              )}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <HugeiconsIcon
                              icon={Dumbbell01Icon}
                              className="h-3.5 w-3.5"
                            />
                            <span>
                              {workout.exercises?.length || 0} ejercicios
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 w-full text-xs h-7"
                            onClick={() =>
                              router.push(`/dashboard/workout/${workout.id}`)
                            }
                          >
                            Ver Plan
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Planes de Alimentación */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl tracking-heading font-semibold">
                    Planes de Alimentación Asignados
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4">
                  {loadingFoodPlans ? (
                    <div className="space-y-2">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : assignedFoodPlans.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      No tienes planes de alimentación asignados aún.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {assignedFoodPlans.map((plan: any) => {
                        const macros =
                          typeof plan.macros === "string"
                            ? JSON.parse(plan.macros)
                            : plan.macros;

                        return (
                          <div key={plan.id} className="p-3 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-sm font-semibold flex-1">
                                Plan de Alimentación
                              </h3>
                              <Badge variant="secondary" className="text-xs">
                                {format(
                                  new Date(plan.createdAt),
                                  "d MMM yyyy",
                                  { locale: es },
                                )}
                              </Badge>
                            </div>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <HugeiconsIcon
                                  icon={FireIcon}
                                  className="h-3.5 w-3.5"
                                />
                                <span>{plan.calorieTarget} kcal objetivo</span>
                              </div>
                              {macros && (
                                <div className="pt-1 border-t space-y-0.5">
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
                                <p className="text-xs text-muted-foreground line-clamp-2 pt-1 border-t">
                                  {plan.notes}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2 w-full text-xs h-7"
                              onClick={() =>
                                router.push(
                                  `/dashboard/nutrition/plan/${plan.id}`,
                                )
                              }
                            >
                              Ver Plan
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
