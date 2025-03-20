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
  BirthdayCakeIcon,
  Calendar01Icon,
  Mail01Icon,
  SmartPhone01Icon,
  UserCircleIcon,
} from "hugeicons-react";

export default function ProfilePage() {
  const [isEditing] = useState(false);

  const { data: session } = useSession();
  console.log(session);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-0">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex flex-col items-center md:items-start">
              {session?.user?.image && (
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
              )}
            </div>

            <div className="space-y-4 flex-1 text-center md:text-left pt-2 md:pt-0">
              <div>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <h2 className="text-2xl font-bold">{session?.user?.name}</h2>
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
                {/* <div className="flex items-center text-muted-foreground text-xs">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span>Bogota, Colombia</span>
                </div> */}
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

            {/* <div className="flex justify-center md:justify-end md:self-start pt-4 md:pt-0">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs"
                size="sm"
              >
                {isEditing ? "Guardar" : "Editar perfil"}
              </Button>
            </div> */}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Información de contacto</CardTitle>
            <CardDescription className="text-xs">
              Datos de contacto y comunicación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    className="text-sm"
                    id="email"
                    defaultValue={session?.user?.email || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input className="text-sm" id="phone" defaultValue="" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency">Contacto de emergencia</Label>
                  <Input className="text-sm" id="emergency" defaultValue="" />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-[25px_1fr] gap-4 items-center">
                  <Mail01Icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">Email</div>
                    <div className="text-muted-foreground text-xs">
                      {session?.user?.email}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-[25px_1fr] gap-4 items-center">
                  <BirthdayCakeIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">
                      Fecha de cumpleaños
                    </div>
                    <div className="text-muted-foreground text-xs"></div>
                  </div>
                </div>

                <Separator />
                <div className="grid grid-cols-[25px_1fr] gap-4 items-center">
                  <SmartPhone01Icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">Teléfono</div>
                    <div className="text-muted-foreground text-xs"></div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-[25px_1fr] gap-4 items-center">
                  <UserCircleIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">
                      Contacto de emergencia
                    </div>
                    <div className="text-muted-foreground text-xs"></div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Preferencias de entrenamiento</CardTitle>
            <CardDescription className="text-xs">
              Información sobre tus preferencias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Horario preferido</div>
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
                  <div className="text-sm font-medium">Actividad diaria</div>
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
                <div className="text-sm font-medium mb-2">Objetivo actual</div>
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
                          return "Bajar de peso";
                        case "maintain":
                          return "Mantener peso";
                        case "gain-muscle":
                          return "Aumentar peso";
                        default:
                          return "No especificado";
                      }
                    })()}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-sm font-medium">Preferencia dietetica</div>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
