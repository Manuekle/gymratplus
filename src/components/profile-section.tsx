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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Edit, Mail, MapPin, Phone, User, Calendar } from "lucide-react";
import { useState } from "react";

export default function ProfileSection() {
  const [isEditing, setIsEditing] = useState(false);

  const { data: session } = useSession();

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
                  <AvatarFallback className="text-2xl">JP</AvatarFallback>
                </Avatar>
              )}
            </div>

            <div className="space-y-4 flex-1 text-center md:text-left pt-2 md:pt-0">
              <div>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <h2 className="text-2xl font-bold">{session?.user?.name}</h2>
                  <div className="flex gap-2 justify-center md:justify-start">
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-50 text-xs"
                    >
                      Premium
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center text-muted-foreground text-xs">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>Bogota, Colombia</span>
                </div>
                <div className="flex items-center text-muted-foreground text-xs">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Se unió en Enero 2023</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center md:justify-end md:self-start pt-4 md:pt-0">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs"
                size="sm"
              >
                <Edit className="h-2 w-2 mr-2" />
                {isEditing ? "Guardar" : "Editar perfil"}
              </Button>
            </div>
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
                  <Input id="email" defaultValue="juan.perez@ejemplo.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" defaultValue="+34 612 345 678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency">Contacto de emergencia</Label>
                  <Input
                    id="emergency"
                    defaultValue="María Pérez - +34 698 765 432"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-[25px_1fr] gap-4 items-center">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">Email</div>
                    <div className="text-muted-foreground text-xs">
                      juan.perez@ejemplo.com
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-[25px_1fr] gap-4 items-center">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">Teléfono</div>
                    <div className="text-muted-foreground text-xs">
                      +34 612 345 678
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-[25px_1fr] gap-4 items-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">
                      Contacto de emergencia
                    </div>
                    <div className="text-muted-foreground text-xs">
                      María Pérez - +34 698 765 432
                    </div>
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
                  <div className="text-lg">Mañanas (6:00 - 9:00)</div>
                </div>
                <div>
                  <div className="text-sm font-medium">
                    Tipo de entrenamiento
                  </div>
                  <div className="text-lg">Hipertrofia</div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-sm font-medium mb-2">
                  Objetivos actuales
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>Aumentar fuerza</Badge>
                  <Badge>Definición muscular</Badge>
                  <Badge>Mejorar resistencia</Badge>
                  <Badge>Preparar maratón</Badge>
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-sm font-medium mb-2">
                  Lesiones o condiciones
                </div>
                <div className="text-muted-foreground">
                  Lesión de rodilla (2022) - Recuperado
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
