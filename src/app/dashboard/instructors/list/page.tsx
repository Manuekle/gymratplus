"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  MapPin,
  DollarSign,
  GraduationCap,
  Users,
  Calendar,
  Globe,
} from "lucide-react";
import Image from "next/image";

interface InstructorData {
  id: string;
  userId: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  curriculum: string | null;
  pricePerMonth: number | null;
  contactEmail: string | null;
  contactPhone: string | null;
  country: string | null;
  city: string | null;
  isRemote: boolean | null;
  status: string;
  startDate: Date;
}

export default function MyInstructorsPage() {
  const [instructors, setInstructors] = useState<InstructorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [countryFlags, setCountryFlags] = useState<Record<string, string>>({});

  const fetchInstructors = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/students/my-instructors");
      if (!response.ok) {
        throw new Error("Error al cargar tus instructores.");
      }
      const data: InstructorData[] = await response.json();
      setInstructors(data);

      // Obtener banderas de los países únicos
      const uniqueCountries = Array.from(
        new Set(data.map((i) => i.country).filter(Boolean)),
      ) as string[];

      if (uniqueCountries.length > 0) {
        const flags: Record<string, string> = {};
        for (const c of uniqueCountries) {
          try {
            const flagResponse = await fetch(
              `https://restcountries.com/v3.1/alpha/${c}`,
            );
            if (flagResponse.ok) {
              const countryData = await flagResponse.json();
              if (
                countryData &&
                countryData.length > 0 &&
                countryData[0].flags?.svg
              ) {
                flags[c] = countryData[0].flags.svg;
              }
            }
          } catch (flagError) {
            console.error(`Error fetching flag for ${c}:`, flagError);
          }
        }
        setCountryFlags(flags);
      }
    } catch (error: unknown) {
      let errorMessage = "Hubo un error al cargar tus instructores.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
      console.error("Error fetching my instructors:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Instructores
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sont-semibold">{instructors.length}</div>
            <p className="text-xs text-muted-foreground">
              {instructors.filter((i) => i.status === "active").length} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modalidades</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sont-semibold">
              {instructors.filter((i) => i.isRemote).length}
            </div>
            <p className="text-xs text-muted-foreground">
              instructores remotos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inversión Mensual
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sont-semibold">
              ${instructors.reduce((sum, i) => sum + (i.pricePerMonth || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">total por mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Instructors Grid */}
      {instructors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <h3 className="text-sm font-medium mb-2">
              No tienes instructores asignados
            </h3>
            <p className="text-muted-foreground text-xs max-w-md mb-6">
              Cuando te asignen instructores o solicites uno, aparecerán aquí
              para que puedas gestionar tu entrenamiento y mantenerte en
              contacto.
            </p>
            <Button variant="outline">Buscar Instructores</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {instructors.map((instructor) => (
            <Card
              key={instructor.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                    <AvatarImage
                      src={instructor.image || "/placeholder-avatar.jpg"}
                      alt={instructor.name || "Instructor"}
                    />
                    <AvatarFallback className="text-lg font-semibold">
                      {instructor.name?.charAt(0).toUpperCase() || "I"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div>
                      <CardTitle className="text-lg leading-tight">
                        {instructor.name || "Sin nombre"}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3" />
                        {instructor.city && instructor.country ? (
                          <span className="flex items-center gap-1">
                            {instructor.city}, {instructor.country}
                            {instructor.country &&
                              countryFlags[instructor.country] && (
                                <Image
                                  src={
                                    countryFlags[instructor.country] ||
                                    "/placeholder.svg"
                                  }
                                  alt={`Bandera de ${instructor.country}`}
                                  width={48}
                                  height={48}
                                  className="w-4 h-3 object-cover rounded-sm shadow-sm"
                                />
                              )}
                          </span>
                        ) : (
                          "Ubicación no especificada"
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {instructor.isRemote && (
                        <Badge variant="secondary" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          Remoto
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {instructor.status === "active" ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Bio */}
                {instructor.bio && (
                  <div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {instructor.bio}
                    </p>
                  </div>
                )}

                {/* Price and Specialties */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Precio acordado</span>
                    <span className="text-sm font-semibold">
                      {instructor.pricePerMonth
                        ? `$${instructor.pricePerMonth}/mes`
                        : "No especificado"}
                    </span>
                  </div>

                  {instructor.curriculum && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Especialidades
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
                        {instructor.curriculum}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Desde {formatDate(instructor.startDate)}</span>
                  </div>
                </div>

                <Separator />

                {/* Contact Information */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Contacto</h4>
                  <div className="space-y-2">
                    {instructor.contactEmail ? (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`mailto:${instructor.contactEmail}`}
                          className="text-sm hover:underline text-blue-600 dark:text-blue-400"
                        >
                          {instructor.contactEmail}
                        </a>
                      </div>
                    ) : null}

                    {instructor.contactPhone ? (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`tel:${instructor.contactPhone}`}
                          className="text-sm hover:underline text-blue-600 dark:text-blue-400"
                        >
                          {instructor.contactPhone}
                        </a>
                      </div>
                    ) : null}

                    {!instructor.contactEmail && !instructor.contactPhone && (
                      <p className="text-xs text-muted-foreground">
                        Información de contacto no disponible
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {instructor.contactEmail && (
                    <Button size="sm" className="flex-1" asChild>
                      <a href={`mailto:${instructor.contactEmail}`}>
                        <Mail className="h-4 w-4 mr-1" />
                        Contactar
                      </a>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-transparent"
                  >
                    Ver Perfil
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
