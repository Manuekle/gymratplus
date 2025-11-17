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
import { toast } from "sonner";

import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { GlobeIcon, MapPinIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { StartChatButton } from "@/components/chats/start-chat-button";
import { useCountries } from "@/hooks/use-countries";

interface InstructorData {
  id: string;
  studentInstructorId?: string; // ID de la relación para crear chats
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

export default function InstructorPage() {
  const [instructors, setInstructors] = useState<InstructorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { countries } = useCountries();

  const fetchInstructors = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/students/my-instructors");
      if (!response.ok) {
        throw new Error("Error al cargar tus instructores.");
      }
      const data: InstructorData[] = await response.json();
      setInstructors(data);
    } catch (error: unknown) {
      let errorMessage = "Hubo un error al cargar tus instructores.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-40" />
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
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl tracking-heading font-semibold">
            Mis Instructores
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {instructors.length} instructor
            {instructors.length !== 1 ? "es" : ""} asignado
            {instructors.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/dashboard/instructors/search">Buscar Instructores</Link>
        </Button>
      </div>
      {/* Instructors Grid */}
      {instructors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <h3 className="text-xs font-medium mb-2 max-w-md mx-auto">
            No tienes instructores asignados
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Cuando te asignen instructores o solicites uno, aparecerán aquí para
            que puedas gestionar tu entrenamiento y mantenerte en contacto.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {instructors.map((instructor) => (
            <Card
              key={instructor.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16 border border-background shadow-sm">
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
                      <CardTitle className="text-2xl font-semibold tracking-heading">
                        {instructor.name || "Sin nombre"}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground text-xs flex items-center gap-2 mt-1">
                        <HugeiconsIcon icon={MapPinIcon} className="h-3 w-3" />
                        {instructor.city || instructor.country ? (
                          <span className="flex items-center gap-1.5">
                            {(() => {
                              // El país se guarda como código cca2 (ej: "US", "MX", "ES")
                              const countryData = countries.find(
                                (c) => c.cca2 === instructor.country,
                              );

                              return countryData ? (
                                <span className="flex items-center gap-1">
                                  <Image
                                    src={
                                      countryData.flags.svg ||
                                      "/placeholder.svg"
                                    }
                                    alt={countryData.name.common}
                                    width={14}
                                    height={10}
                                    className="w-3.5 h-2.5 object-cover rounded-sm"
                                  />
                                  <span>
                                    {instructor.city
                                      ? `${instructor.city}, `
                                      : ""}
                                    {countryData.name.common}
                                  </span>
                                </span>
                              ) : (
                                <span>
                                  {instructor.city
                                    ? `${instructor.city}${instructor.country ? ", " : ""}`
                                    : ""}
                                  {instructor.country || ""}
                                </span>
                              );
                            })()}
                          </span>
                        ) : (
                          "Ubicación no especificada"
                        )}
                      </CardDescription>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {instructor.isRemote && (
                        <Badge variant="secondary" className="text-xs">
                          <HugeiconsIcon
                            icon={GlobeIcon}
                            className="h-3 w-3 mr-1"
                          />
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

              <CardContent className="px-4 space-y-4">
                {/* Bio */}
                {instructor.bio && (
                  <div>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {instructor.bio}
                    </p>
                  </div>
                )}

                {/* Price */}
                {instructor.pricePerMonth && (
                  <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <span className="text-xs font-medium">Precio acordado</span>
                    <span className="text-xs font-semibold">
                      ${instructor.pricePerMonth}/mes
                    </span>
                  </div>
                )}

                {/* Specialties */}
                {instructor.curriculum && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground mb-2 block">
                      Especialidades
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {instructor.curriculum
                        .split(",")
                        .map((item) => item.trim())
                        .filter((item) => item)
                        .slice(0, 3)
                        .map((specialty, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      {instructor.curriculum
                        .split(",")
                        .filter((item) => item.trim()).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +
                          {instructor.curriculum
                            .split(",")
                            .filter((item) => item.trim()).length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/dashboard/instructors/${instructor.userId}`}>
                      Ver Perfil
                    </Link>
                  </Button>
                  {instructor.studentInstructorId && (
                    <div className="flex justify-start mb-2">
                      <StartChatButton
                        studentInstructorId={instructor.studentInstructorId}
                        size="sm"
                        variant="outline"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
