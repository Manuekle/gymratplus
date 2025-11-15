"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
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
} from "@hugeicons/core-free-icons";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imageKey, setImageKey] = useState(0);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

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
        setExperienceLevel(user.experienceLevel || "");
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
        });
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

      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Error al subir la imagen. Inténtalo de nuevo.");
      }

      const { url } = await uploadResponse.json();

      // Actualizar la imagen local inmediatamente para que se vea el cambio
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
        monthsTraining <= 0
      ) {
        toast.error("Error", {
          description: "Todos los campos son requeridos.",
        });
        return;
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          experienceLevel,
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
          _localStorage: {
            name,
            email: session?.user?.email || "",
            experienceLevel,
            image: session?.user?.image || "",
            profile: data.profile,
          },
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
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="px-4 pt-0">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex flex-col items-center md:items-start relative">
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
                {isEditing && (
                  <div
                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() =>
                      document.getElementById("profile-image-upload")?.click()
                    }
                  >
                    <span className="text-white font-medium tracking-heading text-xs">
                      cambiar
                    </span>
                    <input
                      id="profile-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 flex-1 text-center md:text-left pt-2 md:pt-0">
              <div>
                <div className="flex flex-col items-center md:flex-row md:items-center gap-2 md:gap-4">
                  <h2 className="text-2xl font-semibold  tracking-heading">
                    {session?.user?.name}
                  </h2>
                  {isInstructor && (
                    <Badge variant="outline" className="text-xs">
                      Instructor
                    </Badge>
                  )}
                  {!isInstructor && (
                    <Badge variant="outline" className="text-xs">
                      Alumno
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
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
                  {!isInstructor && (
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="text-xs"
                    >
                      <Link href="/dashboard/profile/payment">
                        <HugeiconsIcon
                          icon={StarIcon}
                          className="h-4 w-4 mr-2"
                        />
                        Convertirme en instructor
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
                size="sm"
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
                  size="sm"
                  variant="destructive"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-semibold tracking-heading">
              Información de contacto
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              Datos de contacto y comunicación
            </CardDescription>
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
                    <Label className="text-xs md:text-xs" htmlFor="name">
                      Nombre
                    </Label>
                    <Input
                      // disabled
                      className="text-xs md:text-xs"
                      id="name"
                      onChange={(e) => setName(e.target.value)}
                      defaultValue={session?.user?.name || ""}
                    />
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 items-center md:gap-8 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs md:text-xs" htmlFor="phone">
                      Teléfono
                    </Label>
                    <Input
                      className="text-xs md:text-xs"
                      id="phone"
                      defaultValue={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs md:text-xs" htmlFor="experience">
                      Experiencia
                    </Label>
                    <Select
                      defaultValue={session?.user?.experienceLevel || ""}
                      value={experienceLevel}
                      onValueChange={(value) => setExperienceLevel(value)}
                    >
                      <SelectTrigger className="text-xs md:text-xs">
                        <SelectValue placeholder="Selecciona tu experiencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          className="text-xs md:text-xs"
                          value="principiante"
                        >
                          <div className="flex items-center">Principiante</div>
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
                </div>
                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 items-center md:gap-8 gap-4">
                  <div className="space-y-2">
                    <BirthDatePicker
                      value={birthdate}
                      onValueChange={setBirthdate}
                    />
                  </div>
                  {isInstructor ? (
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full text-xs bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                        size="sm"
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
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Cancelando...
                                </>
                              ) : (
                                "Confirmar cancelación"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <p className="text-xs text-muted-foreground text-center">
                        Podrás reactivarla cuando quieras
                      </p>
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
                            ? new Date(birthdate as string).toLocaleDateString(
                                "es-ES",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )
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
                      <div className="text-muted-foreground text-xs capitalize">
                        {session?.user?.experienceLevel || "No especificado"}
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
                          <SelectValue placeholder="Seleccione su hora preferida" />
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
                          <SelectValue placeholder="Seleccione su actividad diaria" />
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
                        <SelectValue placeholder="Seleccione su objetivo" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="lose-weight">Perder peso</SelectItem>
                      <SelectItem value="maintain">Mantener peso</SelectItem>
                      <SelectItem value="gain-muscle">Ganar músculo</SelectItem>
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
                        <SelectValue placeholder="Seleccione su preferencia dietética" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="no-preference">
                        Sin preferencia específica
                      </SelectItem>
                      <SelectItem value="vegetarian">Vegetariano</SelectItem>
                      <SelectItem value="vegan">Vegano</SelectItem>
                      <SelectItem value="pescatarian">Pescetariano</SelectItem>
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
                    <div className="text-xs font-medium">Horario preferido</div>
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
                    <div className="text-xs font-medium">Actividad diaria</div>
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
                    <Badge variant="outline" className="text-xs">
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
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold tracking-heading">
              Tus intereses
            </CardTitle>
            <CardDescription>
              Selecciona los temas que te interesan para encontrar instructores
              y contenido relevante.
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
    </div>
  );
}
