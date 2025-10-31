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
  Calendar01Icon,
  Mail01Icon,
  MapPinIcon,
  PhoneLockIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
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
    new Set()
  );

  const loadExistingRequests = useCallback(async () => {
    try {
      const response = await fetch("/api/student-instructor-requests");
      if (response.ok) {
        const requests = await response.json();
        const requestIds = requests.map(
          (req: { instructorProfileId: string }) => req.instructorProfileId
        );
        setRequestedInstructors(new Set(requestIds));
      }
    } catch (error) {
      console.error("Error loading existing requests:", error);
    }
  }, []);

  useEffect(() => {
    loadExistingRequests();
  }, [loadExistingRequests]);

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
              `https://restcountries.com/v3.1/${searchParam}`
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

      // Check if already has a request for this instructor
      if (requestedInstructors.has(instructorProfileId)) {
        toast.info("Solicitud existente", {
          description: "Ya tienes una solicitud pendiente con este instructor.",
        });
        return;
      }

      // Check if has any active requests
      if (requestedInstructors.size > 0) {
        toast.error("Solicitud pendiente", {
          description:
            "Ya tienes una solicitud pendiente. Debes cancelarla antes de solicitar otro instructor.",
        });
        return;
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
            toast.info("Solicitud existente", {
              description:
                "Ya tienes una solicitud pendiente con este instructor.",
            });
            // Update the UI to reflect the existing request
            setRequestedInstructors(
              new Set([...requestedInstructors, instructorProfileId])
            );
            return;
          }
          throw new Error(errorData.error || "Error al enviar la solicitud.");
        }

        setRequestedInstructors((prev) =>
          new Set(prev).add(instructorProfileId)
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
    [requestedInstructors]
  );

  if (isLoading) {
    return (
      <div>
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
              <CardContent className="space-y-2">
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
              <CardContent>
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

  //   const isRequested = instructor ? requestedInstructors.has(instructor.instructorProfileId) : false;

  return (
    <div>
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
            <CardContent className="space-y-3">
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

              {(() => {
                if (instructor) {
                  return (
                    <div className="w-full space-y-1">
                      <div className="flex flex-row gap-1.5">
                        <Button
                          size="sm"
                          className={`text-[11px] h-8 flex-1 ${
                            requestedInstructors.has(
                              instructor.instructorProfileId
                            )
                              ? "bg-red-600 hover:bg-red-700"
                              : ""
                          }`}
                          onClick={() =>
                            handleRequestInstructor(
                              instructor.instructorProfileId
                            )
                          }
                          disabled={
                            requestingInstructorId ===
                              instructor.instructorProfileId ||
                            (requestedInstructors.size > 0 &&
                              !requestedInstructors.has(
                                instructor.instructorProfileId
                              ))
                          }
                        >
                          {requestingInstructorId ===
                          instructor.instructorProfileId ? (
                            <span>Enviando...</span>
                          ) : requestedInstructors.has(
                              instructor.instructorProfileId
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
                          instructor.instructorProfileId
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
          <div className="flex justify-between items-center">
            <h1 className="text-2xl tracking-heading font-semibold">
              {instructor.name}
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/instructors")}
            >
              Volver a instructores
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg tracking-heading">
                Sobre Mí
              </CardTitle>
            </CardHeader>
            <CardContent>
              {instructor.bio ? (
                <div className="whitespace-pre-line break-words text-sm text-muted-foreground">
                  {instructor.bio}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Sin biografía disponible.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg tracking-heading">
                Especialidades
              </CardTitle>
            </CardHeader>
            <CardContent>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg tracking-heading">
                Métodos de Enseñanza
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-xs mb-0.5">
                    Entrenamiento Personalizado
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Programas adaptados a tus objetivos específicos.
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-xs mb-0.5">
                    Seguimiento de Progreso
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Evaluaciones regulares para medir tu avance.
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-xs mb-0.5">
                    Nutrición y Estilo de Vida
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Asesoramiento nutricional complementario.
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-xs mb-0.5">
                    Entrenamiento en Grupo
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Sesiones grupales para mantener la motivación.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
