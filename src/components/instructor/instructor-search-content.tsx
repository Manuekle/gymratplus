"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import type { InstructorProfile, User } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CountrySelector } from "@/components/shared/country-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCountries } from "@/hooks/use-countries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SPECIALTIES } from "@/data/specialties";
import Image from "next/image";
import Link from "next/link";

interface InstructorWithProfile extends User {
  instructorProfile: InstructorProfile | null;
}

// **EL COMPONENTE HA SIDO RENOMBRADO A InstructorSearchContent**
export default function InstructorSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // **MODIFICACIÓN CLAVE:** Inicializar el estado `isRemote` dentro de `useEffect` o
  // de forma perezosa (lazy) si es necesario, pero la forma más limpia es
  // utilizar `useEffect` o inicializarlo en un valor por defecto (como false)
  // y actualizarlo con `useEffect` después de la hidratación.
  const [country, setCountry] = useState<string>("");
  const [isRemote, setIsRemote] = useState(false); // **Valor inicial por defecto**
  const [maxPrice, setMaxPrice] = useState("");
  const [instructors, setInstructors] = useState<InstructorWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requestingInstructorId, setRequestingInstructorId] = useState<
    string | null
  >(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [requestedInstructors, setRequestedInstructors] = useState<Set<string>>(
    new Set(),
  );

  const { countries } = useCountries();

  // **NUEVO useEffect para inicializar los estados desde searchParams**
  useEffect(() => {
    // Esto se ejecuta SOLAMENTE en el cliente, después de la hidratación
    if (searchParams) {
      setCountry(searchParams.get("country") || "");
      setIsRemote(searchParams.get("isRemote") === "true");
      setMaxPrice(searchParams.get("maxPrice") || "");
      setSelectedSpecialties(searchParams.get("tagFilter")?.split(",") || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadExistingRequests = useCallback(async () => {
    try {
      const [requestsResponse, hiredResponse] = await Promise.all([
        fetch("/api/student-instructor-requests"),
        fetch("/api/students/my-instructors"),
      ]);

      if (requestsResponse.ok) {
        const requests = await requestsResponse.json();
        // Incluir todas las solicitudes (pending, active, etc.)
        const requestIds = requests.map(
          (req: { instructorProfileId: string }) => req.instructorProfileId,
        );
        setRequestedInstructors(new Set(requestIds));
      }

      if (hiredResponse.ok) {
        const hiredInstructors = await hiredResponse.json();
        // Agregar también los instructores ya contratados
        // El campo 'id' en la respuesta es el instructorProfileId
        const hiredIds = hiredInstructors
          .map((inst: { id?: string }) => inst.id)
          .filter(Boolean);
        setRequestedInstructors((prev) => {
          const newSet = new Set(prev);
          hiredIds.forEach((id: string) => newSet.add(id));
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error loading existing requests:", error);
    }
  }, []);

  useEffect(() => {
    loadExistingRequests();
  }, [loadExistingRequests]);

  // Ejecutar búsqueda después de cargar las solicitudes y cuando cambien los filtros
  useEffect(() => {
    // Esperar a que se carguen las solicitudes antes de buscar
    if (requestedInstructors.size >= 0) {
      fetchInstructors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, isRemote, maxPrice, selectedSpecialties, requestedInstructors]);

  const fetchInstructors = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (country) params.append("country", country);
      if (isRemote) params.append("isRemote", "true");
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (selectedSpecialties.length > 0)
        params.set("tagFilter", selectedSpecialties.join(","));

      const response = await fetch(`/api/instructors?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Error al obtener instructores.");
      }
      const data: InstructorWithProfile[] = await response.json();

      // Filtrar instructores que ya tienen solicitud enviada o están contratados
      const filteredData = data.filter((instructor) => {
        const profileId = instructor.instructorProfile?.id;
        return profileId && !requestedInstructors.has(profileId);
      });

      setInstructors(filteredData);
    } catch (error: unknown) {
      let errorMessage = "Hubo un error al cargar los instructores.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
      console.error("Error fetching instructors:", error);
    } finally {
      setIsLoading(false);
    }
  }, [country, isRemote, maxPrice, selectedSpecialties, requestedInstructors]);

  // **MODIFICACIÓN CLAVE 2:** Eliminamos el `useEffect` anterior que llamaba a `fetchInstructors()`
  // y ahora lo llamamos solo en `handleSearch` y en el `useEffect` de inicialización de `searchParams`.
  // Si necesitas que se ejecute en cada cambio de filtro, descomenta la siguiente línea,
  // pero la llamada en `handleSearch` es más controlada.

  // useEffect(() => {
  //   fetchInstructors();
  // }, [fetchInstructors]);

  const handleSearch = () => {
    // ... (código sin cambios, solo para forzar la navegación y la recarga)
    const params = new URLSearchParams();
    if (country) params.set("country", country);
    if (isRemote) params.set("isRemote", "true");
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (selectedSpecialties.length > 0)
      params.set("tagFilter", selectedSpecialties.join(","));
    router.push(`?${params.toString()}`);
    fetchInstructors(); // Llama a la búsqueda con los nuevos estados.
  };

  const handleRequestInstructor = useCallback(
    // ... (código sin cambios)
    async (instructorProfileId?: string) => {
      if (!instructorProfileId) {
        toast.error("Error", {
          description:
            "ID de instructor no disponible. Por favor, intenta de nuevo.",
        });
        return;
      }

      if (
        requestedInstructors.size > 0 &&
        !requestedInstructors.has(instructorProfileId)
      ) {
        toast.error("Ya tienes una solicitud pendiente", {
          description:
            "Debes cancelar tu solicitud actual antes de solicitar otro instructor.",
        });
        return;
      }

      setRequestingInstructorId(instructorProfileId);

      try {
        const response = await fetch("/api/student-instructor-requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ instructorProfileId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al enviar la solicitud.");
        }

        setRequestedInstructors((prev) =>
          new Set(prev).add(instructorProfileId),
        );

        toast.success("Solicitud enviada", {
          description:
            "Tu solicitud ha sido enviada al instructor. ¡Pronto se pondrá en contacto contigo!",
        });
      } catch (error: unknown) {
        let errorMessage = "Hubo un error al procesar tu solicitud.";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }
        toast.error(errorMessage);
        console.error("Error requesting instructor:", error);
      } finally {
        setRequestingInstructorId(null);
      }
    },
    [requestedInstructors],
  );

  const handleSpecialtyToggle = (spec: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec],
    );
  };

  return (
    // ... (El resto del código JSX es idéntico al original)
    <div>
      <Card className="mb-6">
        {/* ... CardHeader, CardContent, y todo el contenido de búsqueda */}
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl tracking-heading font-semibold">
            Opciones de Búsqueda
          </CardTitle>
          <CardDescription className="text-xs">
            Encuentra al entrenador ideal para ti.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div className="space-y-1.5 col-span-3 md:col-span-2 lg:col-span-1 md:pb-0 pb-1">
            <CountrySelector
              value={country}
              onValueChange={(value) => setCountry(value)}
              placeholder="Selecciona un país"
              label="País"
              className="text-xs"
            />
          </div>
          <div className="space-y-1.5 col-span-3 md:col-span-2 lg:col-span-1">
            <Label htmlFor="maxPrice" className="text-xs">
              Precio máximo (USD/mes)
            </Label>
            <Input
              id="maxPrice"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              min={0}
              placeholder="Ej: 100"
              value={maxPrice}
              className="text-xs"
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <div className="flex flex-row flex-wrap gap-3 items-center md:col-span-3">
            <div className="flex items-center gap-1.5">
              <Switch
                id="isRemote"
                checked={isRemote}
                onCheckedChange={setIsRemote}
              />
              <Label htmlFor="isRemote" className="text-xs">
                Remoto
              </Label>
            </div>
          </div>
          <div className="space-y-1.5 col-span-3">
            <Label className="text-xs">Especialidad / Metodología</Label>
            <div className="relative w-full">
              <div className="border rounded-md p-2 max-h-32 overflow-y-auto bg-muted/30 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex flex-wrap gap-1.5">
                  {SPECIALTIES.map((spec) => (
                    <Badge
                      key={spec.id}
                      variant={
                        selectedSpecialties.includes(spec.id)
                          ? "default"
                          : "secondary"
                      }
                      className={`px-2.5 py-1 text-[10px] transition-all cursor-pointer flex-shrink-0 rounded-full ${
                        selectedSpecialties.includes(spec.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-background border border-input hover:bg-accent"
                      }`}
                      onClick={() => handleSpecialtyToggle(spec.id)}
                    >
                      {spec.name}
                    </Badge>
                  ))}
                </div>
              </div>
              {selectedSpecialties.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-muted-foreground">
                    Seleccionadas ({selectedSpecialties.length}):
                  </span>
                  {selectedSpecialties.map((specId) => {
                    const spec = SPECIALTIES.find((s) => s.id === specId);
                    return spec ? (
                      <Badge
                        key={specId}
                        variant="default"
                        className="px-2.5 py-0.5 text-[10px] bg-primary text-primary-foreground rounded-full"
                      >
                        {spec.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-3">
            <Button onClick={handleSearch} className="w-full h-9 text-xs">
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl tracking-heading font-semibold mb-3">
        Resultados ({instructors.length})
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden flex flex-col h-full">
              <CardHeader className="flex flex-row items-start space-x-3 pb-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </CardHeader>
              <CardContent className="flex-1 px-4 py-2 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <div className="flex gap-1.5 pt-1">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-3 flex flex-col gap-1">
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {instructors.length === 0 ? (
            <p className="text-muted-foreground md:col-span-3 text-xs">
              No se encontraron entrenadores con los criterios de búsqueda.
            </p>
          ) : (
            instructors.map((instructor) => {
              const countryData = countries.find(
                (c) => c.cca2 === instructor.instructorProfile?.country,
              );
              return (
                <Card
                  key={instructor.id}
                  className="overflow-hidden flex flex-col h-full"
                >
                  <CardHeader className="flex flex-row items-start space-x-3 pb-2">
                    <Avatar className="h-12 w-12 mt-0.5">
                      <AvatarImage
                        src={instructor.image || ""}
                        alt={instructor.name || "Entrenador"}
                      />
                      <AvatarFallback className="text-xs">
                        {instructor.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <CardTitle className="text-xs leading-tight">
                        {instructor.name}
                      </CardTitle>
                      {(instructor.instructorProfile?.city ||
                        countryData?.name?.common) && (
                        <div className="flex items-center text-[10px] text-muted-foreground gap-1.5 flex-wrap">
                          {countryData && (
                            <span className="flex items-center gap-1">
                              <Image
                                src={
                                  countryData.flags.svg || "/placeholder.svg"
                                }
                                alt={countryData.name.common}
                                width={14}
                                height={10}
                                className="w-3.5 h-2.5 object-cover rounded-sm"
                              />
                              <span className="truncate">
                                {countryData.name.common}
                              </span>
                            </span>
                          )}
                          {instructor.instructorProfile?.isRemote && (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1 py-0 h-4"
                            >
                              Remoto
                            </Badge>
                          )}
                        </div>
                      )}
                      {instructor.instructorProfile?.pricePerMonth && (
                        <div className="text-xs font-semibold">
                          $
                          {instructor.instructorProfile.pricePerMonth.toFixed(
                            2,
                          )}
                          /mes
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 px-4 py-2 space-y-2">
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {instructor.instructorProfile?.bio ||
                        "Entrenador certificado con experiencia en entrenamiento personalizado."}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {instructor.instructorProfile?.curriculum ? (
                        instructor.instructorProfile.curriculum
                          .split(",")
                          .slice(0, 4)
                          .map((tag, idx) => (
                            <Badge
                              key={`${tag}-${idx}`}
                              variant="outline"
                              className="text-[9px] px-1.5 py-0"
                            >
                              {tag.trim()}
                            </Badge>
                          ))
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          Sin especialidades
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 pb-3 flex flex-col gap-1">
                    {(() => {
                      const profile = instructor.instructorProfile;
                      if (profile && profile.id) {
                        return (
                          <div className="w-full space-y-1">
                            <div className="flex flex-row gap-1.5">
                              <Button
                                size="sm"
                                className={`text-[11px] h-8 flex-1 ${
                                  requestedInstructors.has(profile.id)
                                    ? "bg-red-600 hover:bg-red-700"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleRequestInstructor(profile.id)
                                }
                                disabled={
                                  requestingInstructorId === profile.id ||
                                  (requestedInstructors.size > 0 &&
                                    !requestedInstructors.has(profile.id))
                                }
                              >
                                {requestingInstructorId === profile.id ? (
                                  <span>Enviando...</span>
                                ) : requestedInstructors.has(profile.id) ? (
                                  <span className="text-white">
                                    Solicitud Enviada
                                  </span>
                                ) : (
                                  "Solicitar"
                                )}
                              </Button>
                              <Button
                                asChild
                                size="sm"
                                className="text-[11px] bg-transparent"
                                variant="outline"
                              >
                                <Link
                                  href={`/dashboard/instructors/${instructor.id}`}
                                >
                                  Ver perfil
                                </Link>
                              </Button>
                            </div>
                            {requestedInstructors.size > 0 &&
                              !requestedInstructors.has(profile.id) && (
                                <p className="text-[10px] text-red-500 text-center leading-tight">
                                  Debes cancelar tu solicitud actual primero
                                </p>
                              )}
                          </div>
                        );
                      }
                      return (
                        <div className="w-full text-center">
                          <p className="text-[10px] text-muted-foreground">
                            Perfil de entrenador no disponible
                          </p>
                        </div>
                      );
                    })()}
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
