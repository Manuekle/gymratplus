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
import { InstructorProfile, User } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CountrySelector } from "@/components/country-selector";
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

interface InstructorWithProfile extends User {
  instructorProfile: InstructorProfile | null;
}

const EXPERIENCE_LEVELS = [
  { value: "principiante", label: "Principiante" },
  { value: "intermedio", label: "Intermedio" },
  { value: "avanzado", label: "Avanzado" },
];

export default function InstructorSearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [country, setCountry] = useState<string>("");
  const [isRemote, setIsRemote] = useState(
    searchParams.get("isRemote") === "true",
  );
  const [isVerified, setIsVerified] = useState(false);
  const [maxPrice, setMaxPrice] = useState("");
  const [experience, setExperience] = useState("");
  const [instructors, setInstructors] = useState<InstructorWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requestingInstructorId, setRequestingInstructorId] = useState<
    string | null
  >(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [requestedInstructors, setRequestedInstructors] = useState<Set<string>>(
    new Set(),
  );

  // Hook para países
  const { countries } = useCountries();

  // Cargar solicitudes existentes del usuario
  const loadExistingRequests = useCallback(async () => {
    try {
      const response = await fetch("/api/student-instructor-requests");
      if (response.ok) {
        const requests = await response.json();
        const requestIds = requests.map(
          (req: { instructorProfileId: string }) => req.instructorProfileId,
        );
        setRequestedInstructors(new Set(requestIds));
      }
    } catch (error) {
      console.error("Error loading existing requests:", error);
    }
  }, []);

  // Cargar solicitudes existentes al montar el componente
  useEffect(() => {
    loadExistingRequests();
  }, [loadExistingRequests]);

  const fetchInstructors = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (country) params.append("country", country);
      if (isRemote) params.append("isRemote", "true");
      if (isVerified) params.append("isVerified", "true");
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (experience) params.append("experienceLevel", experience);
      if (selectedSpecialties.length > 0)
        params.set("tagFilter", selectedSpecialties.join(","));

      const response = await fetch(`/api/instructors?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Error al obtener instructores.");
      }
      const data: InstructorWithProfile[] = await response.json();
      setInstructors(data);
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
  }, [
    country,
    isRemote,
    isVerified,
    maxPrice,
    experience,
    selectedSpecialties,
  ]);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (country) params.set("country", country);
    if (isRemote) params.set("isRemote", "true");
    if (isVerified) params.set("isVerified", "true");
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (experience) params.set("experienceLevel", experience);
    if (selectedSpecialties.length > 0)
      params.set("tagFilter", selectedSpecialties.join(","));
    router.push(`?${params.toString()}`);
    fetchInstructors();
  };

  const handleRequestInstructor = useCallback(
    async (instructorProfileId?: string) => {
      if (!instructorProfileId) {
        toast.error("Error", {
          description:
            "ID de instructor no disponible. Por favor, intenta de nuevo.",
        });
        return;
      }

      // Verificar si ya hay un instructor solicitado
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

        // Agregar el instructor a la lista de solicitados
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
    <div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="tracking-heading text-2xl font-semibold">
            Opciones de Búsqueda
          </CardTitle>
          <CardDescription className="text-xs">
            Encuentra al instructor ideal para ti.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* País con el nuevo selector */}
          <div className="space-y-2 col-span-3 md:col-span-2 lg:col-span-1">
            <CountrySelector
              value={country}
              onValueChange={(value) => setCountry(value)}
              placeholder="Selecciona un país"
              label="País"
              className="text-xs"
            />
          </div>
          {/* Precio máximo */}
          <div className="space-y-2 col-span-3 md:col-span-2 lg:col-span-1">
            <Label htmlFor="maxPrice">Precio máximo (USD/mes)</Label>
            <Input
              id="maxPrice"
              type="number"
              min={0}
              placeholder="Ej: 100"
              value={maxPrice}
              className="text-xs"
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          {/* Experiencia */}
          <div className="space-y-2 col-span-3 md:col-span-2 lg:col-span-1">
            <Label htmlFor="experience">Nivel de experiencia</Label>
            <Select value={experience} onValueChange={setExperience}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <SelectItem key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Switches alineados horizontalmente y compactos */}
          <div className="flex flex-row flex-wrap gap-4 items-center md:col-span-3 mb-2">
            <div className="flex items-center gap-2">
              <Switch
                id="isVerified"
                checked={isVerified}
                onCheckedChange={setIsVerified}
              />
              <Label htmlFor="isVerified">Solo verificados</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isRemote"
                checked={isRemote}
                onCheckedChange={setIsRemote}
              />
              <Label htmlFor="isRemote">Remoto</Label>
            </div>
          </div>
          {/* Especialidad/metodología como badges */}
          <div className="space-y-2 col-span-3">
            <Label>Especialidad / Metodología</Label>
            <div className="relative w-full">
              {/* Scroll horizontal solo en móvil, grid en desktop */}
              <div className="md:hidden relative w-full">
                <div className="flex space-x-2 pb-2 overflow-x-auto hide-scrollbar max-w-full">
                  <div className="flex space-x-2 min-w-max w-full">
                    {SPECIALTIES.map((spec) => (
                      <Badge
                        key={spec.id}
                        variant={
                          selectedSpecialties.includes(spec.id)
                            ? "default"
                            : "secondary"
                        }
                        className={`whitespace-nowrap px-3 py-1 text-xs transition-all flex-shrink-0 cursor-pointer ${
                          selectedSpecialties.includes(spec.id)
                            ? "bg-primary text-primary-foreground"
                            : "bg-transparent border border-input hover:bg-accent"
                        }`}
                        onClick={() => handleSpecialtyToggle(spec.id)}
                      >
                        {spec.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
              </div>

              {/* Grid responsive en desktop */}
              <div className="hidden md:flex md:flex-wrap gap-2">
                {SPECIALTIES.map((spec) => (
                  <Badge
                    key={spec.id}
                    variant={
                      selectedSpecialties.includes(spec.id)
                        ? "default"
                        : "secondary"
                    }
                    className={`px-3 py-1 text-xs transition-all cursor-pointer ${
                      selectedSpecialties.includes(spec.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-transparent border border-input hover:bg-accent"
                    }`}
                    onClick={() => handleSpecialtyToggle(spec.id)}
                  >
                    {spec.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="md:col-span-3 ">
            <Button onClick={handleSearch} className="w-full">
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl tracking-heading font-semibold mb-4">
        Resultados ({instructors.length})
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructors.length === 0 ? (
            <p className="text-gray-500 md:col-span-3 text-xs">
              No se encontraron instructores con los criterios de búsqueda.
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
                  <CardHeader className="flex flex-row items-start space-x-4 pb-3">
                    <Avatar className="h-16 w-16 mt-1">
                      <AvatarImage
                        src={instructor.image || ""}
                        alt={instructor.name || "Instructor"}
                      />
                      <AvatarFallback>
                        {instructor.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {instructor.name}
                        </CardTitle>
                      </div>
                      {(instructor.instructorProfile?.city ||
                        countryData?.name?.common) && (
                        <div className="flex items-center text-sm text-muted-foreground gap-2">
                          {countryData && (
                            <span className="flex items-center gap-1">
                              <Image
                                src={countryData.flags.svg}
                                alt={countryData.name.common}
                                width={16}
                                height={12}
                                className="w-4 h-3 object-cover rounded-sm"
                              />
                              {countryData.name.common}
                            </span>
                          )}
                          {instructor.instructorProfile?.isRemote && (
                            <Badge variant="outline" className="text-xs ml-2">
                              Remoto
                            </Badge>
                          )}
                        </div>
                      )}
                      {instructor.instructorProfile?.pricePerMonth && (
                        <div className="text-sm font-medium">
                          $
                          {instructor.instructorProfile.pricePerMonth.toFixed(
                            2,
                          )}
                          /mes
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {instructor.instructorProfile?.bio ||
                        "Instructor certificado con experiencia en entrenamiento personalizado."}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {instructor.instructorProfile?.curriculum ? (
                        instructor.instructorProfile.curriculum
                          .split(",")
                          .slice(0, 4)
                          .map((tag, idx) => (
                            <Badge
                              key={`${tag}-${idx}`}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag.trim()}
                            </Badge>
                          ))
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Sin especialidades
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex flex-col gap-1">
                    {(() => {
                      const profile = instructor.instructorProfile;
                      if (profile && profile.id) {
                        return (
                          <>
                            <Button
                              size="default"
                              className={`w-full text-xs ${
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
                                "Solicitar Instructor"
                              )}
                            </Button>
                            {requestedInstructors.size > 0 &&
                              !requestedInstructors.has(profile.id) && (
                                <p className="text-xs text-red-500 mt-1 text-center">
                                  Debes cancelar tu solicitud actual primero
                                </p>
                              )}
                          </>
                        );
                      }
                      return (
                        <div className="w-full text-center">
                          <p className="text-xs text-muted-foreground">
                            Perfil de instructor no disponible
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
