"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  Target02Icon,
  WorkoutGymnasticsIcon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";

type UserPublicData = {
  id: string;
  name: string | null;
  image: string | null;
  isInstructor: boolean;
  instructorProfile?: {
    id: string;
    bio: string | null;
    curriculum: string | null;
    pricePerMonth: number | null;
    contactEmail: string | null;
    contactPhone: string | null;
    country: string | null;
    city: string | null;
    isRemote: boolean;
    isPaid: boolean;
    totalStudents: number;
  };
  profile?: {
    goal: string | null;
    experienceLevel?: string | null;
  };
};

type ViewerInfo = {
  isAuthenticated: boolean;
  isInstructor: boolean;
  hasActiveSubscription: boolean;
};

export default function PublicProfilePage() {
  const { userId } = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [user, setUser] = useState<UserPublicData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [countryFlag, setCountryFlag] = useState<string | null>(null);
  const [viewerInfo, setViewerInfo] = useState<ViewerInfo>({
    isAuthenticated: false,
    isInstructor: false,
    hasActiveSubscription: false,
  });
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  // Función para traducir el objetivo al español
  const translateGoal = (goal: string | null | undefined): string => {
    if (!goal) return "";
    const goalMap: Record<string, string> = {
      "lose-weight": "Perder peso",
      "gain-muscle": "Ganar masa muscular",
      maintain: "Mantener peso",
      strength: "Fuerza",
      endurance: "Resistencia",
      mobility: "Movilidad y flexibilidad",
      "fat-loss": "Pérdida de grasa",
      hypertrophy: "Hipertrofia",
      "weight-loss": "Pérdida de peso",
      "muscle-gain": "Ganancia muscular",
    };
    return goalMap[goal.toLowerCase()] || goal;
  };

  // Función para traducir el nivel de experiencia al español
  const translateExperienceLevel = (
    level: string | null | undefined,
  ): string => {
    if (!level) return "";
    const levelMap: Record<string, string> = {
      beginner: "Principiante",
      intermediate: "Intermedio",
      advanced: "Avanzado",
    };
    return levelMap[level.toLowerCase()] || level;
  };

  // Load viewer info
  useEffect(() => {
    if (sessionStatus === "loading") return;

    if (session?.user) {
      const isViewerInstructor = session.user.isInstructor || false;
      const hasSubscription =
        (session.user as { instructorProfile?: { isPaid?: boolean } })
          ?.instructorProfile?.isPaid || false;

      setViewerInfo({
        isAuthenticated: true,
        isInstructor: isViewerInstructor,
        hasActiveSubscription: hasSubscription,
      });
    } else {
      setViewerInfo({
        isAuthenticated: false,
        isInstructor: false,
        hasActiveSubscription: false,
      });
    }
  }, [session, sessionStatus]);

  // Load user data
  useEffect(() => {
    const userIdStr = Array.isArray(userId) ? userId[0] : userId;
    if (!userIdStr) return;

    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/users/${userIdStr}/public`);
        if (!response.ok) {
          throw new Error("No se pudo cargar la información del usuario");
        }
        const data: UserPublicData = await response.json();
        setUser(data);

        if (data.instructorProfile?.country) {
          try {
            const searchParam =
              data.instructorProfile.country.length === 2
                ? `alpha/${data.instructorProfile.country}`
                : `name/${data.instructorProfile.country}`;

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
        console.error("Error fetching user:", error);
        toast.error("Error al cargar la información del usuario");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleRequestInstructor = useCallback(async () => {
    if (!user?.instructorProfile?.id) {
      toast.error("Error: ID de instructor no disponible");
      return;
    }

    if (!viewerInfo.isAuthenticated) {
      router.push(
        "/auth/signin?callbackUrl=" + encodeURIComponent(window.location.href),
      );
      return;
    }

    setIsRequesting(true);

    try {
      const response = await fetch("/api/student-instructor-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instructorProfileId: user.instructorProfile.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al enviar la solicitud");
      }

      setHasRequested(true);
      toast.success("Solicitud enviada", {
        description:
          "Tu solicitud ha sido enviada al instructor. ¡Pronto se pondrá en contacto contigo!",
      });
    } catch (error: unknown) {
      let errorMessage = "Hubo un error al procesar tu solicitud.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error("Error", {
        description: errorMessage,
      });
    } finally {
      setIsRequesting(false);
    }
  }, [user, viewerInfo.isAuthenticated, router]);

  const handleRequestStudent = useCallback(async () => {
    if (!user?.id) {
      toast.error("Error: ID de estudiante no disponible");
      return;
    }

    if (!viewerInfo.isAuthenticated) {
      router.push(
        "/auth/signin?callbackUrl=" + encodeURIComponent(window.location.href),
      );
      return;
    }

    if (!viewerInfo.isInstructor) {
      toast.error("Solo los instructores pueden entrenar con estudiantes");
      return;
    }

    if (!viewerInfo.hasActiveSubscription) {
      toast.error(
        "Debes tener una suscripción activa para entrenar con estudiantes",
      );
      router.push("/dashboard/profile/payment");
      return;
    }

    setIsRequesting(true);

    try {
      const response = await fetch("/api/instructors/request-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al enviar la solicitud");
      }

      setHasRequested(true);
      toast.success("Solicitud enviada", {
        description:
          "Tu solicitud ha sido enviada al estudiante. ¡Pronto se pondrá en contacto contigo!",
      });
    } catch (error: unknown) {
      let errorMessage = "Hubo un error al procesar tu solicitud.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error("Error", {
        description: errorMessage,
      });
    } finally {
      setIsRequesting(false);
    }
  }, [user, viewerInfo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 md:p-6">
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
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Usuario no encontrado</h1>
          <p className="text-xs text-muted-foreground mb-4">
            El perfil que estás buscando no existe o hubo un problema de
            conexión.
          </p>
          <Button onClick={() => router.push("/")} size="default">
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  const isInstructor = user.isInstructor && user.instructorProfile;
  const isStudent = !user.isInstructor;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6 w-full">
          <Button
            variant="outline"
            size="default"
            onClick={() => router.push("/")}
            className="mb-4 text-xs w-full"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>
          <h1 className="text-3xl font-semibold tracking-heading">
            {isInstructor ? "Perfil de Instructor" : "Perfil de Estudiante"}
          </h1>
        </div>

        {/* Instructor Profile */}
        {isInstructor && user.instructorProfile && (
          <div className="flex flex-col md:flex-row gap-4">
            {/* Sidebar */}
            <div className="w-full md:w-80 space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={user.image || undefined}
                        alt={user.name || "Instructor"}
                      />
                      <AvatarFallback className="text-xl tracking-heading font-semibold">
                        {user.name?.charAt(0) || "I"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center space-y-1">
                      <h2 className="text-lg tracking-heading font-semibold">
                        {user.name || "Instructor"}
                      </h2>
                      <Badge variant="outline" className="text-xs">
                        Instructor
                      </Badge>
                      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                        <HugeiconsIcon icon={MapPinIcon} className="h-3 w-3" />
                        <span>
                          {user.instructorProfile.city}
                          {user.instructorProfile.country &&
                            `, ${user.instructorProfile.country}`}
                        </span>
                        {countryFlag && (
                          <Image
                            src={countryFlag}
                            alt={user.instructorProfile.country || ""}
                            width={16}
                            height={12}
                            className="h-3 w-4 object-cover rounded-sm"
                          />
                        )}
                      </div>
                    </div>
                    {user.instructorProfile.isRemote && (
                      <Badge variant="default" className="text-xs">
                        Clases en línea
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-4 space-y-3">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {user.instructorProfile.pricePerMonth !== null && (
                      <div className="flex flex-col p-2 rounded-md bg-muted/50">
                        <span className="text-muted-foreground">
                          Precio/mes
                        </span>
                        <span className="font-semibold text-xs">
                          ${user.instructorProfile.pricePerMonth}
                        </span>
                      </div>
                    )}
                    {user.instructorProfile.totalStudents !== undefined && (
                      <div className="flex flex-col p-2 rounded-md bg-muted/50">
                        <span className="text-muted-foreground">
                          Estudiantes
                        </span>
                        <span className="font-semibold text-xs flex items-center gap-1">
                          <HugeiconsIcon
                            icon={UserGroupIcon}
                            className="h-3 w-3"
                          />
                          {user.instructorProfile.totalStudents}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Contact Info - Solo visible si hay sesión y es instructor */}
                  {viewerInfo.isAuthenticated && viewerInfo.isInstructor && (
                    <div className="space-y-1.5">
                      {user.instructorProfile.contactEmail && (
                        <a
                          href={`mailto:${user.instructorProfile.contactEmail}`}
                          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <HugeiconsIcon
                            icon={Mail01Icon}
                            className="h-3.5 w-3.5"
                          />
                          <span className="truncate">
                            {user.instructorProfile.contactEmail}
                          </span>
                        </a>
                      )}
                      {user.instructorProfile.contactPhone && (
                        <a
                          href={`tel:${user.instructorProfile.contactPhone}`}
                          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <HugeiconsIcon
                            icon={PhoneLockIcon}
                            className="h-3.5 w-3.5"
                          />
                          <span>{user.instructorProfile.contactPhone}</span>
                        </a>
                      )}
                    </div>
                  )}
                  {(!viewerInfo.isAuthenticated ||
                    !viewerInfo.isInstructor) && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground text-center">
                        {!viewerInfo.isAuthenticated
                          ? "Inicia sesión como instructor para ver información de contacto"
                          : "Solo los instructores pueden ver información de contacto"}
                      </p>
                    </div>
                  )}

                  {/* Request Button */}
                  {!viewerInfo.isInstructor && (
                    <div className="w-full space-y-1">
                      <Button
                        size="default"
                        className="text-xs h-8 w-full"
                        onClick={handleRequestInstructor}
                        disabled={isRequesting || hasRequested}
                      >
                        {isRequesting
                          ? "Enviando..."
                          : hasRequested
                            ? "Solicitud Enviada"
                            : "Solicitar Entrenamiento"}
                      </Button>
                      {!viewerInfo.isAuthenticated && (
                        <p className="text-xs text-muted-foreground text-center">
                          Inicia sesión para solicitar entrenamiento
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold tracking-heading">
                    Sobre Mí
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4">
                  {user.instructorProfile.bio ? (
                    <div className="whitespace-pre-line break-words text-xs text-muted-foreground">
                      {user.instructorProfile.bio}
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
                  <CardTitle className="text-2xl font-semibold tracking-heading">
                    Especialidades
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4">
                  {user.instructorProfile.curriculum ? (
                    <div className="flex flex-wrap gap-1.5">
                      {user.instructorProfile.curriculum
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
            </div>
          </div>
        )}

        {/* Student Profile */}
        {isStudent && (
          <div className="flex flex-col md:flex-row gap-4">
            {/* Sidebar */}
            <div className="w-full md:w-80 space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={user.image || undefined}
                        alt={user.name || "Estudiante"}
                      />
                      <AvatarFallback className="text-xl tracking-heading font-semibold">
                        {user.name?.charAt(0) || "E"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center space-y-1">
                      <h2 className="text-lg tracking-heading font-semibold">
                        {user.name || "Estudiante"}
                      </h2>
                      <Badge variant="outline" className="text-xs">
                        Estudiante
                      </Badge>
                    </div>
                    {user.profile?.goal && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <HugeiconsIcon
                          icon={Target02Icon}
                          className="h-3 w-3"
                        />
                        <span>
                          Objetivo: {translateGoal(user.profile.goal)}
                        </span>
                      </div>
                    )}
                    {user.profile?.experienceLevel && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <HugeiconsIcon
                          icon={WorkoutGymnasticsIcon}
                          className="h-3 w-3"
                        />
                        <span>
                          Nivel:{" "}
                          {translateExperienceLevel(
                            user.profile.experienceLevel,
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-4 space-y-3">
                  {/* Request Button - Only for instructors with active subscription */}
                  {viewerInfo.isInstructor &&
                    viewerInfo.hasActiveSubscription && (
                      <div className="w-full space-y-1">
                        <Button
                          size="default"
                          className="text-xs h-8 w-full"
                          onClick={handleRequestStudent}
                          disabled={isRequesting || hasRequested}
                        >
                          {isRequesting
                            ? "Enviando..."
                            : hasRequested
                              ? "Solicitud Enviada"
                              : "Entrenar con este Estudiante"}
                        </Button>
                      </div>
                    )}

                  {/* Show subscription message if instructor without subscription */}
                  {viewerInfo.isInstructor &&
                    !viewerInfo.hasActiveSubscription && (
                      <Card>
                        <CardContent className="px-4 space-y-3">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold">
                              Suscripción requerida
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Necesitas una suscripción activa para entrenar con
                              estudiantes.
                            </p>
                          </div>
                          <Button
                            size="default"
                            className="w-full text-xs h-7 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => router.push("/pricing")}
                          >
                            Ver Planes de Suscripción
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                  {/* Show login message if not authenticated */}
                  {!viewerInfo.isAuthenticated && (
                    <Card className="border-muted bg-muted/30">
                      <CardContent className="px-4 space-y-3">
                        <p className="text-xs text-muted-foreground text-center">
                          Inicia sesión como instructor para entrenar con este
                          estudiante
                        </p>
                        <Button
                          size="default"
                          variant="outline"
                          className="w-full text-xs h-7"
                          onClick={() =>
                            router.push(
                              "/auth/signin?callbackUrl=" +
                                encodeURIComponent(window.location.href),
                            )
                          }
                        >
                          Iniciar Sesión
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Show message if viewer is a student */}
                  {viewerInfo.isAuthenticated && !viewerInfo.isInstructor && (
                    <Card className="border-muted bg-muted/30">
                      <CardContent className="px-4">
                        <p className="text-xs text-muted-foreground text-center">
                          Solo los instructores pueden entrenar con estudiantes
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold tracking-heading">
                    Información del Estudiante
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4">
                  <div className="space-y-4">
                    {user.profile?.goal && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon
                            icon={Target02Icon}
                            className="h-4 w-4 text-muted-foreground"
                          />
                          <h4 className="text-xs font-semibold">Objetivo</h4>
                        </div>
                        <p className="text-xs text-muted-foreground pl-6">
                          {translateGoal(user.profile.goal)}
                        </p>
                      </div>
                    )}
                    {user.profile?.experienceLevel && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon
                            icon={WorkoutGymnasticsIcon}
                            className="h-4 w-4 text-muted-foreground"
                          />
                          <h4 className="text-xs font-semibold">
                            Nivel de Experiencia
                          </h4>
                        </div>
                        <p className="text-xs text-muted-foreground pl-6">
                          {translateExperienceLevel(
                            user.profile.experienceLevel,
                          )}
                        </p>
                      </div>
                    )}
                    {!user.profile?.goal && !user.profile?.experienceLevel && (
                      <p className="text-xs text-muted-foreground italic">
                        No hay información adicional disponible.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
