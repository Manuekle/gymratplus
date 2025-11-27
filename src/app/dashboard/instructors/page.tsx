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
import {
  GlobeIcon,
  MapPinIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { StartChatButton } from "@/components/chats/start-chat-button";
import { useCountries } from "@/hooks/use-countries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [instructorToCancel, setInstructorToCancel] =
    useState<InstructorData | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
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

  const handleCancelInstructor = async () => {
    if (!instructorToCancel?.studentInstructorId) return;

    setIsCancelling(true);
    try {
      const response = await fetch(
        `/api/students/cancel-instructor/${instructorToCancel.studentInstructorId}`,
        {
          method: "PUT",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cancelar la relación");
      }

      toast.success("Relación cancelada", {
        description:
          "La relación con el instructor ha sido cancelada. Los planes asignados por el instructor han sido eliminados.",
      });

      setCancelDialogOpen(false);
      setInstructorToCancel(null);
      fetchInstructors(); // Recargar la lista
    } catch (error: unknown) {
      let errorMessage = "Hubo un error al cancelar la relación.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

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
        <Button size="default" asChild>
          <Link href="/dashboard/instructors/search">Buscar Instructores</Link>
        </Button>
      </div>
      {/* Instructors Grid */}
      {instructors.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] py-12 px-4 text-center">
          <h3 className="text-xs font-medium mb-3 max-w-md mx-auto">
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
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex gap-2">
                    <Button
                      size="default"
                      variant="outline"
                      className="flex-1"
                      asChild
                    >
                      <Link
                        href={`/dashboard/instructors/${instructor.userId}`}
                      >
                        Ver Perfil
                      </Link>
                    </Button>
                    {instructor.studentInstructorId && (
                      <StartChatButton
                        studentInstructorId={instructor.studentInstructorId}
                        size="default"
                        variant="outline"
                      />
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      setInstructorToCancel(instructor);
                      setCancelDialogOpen(true);
                    }}
                  >
                    Cancelar Relación
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de confirmación para cancelar relación */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-heading">
              ¿Cancelar relación con instructor?
            </DialogTitle>
            <DialogDescription className="text-xs">
              Esta acción cancelará tu relación con{" "}
              <span className="font-semibold">
                {instructorToCancel?.name || "este instructor"}
              </span>
              . Los planes de alimentación y rutinas asignados por el instructor
              serán eliminados, pero tus planes propios se mantendrán.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              size="default"
              variant="outline"
              onClick={() => {
                setCancelDialogOpen(false);
                setInstructorToCancel(null);
              }}
              disabled={isCancelling}
            >
              Cancelar
            </Button>
            <Button
              size="default"
              variant="destructive"
              onClick={handleCancelInstructor}
              disabled={isCancelling}
            >
              {isCancelling ? "Procesando..." : "Sí, cancelar relación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
