"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  CheckmarkBadge01Icon,
  Calendar03Icon
} from "@hugeicons/core-free-icons";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import AnimatedLayout from "@/components/layout/animated-layout";
import { VerifiedBadge } from "@/components/ui/verified-badge";

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
        // toast.error("Error al cargar la información del usuario"); // Don't toast on load
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
      <AnimatedLayout>
        <div className="container mx-auto max-w-5xl space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-80 space-y-4">
              <Skeleton className="h-[400px] w-full rounded-2xl" />
            </div>
            <div className="flex-1 space-y-4">
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-60 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </AnimatedLayout>
    );
  }

  if (!user) {
    return (
      <AnimatedLayout>
        <div className="container mx-auto p-4 md:p-6 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <div className="p-4 bg-muted/30 rounded-full">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Usuario no encontrado</h1>
          <p className="text-sm text-muted-foreground max-w-md">
            El perfil que estás buscando no existe o no está disponible públicamente.
          </p>
          <Button onClick={() => router.push("/")} variant="outline">
            Volver al inicio
          </Button>
        </div>
      </AnimatedLayout>
    );
  }

  const isInstructor = user.isInstructor && user.instructorProfile;
  const isStudent = !user.isInstructor;

  return (
    <AnimatedLayout>
      <div className="container mx-auto max-w-5xl space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
          className="text-muted-foreground hover:text-foreground pl-0 gap-2"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          Volver al inicio
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
          {/* Sidebar / Profile Info */}
          <div className="space-y-6">
            <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950">
              <div className="h-32 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:to-pink-500/20" />
              <CardContent className="px-6 pb-6 -mt-16 text-center space-y-4 relative">
                <Avatar className="h-32 w-32 border-4 border-background mx-auto shadow-sm">
                  <AvatarImage src={user.image || undefined} alt={user.name || "Usuario"} className="object-cover" />
                  <AvatarFallback className="text-4xl rounded-none bg-indigo-100 text-indigo-600">
                    {user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {user.name || "Usuario"}
                  </h1>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant={isInstructor ? "default" : "secondary"} className="rounded-full px-3 font-normal">
                      {isInstructor ? "Instructor" : "Estudiante"}
                    </Badge>
                    {/* Verified Badge if needed logic */}
                    {isInstructor && <VerifiedBadge variant="instructor" />}
                  </div>
                </div>

                {isInstructor && user.instructorProfile && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <HugeiconsIcon icon={MapPinIcon} className="w-4 h-4" />
                    <span>
                      {user.instructorProfile.city}
                      {user.instructorProfile.country && `, ${user.instructorProfile.country}`}
                    </span>
                    {countryFlag && (
                      <Image
                        src={countryFlag}
                        alt="Flag"
                        width={20}
                        height={15}
                        className="rounded-sm object-cover"
                      />
                    )}
                  </div>
                )}

                {/* Instructor Actions */}
                {isInstructor && user.instructorProfile && !viewerInfo.isInstructor && (
                  <div className="pt-4 w-full">
                    <Button
                      className="w-full font-medium shadow-md shadow-indigo-500/20"
                      onClick={handleRequestInstructor}
                      disabled={isRequesting || hasRequested}
                    >
                      {isRequesting ? "Enviando..." : hasRequested ? "Solicitud Enviada" : "Solicitar Entrenamiento"}
                    </Button>
                  </div>
                )}

                {/* Student Actions (for instructors) */}
                {isStudent && viewerInfo.isInstructor && (
                  <div className="pt-4 w-full">
                    <Button
                      className="w-full"
                      onClick={handleRequestStudent}
                      disabled={isRequesting || hasRequested}
                    >
                      {isRequesting ? "Enviando..." : hasRequested ? "Solicitud Enviada" : "Entrenar con Estudiante"}
                    </Button>
                    {!viewerInfo.hasActiveSubscription && (
                      <p className="text-[10px] text-red-500 mt-2">Requiere suscripción activa</p>
                    )}
                  </div>
                )}

              </CardContent>
            </Card>

            {/* Stats Card */}
            {isInstructor && user.instructorProfile && (
              <Card>
                <CardContent className="p-4 grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3 text-center space-y-1">
                    <p className="text-xs text-muted-foreground">Estudiantes</p>
                    <p className="text-lg font-bold flex items-center justify-center gap-1">
                      <HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4 text-indigo-500" />
                      {user.instructorProfile.totalStudents}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center space-y-1">
                    <p className="text-xs text-muted-foreground">Tarifa Mensual</p>
                    <p className="text-lg font-bold text-green-600">
                      ${user.instructorProfile.pricePerMonth || "0"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Infos */}
          <div className="space-y-6">
            {/* About Section */}
            {isInstructor && user.instructorProfile && (
              <Card className="h-full border-none shadow-sm bg-white/50 dark:bg-zinc-900/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HugeiconsIcon icon={CheckmarkBadge01Icon} className="w-5 h-5 text-indigo-500" />
                    Sobre mí
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {user.instructorProfile.bio || "Este instructor aún no ha agregado una biografía."}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Student Goals */}
            {isStudent && user.profile && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HugeiconsIcon icon={Target02Icon} className="w-5 h-5 text-indigo-500" />
                    Perfil Fitness
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20">
                    <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">Objetivo Principal</p>
                    <p className="font-semibold text-foreground">
                      {translateGoal(user.profile.goal)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Experiencia</p>
                    <p className="font-semibold text-foreground">
                      {translateExperienceLevel(user.profile.experienceLevel)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Specialties / Curriculum */}
            {isInstructor && user.instructorProfile?.curriculum && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HugeiconsIcon icon={WorkoutGymnasticsIcon} className="w-5 h-5 text-indigo-500" />
                    Especialidades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {user.instructorProfile.curriculum.split(/[,\n]/).map((item, i) => (
                      <Badge key={i} variant="secondary" className="px-3 py-1 text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300">
                        {item.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Section (Protected) */}
            {isInstructor && user.instructorProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HugeiconsIcon icon={PhoneLockIcon} className="w-5 h-5 text-zinc-500" />
                    Contacto
                  </CardTitle>
                  <CardDescription>
                    {viewerInfo.isAuthenticated && viewerInfo.isInstructor ?
                      "Información visible solo para instructores registrados." :
                      "Información protegida."
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {viewerInfo.isAuthenticated && viewerInfo.isInstructor ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {user.instructorProfile.contactEmail && (
                        <a href={`mailto:${user.instructorProfile.contactEmail}`} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <HugeiconsIcon icon={Mail01Icon} className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-medium truncate">{user.instructorProfile.contactEmail}</p>
                          </div>
                        </a>
                      )}
                      {user.instructorProfile.contactPhone && (
                        <a href={`tel:${user.instructorProfile.contactPhone}`} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                            <HugeiconsIcon icon={PhoneLockIcon} className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">Teléfono</p>
                            <p className="text-sm font-medium truncate">{user.instructorProfile.contactPhone}</p>
                          </div>
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 bg-muted/20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center space-y-2">
                      <HugeiconsIcon icon={PhoneLockIcon} className="w-8 h-8 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground font-medium">
                        {!viewerInfo.isAuthenticated ? "Inicia sesión para ver detalles" : "Solo visible para instructores"}
                      </p>
                      {!viewerInfo.isAuthenticated && (
                        <Button size="sm" variant="outline" onClick={() => router.push("/auth/signin")}>
                          Iniciar Sesión
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AnimatedLayout>
  );
}
