"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BirthdayCakeIcon,
  Calendar01Icon,
  Clock01Icon,
  KidIcon,
  Mail01Icon,
  SmartPhone01Icon,
  SmileIcon,
  StarIcon,
  SteakIcon,
  Target02Icon,
  WorkoutGymnasticsIcon,
} from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Icons } from "@/components/icons";
import { BirthDatePicker } from "@/components/ui/birth-date-picker";
import { InstructorRegistrationForm } from "@/components/instructor/InstructorRegistrationForm";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, Star, Users, DollarSign } from "lucide-react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isInstructorMode, setIsInstructorMode] = useState(false);

  const { data: session, update } = useSession();
  const isInstructor = !!session?.user?.isInstructor;
  console.log(session);

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    if (session?.user?._localStorage) {
      const storedData = session.user._localStorage;
      setName(storedData.name || "");
      setPhone(storedData.profile?.phone || "");
      setBirthdate(storedData.profile?.birthdate?.toString() || "");
      setExperienceLevel(storedData.experienceLevel || "");
      setPreferredWorkoutTime(storedData.profile?.preferredWorkoutTime || "");
      setDailyActivity(storedData.profile?.dailyActivity || "");
      setGoal(storedData.profile?.goal || "");
      setDietaryPreference(storedData.profile?.dietaryPreference || "");
      setMonthsTraining(storedData.profile?.monthsTraining || 0);
    }
  }, [session]);

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

      // Actualizar la sesión con la nueva imagen
      const updatedSession = {
        ...session,
        user: {
          ...session?.user,
          image: url,
          _localStorage: {
            ...session?.user?._localStorage,
            image: url,
          },
        },
      };

      // Actualizar la sesión
      await update(updatedSession);

      // Forzar actualización de la sesión
      const sessionResponse = await fetch("/api/auth/session", {
        method: "GET",
      });

      if (!sessionResponse.ok) {
        throw new Error("Error al actualizar la sesión");
      }

      // Mostrar mensaje de éxito
      toast.success("¡Imagen actualizada!", {
        description: "Tu foto de perfil ha sido actualizada correctamente.",
      });

      // Forzar recarga de la página después de un pequeño retraso
      // setTimeout(() => {
      //   window.location.reload();
      // }, 1000);
      setIsEditing(false);
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Algo salió mal.",
      });
    } finally {
      setIsUploading(false);
    }
  };

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

      // Forzar actualización de la sesión
      await fetch("/api/auth/session", {
        method: "GET",
      });

      // Cerrar el modo de edición
      setIsEditing(false);

      // Forzar recarga de la página
      // window.location.reload();

      toast.success("Perfil actualizado", {
        description: "Tu perfil ha sido actualizado correctamente.",
      });

      // isEditing
      // setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error", {
        description: "No se pudo actualizar el perfil.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-0">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex flex-col items-center md:items-start relative">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-background">
                  <AvatarImage
                    src={session?.user?.image || undefined}
                    alt="Profile picture"
                    key={session?.user?.image || Date.now()}
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
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
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
              </div>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center text-muted-foreground text-xs">
                  <KidIcon className="h-4 w-4 mr-1" />
                  {/* <div className="mr-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width={16}
                      height={16}
                      color="currentColor"
                      fill={"none"}
                    >
                      <path
                        d="M19.9504 10.8961C19.5049 14.8926 16.1153 18 12 18C7.88465 18 4.49508 14.8926 4.04963 10.8961C3.87943 10.9632 3.69402 11 3.5 11C2.67157 11 2 10.3284 2 9.5C2 8.67157 2.67157 8 3.5 8C3.75626 8 3.99751 8.06426 4.20851 8.17754C5.03332 4.63736 8.20867 2 12 2C15.7913 2 18.9667 4.63736 19.7915 8.17755C20.0025 8.06426 20.2437 8 20.5 8C21.3284 8 22 8.67157 22 9.5C22 10.3284 21.3284 11 20.5 11C20.306 11 20.1206 10.9632 19.9504 10.8961Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 15C12.5523 15 13 14.5523 13 14H11C11 14.5523 11.4477 15 12 15Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18 22C18 20.208 17.2144 18.5994 15.9687 17.5M6 22C6 20.208 6.78563 18.5994 8.03126 17.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M12 2C13 2 14 2.89543 14 4C14 5.10457 13 6 12 6C11.5 6 10.9246 5.81669 10.5 5.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M9 10V10.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M15 10V10.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div> */}
                  <span>
                    {(() => {
                      const birthdate = (
                        session?.user as { profile?: { birthdate?: string } }
                      )?.profile?.birthdate;
                      if (!birthdate) return "Edad no disponible";

                      const today = new Date();
                      const birthDate = new Date(birthdate);
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
                  <Calendar01Icon className="h-4 w-4 mr-1" />
                  <span>
                    Se unió en{" "}
                    {(() => {
                      // Obtain the createdAt value
                      const createdAt = (
                        session?.user as { profile?: { createdAt?: string } }
                      )?.profile?.createdAt;
                      return createdAt
                        ? new Date(createdAt).toLocaleDateString("es-ES", {
                            month: "long",
                            year: "numeric",
                          })
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
            <CardTitle className="text-2xl font-semibold  tracking-heading">
              Información de contacto
            </CardTitle>
            <CardDescription className="text-xs">
              Datos de contacto y comunicación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 items-center md:gap-8 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs md:text-sm" htmlFor="email">
                      Correo electronico
                    </Label>
                    <Input
                      disabled
                      className="text-xs md:text-sm"
                      id="email"
                      // onChange={(e) => setEmail(e.target.value)}
                      defaultValue={session?.user?.email || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs md:text-sm" htmlFor="name">
                      Nombre
                    </Label>
                    <Input
                      // disabled
                      className="text-xs md:text-sm"
                      id="name"
                      onChange={(e) => setName(e.target.value)}
                      defaultValue={session?.user?.name || ""}
                    />
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 items-center md:gap-8 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs md:text-sm" htmlFor="phone">
                      Teléfono
                    </Label>
                    <Input
                      className="text-xs md:text-sm"
                      id="phone"
                      defaultValue={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs md:text-sm" htmlFor="experience">
                      Experiencia
                    </Label>
                    <Select
                      defaultValue={session?.user?.experienceLevel}
                      value={experienceLevel}
                      onValueChange={(value) => setExperienceLevel(value)}
                    >
                      <SelectTrigger className="text-xs md:text-sm">
                        <SelectValue placeholder="Selecciona tu experiencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          className="text-xs md:text-sm"
                          value="principiante"
                        >
                          <div className="flex items-center">Principiante</div>
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-sm"
                          value="intermedio"
                        >
                          <div className="flex items-center">Intermedio</div>
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-sm"
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
                  <div className="space-y-2">
                    <Label
                      className="text-xs md:text-sm"
                      htmlFor="monthsTraining"
                    >
                      Meses entrenando
                    </Label>
                    <Input
                      className="text-xs md:text-sm"
                      id="monthsTraining"
                      type="number"
                      min={0}
                      value={monthsTraining}
                      onChange={(e) =>
                        setMonthsTraining(Number(e.target.value))
                      }
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="grid grid-cols-[25px_1fr] gap-4 items-center">
                    <Mail01Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">
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
                    <BirthdayCakeIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">
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
                            ? new Date(birthdate).toLocaleDateString("es-ES", {
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
                    <SmileIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">Nombre</div>
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
                    <SmartPhone01Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">Teléfono</div>
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
                    <StarIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">Experiencia</div>
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
                    <StarIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">
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
            <CardDescription className="text-sm text-muted-foreground">
              Información sobre tus preferencias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                          <Clock01Icon
                            size={18}
                            className="text-muted-foreground"
                          />
                          <SelectValue placeholder="Seleccione su hora preferida" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="text-sm">
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
                          <WorkoutGymnasticsIcon
                            size={18}
                            className="text-muted-foreground"
                          />
                          <SelectValue placeholder="Seleccione su actividad diaria" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="text-sm">
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
                        <Target02Icon
                          size={18}
                          className="text-muted-foreground"
                        />
                        <SelectValue placeholder="Seleccione su objetivo" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="text-sm">
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
                        <SteakIcon
                          size={18}
                          className="text-muted-foreground"
                        />
                        <SelectValue placeholder="Seleccione su preferencia dietética" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="text-sm">
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
                    <div className="text-sm font-medium">Horario preferido</div>
                    <div className="text-sm text-muted-foreground">
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
                    <div className="text-sm font-medium">Actividad diaria</div>
                    <div className="text-sm text-muted-foreground">
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
                  <div className="text-sm font-medium mb-2">
                    Objetivo actual
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-sm">
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
                  <div className="text-sm font-medium">
                    Preferencia dietetica
                  </div>
                  <div className="text-sm text-muted-foreground">
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

      {/* Nueva sección para el rol de instructor */}
      {!isInstructor && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-semibold tracking-heading">
              Rol de instructor
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Activa tu rol de instructor y empieza a conectar con alumnos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Beneficios visuales */}
            <div className="space-y-4 mb-8">
              <ul className="space-y-2">
                {[
                  {
                    icon: CheckCircle2,
                    text: "Gana dinero compartiendo tu experiencia",
                  },
                  {
                    icon: Users,
                    text: "Accede a una comunidad de alumnos motivados",
                  },
                  {
                    icon: Star,
                    text: "Mejora tu reputación y recibe valoraciones",
                  },
                  {
                    icon: DollarSign,
                    text: "Gestiona tus precios y disponibilidad",
                  },
                ].map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <benefit.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium">{benefit.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <Switch
                checked={isInstructorMode}
                onCheckedChange={setIsInstructorMode}
                id="instructor-switch"
                className="data-[state=checked]:bg-primary"
              />
              <label
                htmlFor="instructor-switch"
                className="text-sm font-medium select-none cursor-pointer flex-1"
              >
                ¿Quieres convertirte en instructor?
              </label>
            </div>

            {/* Formulario solo si el switch está activado */}
            {isInstructorMode && <InstructorRegistrationForm />}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
