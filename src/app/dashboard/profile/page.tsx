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
import { useState } from "react";
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

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  // const { toast } = useToast();

  const { data: session } = useSession();
  console.log(session);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Crear objeto FormData
      const formData = new FormData();
      formData.append("file", file);

      // Subir imagen
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Error al subir la imagen. Inténtalo de nuevo.");
      }

      const { url } = await uploadResponse.json();

      // Actualizar el perfil con la nueva URL de la imagen
      const updateResponse = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: url }),
      });

      if (!updateResponse.ok) {
        throw new Error("No se pudo actualizar la imagen de perfil.");
      }

      // TODO: Actualizar el estado global o contexto en lugar de recargar la página
      // Por ejemplo: updateUserProfile({ image: url });

      toast.success("¡Imagen actualizada!", {
        description: "Tu foto de perfil ha sido actualizada correctamente.",
      });
      window.location.reload();
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
    (session?.user as { profile?: { phone?: string } })?.profile?.phone || ""
  );

  const [birthdate, setBirthdate] = useState<string>(
    (session?.user as { profile?: { birthdate?: string } })?.profile
      ?.birthdate || ""
  );

  const [experienceLevel, setExperienceLevel] = useState(
    session?.user?.experienceLevel || ""
  );

  const [preferredWorkoutTime, setPreferredWorkoutTime] = useState(
    (session?.user as { profile?: { preferredWorkoutTime?: string } })?.profile
      ?.preferredWorkoutTime || ""
  );
  const [dailyActivity, setDailyActivity] = useState(
    (session?.user as { profile?: { dailyActivity?: string } })?.profile
      ?.dailyActivity || ""
  );

  const [goal, setGoal] = useState(
    (session?.user as { profile?: { goal?: string } })?.profile?.goal || ""
  );

  const [dietaryPreference, setDietaryPreference] = useState(
    (session?.user as { profile?: { dietaryPreference?: string } })?.profile
      ?.dietaryPreference || ""
  );

  const handleSaveProfile = async () => {
    try {
      setIsUploading(true);
      // Get form values
      // const email =
      //   (document.getElementById("email") as HTMLInputElement)?.value || "";
      // const phone =
      //   (document.getElementById("phone") as HTMLInputElement)?.value || "";

      // const experienceLevel =
      //   document.querySelector("[data-value]")?.getAttribute("data-value") ||
      //   "";

      // Update profile

      // verficar que esten lleno si no alert con toast
      if (!name) {
        toast.error("Error", {
          description: "El nombre es requerido.",
        });
        return;
      }
      if (!phone) {
        toast.error("Error", {
          description: "El teléfono es requerido.",
        });
        return;
      }
      if (!experienceLevel) {
        toast.error("Error", {
          description: "La experiencia es requerida.",
        });
        return;
      }
      if (!birthdate) {
        toast.error("Error", {
          description: "La fecha de nacimiento es requerida.",
        });
        return;
      }
      if (!preferredWorkoutTime) {
        toast.error("Error", {
          description: "El horario preferido es requerido.",
        });
        return;
      }
      if (!dailyActivity) {
        toast.error("Error", {
          description: "La actividad diaria es requerida.",
        });
        return;
      }
      if (!goal) {
        toast.error("Error", {
          description: "El objetivo es requerido.",
        });
        return;
      }
      if (!dietaryPreference) {
        toast.error("Error", {
          description: "La preferencia dietética es requerida.",
        });
        return;
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // email,
          name,
          phone,
          experienceLevel,
          birthdate,
          preferredWorkoutTime,
          dailyActivity,
          goal,
          dietaryPreference,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setIsEditing(false);

      // Force refresh to show updated data
      // window.location.reload();

      toast.success("Perfil actualizado", {
        description: "Tu perfil ha sido actualizado correctamente.",
      });
      window.location.reload();
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
              {(session?.user?.image && (
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-background">
                    <AvatarImage
                      src={session?.user.image}
                      alt="Profile picture"
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
                      <span className="text-white font-medium tracking-tighter text-xs">
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
              )) || (
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-background">
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
                      <span className="text-white font-medium tracking-tighter text-xs">
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
              )}
            </div>

            <div className="space-y-4 flex-1 text-center md:text-left pt-2 md:pt-0">
              <div>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <h2 className="text-2xl font-bold tracking-tight">
                    {session?.user?.name}
                  </h2>
                  {/* <div className="flex gap-2 justify-center md:justify-start">
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-50 text-xs"
                    >
                      Premium
                    </Badge>
                  </div> */}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center text-muted-foreground text-xs">
                  <BirthdayCakeIcon className="h-4 w-4 mr-1" />
                  <span>
                    Cumple el{" "}
                    {(() => {
                      // Obtain the createdAt value
                      const birthdate = (
                        session?.user as { profile?: { birthdate?: string } }
                      )?.profile?.birthdate;
                      return birthdate
                        ? new Date(birthdate).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "long",
                          })
                        : "Fecha no disponible";
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
                  "Editar perfil"
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
            <CardTitle className="text-2xl font-bold tracking-tight">
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

                <BirthDatePicker
                  value={birthdate}
                  onValueChange={setBirthdate}
                />
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

                <div className="grid grid-cols-[25px_1fr] gap-4 items-center">
                  <StarIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">Experiencia</div>
                    <div className="text-muted-foreground text-xs capitalize">
                      {session?.user?.experienceLevel || "No especificado"}
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Preferencias de entrenamiento
            </CardTitle>
            <CardDescription className="text-xs">
              Información sobre tus preferencias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        className="text-xs md:text-sm"
                        htmlFor="preferredWorkoutTime"
                      >
                        Horario preferido
                      </Label>
                      <Select
                        value={preferredWorkoutTime}
                        onValueChange={(value) =>
                          setPreferredWorkoutTime(value)
                        }
                      >
                        <SelectTrigger className="text-xs md:text-sm">
                          <div className="flex flex-row items-center gap-4">
                            <Clock01Icon
                              size={18}
                              className="text-foreground"
                            />
                            <SelectValue placeholder="Seleccione su hora preferida" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            className="text-xs md:text-sm"
                            value="early-morning"
                          >
                            Temprano en la mañana (5-8 AM)
                          </SelectItem>
                          <SelectItem
                            className="text-xs md:text-sm"
                            value="morning"
                          >
                            Mañana (8-11 AM)
                          </SelectItem>
                          <SelectItem
                            className="text-xs md:text-sm"
                            value="noon"
                          >
                            Mediodía (11 AM-2 PM)
                          </SelectItem>
                          <SelectItem
                            className="text-xs md:text-sm"
                            value="afternoon"
                          >
                            Tarde (2-5 PM)
                          </SelectItem>
                          <SelectItem
                            className="text-xs md:text-sm"
                            value="evening"
                          >
                            Atardecer (5-8 PM)
                          </SelectItem>
                          <SelectItem
                            className="text-xs md:text-sm"
                            value="night"
                          >
                            Noche (8-11 PM)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label
                        className="text-xs md:text-sm"
                        htmlFor="dailyActivity"
                      >
                        Actividad diaria
                      </Label>
                      <Select
                        value={dailyActivity}
                        onValueChange={(value) => setDailyActivity(value)}
                      >
                        <SelectTrigger className="text-xs md:text-sm">
                          {/* <SelectValue placeholder="Select your daily activity" /> */}
                          <div className="flex flex-row items-center gap-4">
                            <WorkoutGymnasticsIcon
                              size={18}
                              className="text-foreground"
                            />
                            <SelectValue placeholder="Seleccione su actividad diaria" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            className="text-xs md:text-sm"
                            value="office-work"
                          >
                            Trabajo de oficina (sedentario)
                          </SelectItem>
                          <SelectItem
                            className="text-xs md:text-sm"
                            value="light-physical"
                          >
                            Trabajo físico ligero
                          </SelectItem>
                          <SelectItem
                            className="text-xs md:text-sm"
                            value="moderate-physical"
                          >
                            Trabajo físico moderado
                          </SelectItem>
                          <SelectItem
                            className="text-xs md:text-sm"
                            value="heavy-physical"
                          >
                            Trabajo físico pesado
                          </SelectItem>
                          <SelectItem
                            className="text-xs md:text-sm"
                            value="very-heavy-physical"
                          >
                            Trabajo físico muy pesado
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-xs md:text-sm" htmlFor="goal">
                      Objetivo actual
                    </Label>
                    <Select
                      value={goal}
                      onValueChange={(value) => setGoal(value)}
                    >
                      <SelectTrigger className="text-xs md:text-sm">
                        <div className="flex flex-row items-center gap-4">
                          <Target02Icon size={18} className="text-foreground" />
                          <SelectValue placeholder="Seleccione su objetivo" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          className="text-xs md:text-sm"
                          value="lose-weight"
                        >
                          Perder peso
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-sm"
                          value="maintain"
                        >
                          Mantener peso
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-sm"
                          value="gain-muscle"
                        >
                          Ganar músculo
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label
                      className="text-xs md:text-sm"
                      htmlFor="dietaryPreference"
                    >
                      Preferencia dietetica
                    </Label>
                    <Select
                      value={dietaryPreference}
                      onValueChange={(value) => setDietaryPreference(value)}
                    >
                      <SelectTrigger className="text-xs md:text-sm">
                        <div className="flex flex-row items-center gap-4">
                          <SteakIcon size={18} className="text-foreground" />
                          <SelectValue placeholder="Seleccione su preferencia dietética" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          className="text-xs md:text-sm"
                          value="no-preference"
                        >
                          Sin preferencia específica
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-sm"
                          value="vegetarian"
                        >
                          Vegetariano
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-sm"
                          value="vegan"
                        >
                          Vegano
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-sm"
                          value="pescatarian"
                        >
                          Pescetariano
                        </SelectItem>
                        <SelectItem className="text-xs md:text-sm" value="keto">
                          Keto
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-sm"
                          value="paleo"
                        >
                          Paleo
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-sm"
                          value="mediterranean"
                        >
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
                      <div className="text-sm font-medium">
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
                      <div className="text-sm font-medium">
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
                    <div className="text-sm font-medium mb-2">
                      Objetivo actual
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge>
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
                    <div className="text-muted-foreground text-xs">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
