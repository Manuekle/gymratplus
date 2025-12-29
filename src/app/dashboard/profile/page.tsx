"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { differenceInDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TagSelector } from "@/components/ui/tag-selector";
import { SPECIALTIES } from "@/data/specialties";
import { BirthDatePicker } from "@/components/ui/birth-date-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BirthdayCakeIcon,
  Calendar01Icon,
  Clock01Icon,
  HandGripIcon,
  KidIcon,
  Mail01Icon,
  SmartPhone01Icon,
  SmileIcon,
  StarIcon,
  SteakIcon,
  Target02Icon,
  WorkoutGymnasticsIcon,
  QrCodeIcon,
  FireIcon,
  Dumbbell01Icon,
  Camera01Icon,
} from "@hugeicons/core-free-icons";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { upload } from "@vercel/blob/client";

// Función para obtener el color de la racha según el número
const getStreakColor = (streak: number) => {
  // 365+: Blanco brillante / Dorado (temperatura máxima)
  if (streak >= 365) {
    return {
      bg: "bg-gradient-to-br from-yellow-200 via-yellow-100 to-white dark:from-yellow-900/40 dark:via-yellow-800/30 dark:to-zinc-800",
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      textColor: "text-yellow-900 dark:text-yellow-100",
      border: "border-yellow-300/50 dark:border-yellow-700/30",
    };
  }
  // 291-364: Rojo anaranjado / Rojo intenso
  if (streak >= 291) {
    return {
      bg: "bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-zinc-800",
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
      textColor: "text-red-900 dark:text-red-100",
      border: "border-red-300/50 dark:border-red-700/30",
    };
  }
  // 221-290: Naranja
  if (streak >= 221) {
    return {
      bg: "bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-zinc-800",
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400",
      textColor: "text-orange-900 dark:text-orange-100",
      border: "border-orange-300/50 dark:border-orange-700/30",
    };
  }
  // 151-220: Amarillo pálido / Amarillo brillante
  if (streak >= 151) {
    return {
      bg: "bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-zinc-800",
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      textColor: "text-yellow-900 dark:text-yellow-100",
      border: "border-yellow-300/50 dark:border-yellow-700/30",
    };
  }
  // 101-150: Verde claro / Lima
  if (streak >= 101) {
    return {
      bg: "bg-gradient-to-br from-lime-50 to-white dark:from-lime-900/20 dark:to-zinc-800",
      iconBg: "bg-lime-100 dark:bg-lime-900/30",
      iconColor: "text-lime-600 dark:text-lime-400",
      textColor: "text-lime-900 dark:text-lime-100",
      border: "border-lime-300/50 dark:border-lime-700/30",
    };
  }
  // 51-100: Cian / Turquesa
  if (streak >= 51) {
    return {
      bg: "bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-900/20 dark:to-zinc-800",
      iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      textColor: "text-cyan-900 dark:text-cyan-100",
      border: "border-cyan-300/50 dark:border-cyan-700/30",
    };
  }
  // 1-50: Azul profundo / Índigo
  if (streak >= 1) {
    return {
      bg: "bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-zinc-800",
      iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      textColor: "text-indigo-900 dark:text-indigo-100",
      border: "border-indigo-300/50 dark:border-indigo-700/30",
    };
  }
  // 0: Gris sin racha
  return {
    bg: "bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900/20 dark:to-zinc-800",
    iconBg: "bg-zinc-100 dark:bg-zinc-900/30",
    iconColor: "text-zinc-600 dark:text-zinc-400",
    textColor: "text-zinc-900 dark:text-zinc-100",
    border: "border-zinc-300/50 dark:border-zinc-700/30",
  };
};

export default function ProfilePage() {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imageKey, setImageKey] = useState(0);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [streakStats, setStreakStats] = useState<{
    currentStreak: number;
    longestStreak: number;
    totalWorkoutDays: number;
    totalWorkoutSessions: number;
    lastWorkoutDate: string | null;
  } | null>(null);
  const [loadingStreak, setLoadingStreak] = useState(true);

  const { data: session, status, update } = useSession();
  const isInstructor = session?.user?.isInstructor || false;

  // Load user data when session is available
  useEffect(() => {
    if (session?.user) {
      const user = session.user;

      // Set form fields from user data
      if (user) {
        setName(user.name || "");
        setPhone((user.profile as { phone?: string })?.phone || "");
        setBirthdate(
          (
            user.profile as { birthdate?: Date | string }
          )?.birthdate?.toString() || "",
        );
        // Convertir de inglés a español para el Select
        const experienceLevelMap: Record<string, string> = {
          beginner: "principiante",
          intermediate: "intermedio",
          advanced: "avanzado",
        };
        setExperienceLevel(
          user.experienceLevel
            ? experienceLevelMap[user.experienceLevel] || user.experienceLevel
            : "",
        );
        setPreferredWorkoutTime(
          (user.profile as { preferredWorkoutTime?: string })
            ?.preferredWorkoutTime || "",
        );
        setDailyActivity(
          (user.profile as { dailyActivity?: string })?.dailyActivity || "",
        );
        setGoal((user.profile as { goal?: string })?.goal || "");
        setDietaryPreference(
          (user.profile as { dietaryPreference?: string })?.dietaryPreference ||
          "",
        );
        setMonthsTraining(
          (user.profile as { monthsTraining?: number })?.monthsTraining || 0,
        );
      }

      // Actualizar imagen local si hay una nueva en la sesión
      if (user?.image) {
        setCurrentImage(user.image);
      }

      // Load user tags
      fetch("/api/users/me/tags")
        .then((res) => res.json())
        .then((interests: string[]) => {
          setSelectedTags(interests);
        })
        .catch(() => { });

      // Load streak stats
      if (session.user.id) {
        setLoadingStreak(true);
        fetch(`/api/workout-streak?userId=${session.user.id}`)
          .then((res) => res.json())
          .then((data) => {
            setStreakStats({
              currentStreak: data.currentStreak || 0,
              longestStreak: data.longestStreak || 0,
              totalWorkoutDays: data.totalWorkoutDays || 0,
              totalWorkoutSessions: data.totalWorkoutSessions || 0,
              lastWorkoutDate: data.lastWorkoutDate || null,
            });
          })
          .catch((error) => {
            console.error("Error loading streak stats:", error);
          })
          .finally(() => {
            setLoadingStreak(false);
          });
      }
    }
  }, [session]);

  // const [email, setEmail] = useState(session?.user?.email || "");
  const [name, setName] = useState(session?.user?.name || "");

  const [phone, setPhone] = useState(
    (session?.user as { profile?: { phone?: string } })?.profile?.phone || "",
  );

  const [birthdate, setBirthdate] = useState<string>(
    (session?.user as { profile?: { birthdate?: string } })?.profile
      ?.birthdate || "",
  );

  const [experienceLevel, setExperienceLevel] = useState(
    session?.user?.experienceLevel || "",
  );

  const [preferredWorkoutTime, setPreferredWorkoutTime] = useState(
    (session?.user as { profile?: { preferredWorkoutTime?: string } })?.profile
      ?.preferredWorkoutTime || "",
  );
  const [dailyActivity, setDailyActivity] = useState(
    (session?.user as { profile?: { dailyActivity?: string } })?.profile
      ?.dailyActivity || "",
  );

  const [goal, setGoal] = useState(
    (session?.user as { profile?: { goal?: string } })?.profile?.goal || "",
  );

  const [dietaryPreference, setDietaryPreference] = useState(
    (session?.user as { profile?: { dietaryPreference?: string } })?.profile
      ?.dietaryPreference || "",
  );

  // Estado para monthsTraining
  const [monthsTraining, setMonthsTraining] = useState(
    (session?.user as { profile?: { monthsTraining?: number } })?.profile
      ?.monthsTraining || 0,
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      const newBlob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      const url = newBlob.url;

      // 1. Guardar en la base de datos
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });

      // 2. Actualizar la imagen local inmediatamente para que se vea el cambio
      setCurrentImage(url);
      setImageKey((prev) => prev + 1);

      // Forzar actualización de la sesión usando el trigger "update" de NextAuth
      // Esto hará que el callback jwt recargue los datos desde la base de datos
      await update({
        ...session,
        user: {
          ...session?.user,
          image: url,
        },
      });

      // Mostrar mensaje de éxito
      toast.success("¡Imagen actualizada!", {
        description: "Tu foto de perfil ha sido actualizada correctamente.",
      });
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Algo salió mal.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleTagChange = async (newTagIds: string[]) => {
    const previousTags = selectedTags;
    setSelectedTags(newTagIds);
    try {
      const res = await fetch("/api/users/me/tags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: newTagIds }),
      });
      if (!res.ok) throw new Error("No se pudo guardar los intereses");
      // No llamar a update() para evitar recarga de página
      toast.success("Intereses actualizados correctamente");
    } catch {
      toast.error("Error al guardar intereses");
      // Revertir cambios en caso de error
      setSelectedTags(previousTags);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsUploading(true);

      // Validaciones
      if (
        !name ||
        !phone ||
        !experienceLevel ||
        !birthdate ||
        !preferredWorkoutTime ||
        !dailyActivity ||
        !goal ||
        !dietaryPreference ||
        monthsTraining < 0
      ) {
        toast.error("Error", {
          description: "Todos los campos son requeridos.",
        });
        return;
      }

      // Convertir experienceLevel de español a inglés para la base de datos
      const experienceLevelToEnglish: Record<string, string> = {
        principiante: "beginner",
        intermedio: "intermediate",
        avanzado: "advanced",
      };
      const experienceLevelEnglish =
        experienceLevelToEnglish[experienceLevel] || experienceLevel;

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          experienceLevel: experienceLevelEnglish,
          birthdate,
          preferredWorkoutTime,
          dailyActivity,
          goal,
          dietaryPreference,
          monthsTraining,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();

      // Actualizar la sesión con los nuevos datos
      await update({
        ...session,
        user: {
          ...session?.user,
          name,
          experienceLevel,
          profile: data.profile,
        },
      });

      // Forzar recarga de la página después de un pequeño retraso
      setTimeout(() => {
        window.location.reload();
      }, 500);

      // Cerrar el modo de edición
      setIsEditing(false);

      toast.success("Perfil actualizado", {
        description: "Tu perfil ha sido actualizado correctamente.",
      });

      // isEditing
      // setIsEditing(false);
    } catch {
      toast.error("Error", {
        description: "No se pudo actualizar el perfil.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!session || status !== "authenticated") {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="px-4 pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-4 flex-1 text-center md:text-left">
                <div className="flex flex-col items-center md:flex-row md:items-center gap-2 md:gap-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <Skeleton className="h-9 w-20" />
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-40 mb-2" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="px-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
                <Skeleton className="h-px w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="px-4">
              <div className="space-y-4">
                <div className="flex flex-row flex-wrap gap-4">
                  <Skeleton className="h-20 flex-1 min-w-[140px] rounded-lg" />
                  <Skeleton className="h-20 flex-1 min-w-[140px] rounded-lg" />
                </div>
                <Skeleton className="h-px w-full" />
                <div className="flex flex-row flex-wrap gap-4">
                  <Skeleton className="h-12 flex-1 min-w-[140px]" />
                  <Skeleton className="h-12 flex-1 min-w-[140px]" />
                </div>
                <Skeleton className="h-px w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="px-4">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="px-4 pt-0">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex flex-col items-center md:items-start relative gap-2">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-background">
                  <AvatarImage
                    src={currentImage || session?.user?.image || undefined}
                    alt="Profile picture"
                    key={`${currentImage || session?.user?.image || ""}-${imageKey}`}
                  />

                  <AvatarFallback className="text-2xl">
                    {session?.user?.name
                      ?.split(" ")
                      .map((word) => word[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                {isEditing && (
                  <button
                    onClick={() =>
                      document.getElementById("profile-image-upload")?.click()
                    }
                    className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <HugeiconsIcon
                        icon={Camera01Icon}
                        className="h-5 w-5 text-white"
                      />
                      <span className="text-xs text-white font-medium">
                        Editar
                      </span>
                    </div>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4 flex-1 text-center md:text-left pt-2 md:pt-0">
              <div>
                {/* Name and role badge */}
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h2 className="text-2xl font-semibold tracking-heading">
                    {session?.user?.name}
                  </h2>
                  {/* Icono de Verificado para PRO/Instructor */}
                  {(session?.user?.subscriptionStatus === "active" ||
                    session?.user?.subscriptionStatus === "trialing") && (
                      <VerifiedBadge
                        variant={
                          session?.user?.subscriptionTier === "PRO"
                            ? "pro"
                            : isInstructor
                              ? "instructor"
                              : "default"
                        }
                      />
                    )}
                </div>

                {/* Badge de Instructor o Alumno */}

                {/* Action buttons */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                  <Button
                    asChild
                    variant="outline"
                    size="default"
                    className="text-xs"
                  >
                    <Link href="/dashboard/profile/qr">
                      <HugeiconsIcon
                        icon={QrCodeIcon}
                        className="h-4 w-4 mr-2"
                      />
                      Ver mi código QR
                    </Link>
                  </Button>
                  {/* Only show upgrade button if user doesn't have an active subscription */}
                  {!isInstructor && !session?.user?.subscriptionStatus && (
                    <Button
                      asChild
                      variant="default"
                      size="default"
                      className="text-xs"
                    >
                      <Link href="/dashboard/profile/billing">
                        <HugeiconsIcon
                          icon={StarIcon}
                          className="h-4 w-4 mr-2"
                        />
                        Mejorar a Premium
                      </Link>
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center text-muted-foreground text-xs">
                  <HugeiconsIcon icon={KidIcon} className="h-4 w-4 mr-1" />

                  <span>
                    {(() => {
                      const birthdate = (
                        session?.user as { profile?: { birthdate?: string } }
                      )?.profile?.birthdate;
                      if (!birthdate) return "Edad no disponible";

                      const today = new Date();
                      const birthDate = new Date(birthdate as string);
                      let age = today.getFullYear() - birthDate.getFullYear();
                      const monthDiff = today.getMonth() - birthDate.getMonth();

                      if (
                        monthDiff < 0 ||
                        (monthDiff === 0 &&
                          today.getDate() < birthDate.getDate())
                      ) {
                        age--;
                      }

                      return `${age} años`;
                    })()}
                  </span>
                </div>
                <div className="flex items-center text-muted-foreground text-xs">
                  <HugeiconsIcon
                    icon={Calendar01Icon}
                    className="h-4 w-4 mr-1"
                  />
                  <span>
                    Se unió en{" "}
                    {(() => {
                      // Obtain the createdAt value
                      const createdAt = (
                        session?.user as { profile?: { createdAt?: string } }
                      )?.profile?.createdAt;
                      return createdAt
                        ? new Date(createdAt as string).toLocaleDateString(
                          "es-ES",
                          {
                            month: "long",
                            year: "numeric",
                          },
                        )
                        : "";
                    })()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-2 md:justify-end md:self-start pt-4 md:pt-0">
              <Button
                onClick={
                  isEditing ? handleSaveProfile : () => setIsEditing(true)
                }
                className="text-xs px-4"
                size="default"
                disabled={isUploading}
              >
                {isUploading ? (
                  <span className="flex items-center">
                    <Icons.spinner className="animate-spin h-4 w-4 mr-2" />
                    <h1>Subiendo</h1>
                  </span>
                ) : isEditing ? (
                  "Guardar"
                ) : (
                  "Editar"
                )}
              </Button>
              {/* button cancel */}
              {isEditing && (
                <Button
                  onClick={() => setIsEditing(false)}
                  className="text-xs px-4"
                  size="default"
                  variant="destructive"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>



      <Tabs defaultValue="personal" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 gap-1 md:grid-cols-4 h-auto p-1">
          <TabsTrigger value="personal" className="text-xs sm:text-xs">
            Personal
          </TabsTrigger>
          <TabsTrigger value="preferences" className="text-xs sm:text-xs">
            Preferencias
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs sm:text-xs">
            Actividad
          </TabsTrigger>
          <TabsTrigger value="billing" className="text-xs sm:text-xs">
            Facturación
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader className="pb-3 flex flex-row flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-semibold tracking-heading">
                  Información de contacto
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Datos de contacto y comunicación
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-4 space-y-4">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 items-center md:gap-8 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs md:text-xs" htmlFor="email">
                        Correo electronico
                      </Label>
                      <Input
                        disabled
                        className="text-xs md:text-xs"
                        id="email"
                        // onChange={(e) => setEmail(e.target.value)}
                        defaultValue={session?.user?.email || ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <BirthDatePicker
                        value={birthdate}
                        onValueChange={setBirthdate}
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 items-center md:gap-8 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs md:text-xs" htmlFor="name">
                        Nombre
                      </Label>
                      <Input
                        // disabled
                        className="text-xs md:text-xs"
                        id="name"
                        placeholder="Ingresa tu nombre"
                        onChange={(e) => setName(e.target.value)}
                        defaultValue={session?.user?.name || ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs md:text-xs" htmlFor="phone">
                        Teléfono
                      </Label>
                      <Input
                        className="text-xs md:text-xs"
                        id="phone"
                        placeholder="Ingresa tu teléfono"
                        defaultValue={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 items-center md:gap-8 gap-4">
                    <div className="space-y-2">
                      <Label
                        className="text-xs md:text-xs"
                        htmlFor="experience"
                      >
                        Experiencia
                      </Label>
                      <Select
                        value={experienceLevel}
                        onValueChange={(value) => setExperienceLevel(value)}
                      >
                        <SelectTrigger className="text-xs md:text-xs w-full">
                          <SelectValue placeholder="Selecciona tu experiencia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            className="text-xs md:text-xs"
                            value="principiante"
                          >
                            <div className="flex items-center">
                              Principiante
                            </div>
                          </SelectItem>
                          <SelectItem
                            className="text-xs md:text-xs"
                            value="intermedio"
                          >
                            <div className="flex items-center">Intermedio</div>
                          </SelectItem>
                          <SelectItem
                            className="text-xs md:text-xs"
                            value="avanzado"
                          >
                            <div className="flex items-center">Avanzado</div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {isInstructor ? (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground text-left">
                          Podrás reactivarla cuando quieras
                        </p>
                        <Button
                          variant="destructive"
                          className="w-full text-xs"
                          size="default"
                          onClick={() => setShowCancelDialog(true)}
                        >
                          <HugeiconsIcon
                            icon={StarIcon}
                            className="h-4 w-4 mr-2"
                          />
                          Cancelar suscripción
                        </Button>

                        <Dialog
                          open={showCancelDialog}
                          onOpenChange={setShowCancelDialog}
                        >
                          <DialogContent className="sm:max-w-[425px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-semibold tracking-heading">
                                Confirmar cancelación
                              </DialogTitle>
                              <DialogDescription className="text-xs text-muted-foreground">
                                ¿Estás seguro de que deseas cancelar tu
                                suscripción de instructor? Tus datos se
                                conservarán para futuras suscripciones.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="sm:justify-start gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowCancelDialog(false)}
                                disabled={isCanceling}
                              >
                                Volver
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={async () => {
                                  try {
                                    setIsCanceling(true);
                                    const response = await fetch(
                                      "/api/instructors/cancel-subscription",
                                      { method: "POST" },
                                    );

                                    if (response.ok) {
                                      await update();
                                      setShowCancelDialog(false);
                                      toast.success(
                                        "Suscripción cancelada correctamente",
                                      );
                                    } else {
                                      throw new Error(
                                        "Error al cancelar la suscripción",
                                      );
                                    }
                                  } catch {
                                    toast.error(
                                      "Error al cancelar la suscripción",
                                    );
                                  } finally {
                                    setIsCanceling(false);
                                  }
                                }}
                                disabled={isCanceling}
                              >
                                {isCanceling ? (
                                  <>
                                    <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                                    Cancelando...
                                  </>
                                ) : (
                                  "Confirmar cancelación"
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label
                          className="text-xs md:text-xs"
                          htmlFor="monthsTraining"
                        >
                          Meses entrenando
                        </Label>
                        <Input
                          className="text-xs md:text-xs"
                          id="monthsTraining"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="Ej: 12"
                          value={monthsTraining ? monthsTraining : ""}
                          onChange={(e) =>
                            setMonthsTraining(Number(e.target.value))
                          }
                        />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="grid grid-cols-[25px_1fr] gap-4 items-center">
                      <HugeiconsIcon
                        icon={Mail01Icon}
                        className="h-5 w-5 text-muted-foreground"
                      />
                      <div>
                        <div className="font-medium text-xs">
                          Correo electronico
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {session?.user?.email}
                        </div>
                      </div>
                    </div>

                    {/* <Separator className=""/> */}
                    {/* hide separator in md */}
                    <div className="md:hidden block py-4">
                      <Separator />
                    </div>

                    <div className="grid grid-cols-[25px_1fr] gap-4 items-center">
                      <HugeiconsIcon
                        icon={BirthdayCakeIcon}
                        className="h-5 w-5 text-muted-foreground"
                      />
                      <div>
                        <div className="font-medium text-xs">
                          Fecha de nacimiento
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {(() => {
                            const birthdate = (
                              session?.user as {
                                profile?: { birthdate?: string };
                              }
                            )?.profile?.birthdate;
                            return birthdate
                              ? new Date(
                                birthdate as string,
                              ).toLocaleDateString("es-ES", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                              : "Fecha no disponible";
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="grid grid-cols-[25px_1fr] gap-4 items-center">
                      <HugeiconsIcon
                        icon={SmileIcon}
                        className="h-5 w-5 text-muted-foreground"
                      />
                      <div>
                        <div className="font-medium text-xs">Nombre</div>
                        <div className="text-muted-foreground text-xs">
                          {session?.user?.name}
                        </div>
                      </div>
                    </div>

                    {/* <Separator /> */}
                    <div className="md:hidden block py-4">
                      <Separator />
                    </div>
                    <div className="grid grid-cols-[25px_1fr] gap-4 items-center">
                      <HugeiconsIcon
                        icon={SmartPhone01Icon}
                        className="h-5 w-5 text-muted-foreground"
                      />
                      <div>
                        <div className="font-medium text-xs">Teléfono</div>
                        <div className="text-muted-foreground text-xs">
                          {(() => {
                            // Obtain the createdAt value
                            const phone = (
                              session?.user as { profile?: { phone?: string } }
                            )?.profile?.phone;
                            return phone || "No especificado";
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="grid grid-cols-[25px_1fr] gap-4 items-center">
                      <HugeiconsIcon
                        icon={StarIcon}
                        className="h-5 w-5 text-muted-foreground"
                      />
                      <div>
                        <div className="font-medium text-xs">Experiencia</div>
                        <div className="text-muted-foreground text-xs">
                          {(() => {
                            const level = session?.user?.experienceLevel;
                            if (!level) return "No especificado";
                            const translations: Record<string, string> = {
                              beginner: "Principiante",
                              intermediate: "Intermedio",
                              advanced: "Avanzado",
                            };
                            return translations[level] || level;
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* <Separator /> */}
                    <div className="md:hidden block py-4">
                      <Separator />
                    </div>
                    <div className="grid grid-cols-[25px_1fr] gap-4 items-center">
                      <HugeiconsIcon
                        icon={HandGripIcon}
                        className="h-5 w-5 text-muted-foreground"
                      />
                      <div>
                        <div className="font-medium text-xs">
                          Meses entrenando
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {(
                            session?.user as {
                              profile?: { monthsTraining?: number };
                            }
                          )?.profile?.monthsTraining ?? monthsTraining}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-semibold tracking-heading">
                Preferencias de entrenamiento
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Información sobre tus preferencias
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 space-y-4">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preferredWorkoutTime">
                        Horario preferido
                      </Label>
                      <Select
                        value={preferredWorkoutTime}
                        onValueChange={setPreferredWorkoutTime}
                      >
                        <SelectTrigger className="w-full">
                          <div className="flex items-center gap-2">
                            <HugeiconsIcon
                              icon={Clock01Icon}
                              size={18}
                              className="text-muted-foreground"
                            />
                            <SelectValue placeholder="Selecciona tu hora preferida" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          <SelectItem value="early-morning">
                            Temprano en la mañana (5-8 AM)
                          </SelectItem>
                          <SelectItem value="morning">
                            Mañana (8-11 AM)
                          </SelectItem>
                          <SelectItem value="noon">
                            Mediodía (11 AM-2 PM)
                          </SelectItem>
                          <SelectItem value="afternoon">
                            Tarde (2-5 PM)
                          </SelectItem>
                          <SelectItem value="evening">
                            Atardecer (5-8 PM)
                          </SelectItem>
                          <SelectItem value="night">Noche (8-11 PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dailyActivity">Actividad diaria</Label>
                      <Select
                        value={dailyActivity}
                        onValueChange={setDailyActivity}
                      >
                        <SelectTrigger className="w-full">
                          <div className="flex items-center gap-2">
                            <HugeiconsIcon
                              icon={WorkoutGymnasticsIcon}
                              size={18}
                              className="text-muted-foreground"
                            />
                            <SelectValue placeholder="Selecciona tu actividad diaria" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          <SelectItem value="office-work">
                            Trabajo de oficina (sedentario)
                          </SelectItem>
                          <SelectItem value="light-physical">
                            Trabajo físico ligero
                          </SelectItem>
                          <SelectItem value="moderate-physical">
                            Trabajo físico moderado
                          </SelectItem>
                          <SelectItem value="heavy-physical">
                            Trabajo físico pesado
                          </SelectItem>
                          <SelectItem value="very-heavy-physical">
                            Trabajo físico muy pesado
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="goal">Objetivo actual</Label>
                    <Select value={goal} onValueChange={setGoal}>
                      <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon
                            icon={Target02Icon}
                            size={18}
                            className="text-muted-foreground"
                          />
                          <SelectValue placeholder="Selecciona tu objetivo" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="lose-weight">Perder peso</SelectItem>
                        <SelectItem value="maintain">Mantener peso</SelectItem>
                        <SelectItem value="gain-muscle">
                          Ganar músculo
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="dietaryPreference">
                      Preferencia dietetica
                    </Label>
                    <Select
                      value={dietaryPreference}
                      onValueChange={setDietaryPreference}
                    >
                      <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon
                            icon={SteakIcon}
                            size={18}
                            className="text-muted-foreground"
                          />
                          <SelectValue placeholder="Selecciona tu preferencia dietética" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="no-preference">
                          Sin preferencia específica
                        </SelectItem>
                        <SelectItem value="vegetarian">Vegetariano</SelectItem>
                        <SelectItem value="vegan">Vegano</SelectItem>
                        <SelectItem value="pescatarian">
                          Pescetariano
                        </SelectItem>
                        <SelectItem value="keto">Keto</SelectItem>
                        <SelectItem value="paleo">Paleo</SelectItem>
                        <SelectItem value="mediterranean">
                          Mediterránea
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium">
                        Horario preferido
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(() => {
                          const time = (
                            session?.user as {
                              profile?: { preferredWorkoutTime?: string };
                            }
                          )?.profile?.preferredWorkoutTime;
                          switch (time) {
                            case "early-morning":
                              return "Temprano en la mañana (5-8 AM)";
                            case "morning":
                              return "Mañana (8-11 AM)";
                            case "noon":
                              return "Mediodía (11 AM-2 PM)";
                            case "afternoon":
                              return "Tarde (2-5 PM)";
                            case "evening":
                              return "Atardecer (5-8 PM)";
                            case "night":
                              return "Noche (8-11 PM)";
                            default:
                              return "No especificado";
                          }
                        })()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium">
                        Actividad diaria
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(() => {
                          const activity = (
                            session?.user as {
                              profile?: { dailyActivity?: string };
                            }
                          )?.profile?.dailyActivity;
                          switch (activity) {
                            case "office-work":
                              return "Trabajo de oficina (sedentario)";
                            case "light-physical":
                              return "Trabajo físico ligero";
                            case "moderate-physical":
                              return "Trabajo físico moderado";
                            case "heavy-physical":
                              return "Trabajo físico pesado";
                            case "very-heavy-physical":
                              return "Trabajo físico muy pesado";
                            default:
                              return "No especificado";
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                  <Separator />

                  <div>
                    <div className="text-xs font-medium mb-2">
                      Objetivo actual
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default" className="text-xs">
                        {(() => {
                          const goal = (
                            session?.user as {
                              profile?: { goal?: string };
                            }
                          )?.profile?.goal;
                          switch (goal) {
                            case "lose-weight":
                              return "Perder peso";
                            case "maintain":
                              return "Mantener peso";
                            case "gain-muscle":
                              return "Ganar músculo";
                            default:
                              return "No especificado";
                          }
                        })()}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="text-xs font-medium">
                      Preferencia dietetica
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(() => {
                        const preference = (
                          session?.user as {
                            profile?: { dietaryPreference?: string };
                          }
                        )?.profile?.dietaryPreference;
                        switch (preference) {
                          case "no-preference":
                            return "Sin preferencia específica";
                          case "vegetarian":
                            return "Vegetariano";
                          case "vegan":
                            return "Vegano";
                          case "pescatarian":
                            return "Pescetariano";
                          case "keto":
                            return "Keto";
                          case "paleo":
                            return "Paleo";
                          case "mediterranean":
                            return "Mediterránea";
                          default:
                            return "No especificado";
                        }
                      })()}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Estadísticas de Racha y Tus intereses */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Estadísticas de Racha */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-2xl font-semibold tracking-heading">
                  Estadísticas de Racha
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Tu progreso y logros en entrenamiento
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 space-y-4">
                {loadingStreak ? (
                  <div className="space-y-4">
                    {/* Skeleton para las dos cards principales */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Skeleton className="h-20 w-full rounded-lg" />
                      <Skeleton className="h-20 w-full rounded-lg" />
                    </div>
                    {/* Skeleton para el separador */}
                    <Skeleton className="h-px w-full" />
                    {/* Skeleton para los dos items de estadísticas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 sm:gap-4 w-full">
                        <Skeleton className="h-5 w-5 rounded flex-shrink-0" />
                        <div className="flex-1 space-y-2 min-w-0">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 w-full">
                        <Skeleton className="h-5 w-5 rounded flex-shrink-0" />
                        <div className="flex-1 space-y-2 min-w-0">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </div>
                    {/* Skeleton para el último entrenamiento */}
                    <Skeleton className="h-px w-full" />
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-5 w-5 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </div>
                ) : streakStats ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Racha Actual */}
                      {(() => {
                        const streakColor = getStreakColor(
                          streakStats!.currentStreak,
                        );
                        return (
                          <div
                            className={`p-4 rounded-lg border ${streakColor.bg} ${streakColor.border} w-full`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full ${streakColor.iconBg} flex items-center justify-center flex-shrink-0`}
                              >
                                <HugeiconsIcon
                                  icon={FireIcon}
                                  className={`h-5 w-5 sm:h-6 sm:w-6 ${streakColor.iconColor}`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-muted-foreground mb-1">
                                  Racha Actual
                                </div>
                                <div
                                  className={`text-lg sm:text-xl font-semibold ${streakColor.textColor}`}
                                >
                                  {streakStats!.currentStreak} día
                                  {streakStats!.currentStreak !== 1 ? "s" : ""}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Racha Más Larga */}
                      <div className="p-4 rounded-lg border bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-zinc-800 w-full">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                            <HugeiconsIcon
                              icon={StarIcon}
                              className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 dark:text-yellow-400"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-muted-foreground mb-1">
                              Racha Más Larga
                            </div>
                            <div className="text-lg sm:text-xl font-semibold">
                              {streakStats!.longestStreak} día
                              {streakStats!.longestStreak !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Total de Días Entrenados */}
                      <div className="flex items-center gap-3 sm:gap-4 w-full">
                        <HugeiconsIcon
                          icon={Calendar01Icon}
                          className="h-5 w-5 text-muted-foreground flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs mb-0.5">
                            Total de días entrenados
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {streakStats!.totalWorkoutDays} día
                            {streakStats!.totalWorkoutDays !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>

                      {/* Total de Sesiones */}
                      <div className="flex items-center gap-3 sm:gap-4 w-full">
                        <HugeiconsIcon
                          icon={Dumbbell01Icon}
                          className="h-5 w-5 text-muted-foreground flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs mb-0.5">
                            Total de sesiones
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {streakStats!.totalWorkoutSessions} sesión
                            {streakStats!.totalWorkoutSessions !== 1
                              ? "es"
                              : ""}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Último Entrenamiento */}
                    {streakStats.lastWorkoutDate && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-4">
                          <HugeiconsIcon
                            icon={Clock01Icon}
                            className="h-5 w-5 text-muted-foreground"
                          />
                          <div>
                            <div className="font-medium text-xs">
                              Último entrenamiento
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {(() => {
                                const lastDate = new Date(
                                  streakStats!.lastWorkoutDate!,
                                );
                                lastDate.setHours(0, 0, 0, 0);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const daysDiff = differenceInDays(
                                  today,
                                  lastDate,
                                );

                                if (daysDiff === 0) {
                                  return "Hoy";
                                } else if (daysDiff === 1) {
                                  return "Ayer";
                                } else {
                                  return `Hace ${daysDiff} ${daysDiff === 1 ? "día" : "días"
                                    }`;
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-xs text-muted-foreground">
                      No hay estadísticas de racha disponibles
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tus intereses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold tracking-heading">
                  Tus intereses
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Selecciona los temas que te interesan para encontrar
                  instructores y contenido relevante.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4">
                <TagSelector
                  selectedTags={selectedTags}
                  onTagSelect={handleTagChange}
                  availableTags={SPECIALTIES}
                  placeholder="Selecciona tus intereses..."
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold tracking-heading">
                Suscripción y Facturación
              </CardTitle>
              <CardDescription>
                Gestiona tu plan y métodos de pago
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">Plan actual</div>
                  <div className="text-xs text-muted-foreground">
                    {session?.user?.subscriptionTier === "PRO"
                      ? "Pro"
                      : session?.user?.subscriptionTier === "INSTRUCTOR"
                        ? "Instructor"
                        : "Gratuito"}
                  </div>
                </div>
                <Button
                  asChild
                  variant={
                    session?.user?.subscriptionStatus === "active"
                      ? "outline"
                      : "default"
                  }
                >
                  <Link href="/dashboard/profile/billing">
                    {session?.user?.subscriptionStatus === "active"
                      ? "Gestionar Suscripción"
                      : "Ver Planes / Mejorar"}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
