"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { InstructorProfile, User } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2 } from "lucide-react";
import { CountrySelector } from "@/components/country-selector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCountries } from "@/hooks/use-countries";
import Image from "next/image";

interface InstructorWithProfile extends User {
  instructorProfile: InstructorProfile | null;
}

const EXPERIENCE_LEVELS = [
  { value: "principiante", label: "Principiante" },
  { value: "intermedio", label: "Intermedio" },
  { value: "avanzado", label: "Avanzado" },
];

const SPECIALTIES = [
  "Fuerza",
  "HIIT",
  "Pilates",
  "Yoga",
  "Cardio",
  "Crossfit",
  "Hipertrofia",
  "Funcional",
  "Movilidad",
  "Rehabilitación",
  "Nutrición",
  "Otro",
];

export default function InstructorSearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [country, setCountry] = useState<string>("");
  const [isRemote, setIsRemote] = useState(searchParams.get('isRemote') === 'true');
  const [isVerified, setIsVerified] = useState(false);
  const [maxPrice, setMaxPrice] = useState('');
  const [experience, setExperience] = useState('');
  const [instructors, setInstructors] = useState<InstructorWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requestingInstructorId, setRequestingInstructorId] = useState<string | null>(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [requestedInstructors, setRequestedInstructors] = useState<Set<string>>(new Set());

  // Hook para países
  const { countries } = useCountries();

  const fetchInstructors = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (country) params.append('country', country);
      if (isRemote) params.append('isRemote', 'true');
      if (isVerified) params.append('isVerified', 'true');
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (experience) params.append('experienceLevel', experience);
      if (selectedSpecialties.length > 0) params.set('specialty', selectedSpecialties.join(","));

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
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      toast.error(errorMessage);
      console.error("Error fetching instructors:", error);
    } finally {
      setIsLoading(false);
    }
  }, [country, isRemote, isVerified, maxPrice, experience, selectedSpecialties]);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (country) params.set('country', country);
    if (isRemote) params.set('isRemote', 'true');
    if (isVerified) params.set('isVerified', 'true');
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (experience) params.set('experienceLevel', experience);
    if (selectedSpecialties.length > 0) params.set('specialty', selectedSpecialties.join(","));
    router.push(`?${params.toString()}`);
    fetchInstructors();
  };

  const handleRequestInstructor = useCallback(async (instructorProfileId?: string) => {
    if (!instructorProfileId) {
      toast.error("Error", { description: "ID de instructor no disponible." });
      return;
    }

    // Verificar si ya hay un instructor solicitado
    if (requestedInstructors.size > 0 && !requestedInstructors.has(instructorProfileId)) {
      toast.error("Ya tienes una solicitud pendiente", { 
        description: "Debes cancelar tu solicitud actual antes de solicitar otro instructor." 
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
        throw new Error(errorData.message || "Error al enviar la solicitud.");
      }

      // Agregar el instructor a la lista de solicitados
      setRequestedInstructors(prev => new Set(prev).add(instructorProfileId));
      
      toast.success("Solicitud enviada", { 
        description: "Tu solicitud ha sido enviada al instructor. ¡Pronto se pondrá en contacto contigo!" 
      });
    } catch (error: unknown) {
      let errorMessage = "Hubo un error al procesar tu solicitud.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      toast.error(errorMessage);
      console.error("Error requesting instructor:", error);
    } finally {
      setRequestingInstructorId(null);
    }
  }, [requestedInstructors]);

  const handleSpecialtyToggle = (spec: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(spec)
        ? prev.filter((s) => s !== spec)
        : [...prev, spec]
    );
  };

  return (
    <div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="tracking-heading text-2xl font-semibold">Opciones de Búsqueda</CardTitle>
          <CardDescription className="text-xs">Encuentra al instructor ideal para ti.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* País con el nuevo selector */}
          <div className="space-y-2">
            <CountrySelector
              value={country}
              onValueChange={(value) => setCountry(value)}
              placeholder="Selecciona un país"
              label="País"
            />
          </div>
          {/* Precio máximo */}
          <div className="space-y-2">
            <Label htmlFor="maxPrice">Precio máximo (USD/mes)</Label>
            <Input
              id="maxPrice"
              type="number"
              min={0}
              placeholder="Ej: 100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          {/* Experiencia */}
          <div className="space-y-2">
            <Label htmlFor="experience">Nivel de experiencia</Label>
            <Select value={experience} onValueChange={setExperience}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <SelectItem key={lvl.value} value={lvl.value}>{lvl.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Switches alineados horizontalmente y compactos */}
          <div className="flex flex-row flex-wrap gap-4 items-center md:col-span-3 mb-2">
            <div className="flex items-center gap-2">
              <Switch id="isVerified" checked={isVerified} onCheckedChange={setIsVerified} />
              <Label htmlFor="isVerified">Solo verificados</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="isRemote" checked={isRemote} onCheckedChange={setIsRemote} />
              <Label htmlFor="isRemote">Remoto</Label>
            </div>
          </div>
          {/* Especialidad/metodología como badges */}
          <div className="space-y-2 md:col-span-2 lg:col-span-1">
            <Label>Especialidad / Metodología</Label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((spec) => (
                <Badge
                  key={spec}
                  variant={selectedSpecialties.includes(spec) ? "default" : "outline"}
                  className={`cursor-pointer select-none transition-all ${selectedSpecialties.includes(spec) ? 'bg-primary text-white' : ''}`}
                  onClick={() => handleSpecialtyToggle(spec)}
                >
                  {spec}
                </Badge>
              ))}
            </div>
          </div>
          <div className="md:col-span-3">
            <Button onClick={handleSearch} className="w-full">
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl tracking-heading font-semibold mb-4">Resultados ({instructors.length})</h2>

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
            <p className="text-gray-500 md:col-span-3">No se encontraron instructores con los criterios de búsqueda.</p>
          ) : (
            instructors.map((instructor) => {
              // Buscar país por código usando countries del hook
              const countryData = countries.find(c => c.cca2 === instructor.instructorProfile?.country);
              // Type guard para specialties sin usar 'any'
              let specialties: string[] | undefined = undefined;
              if (
                instructor.instructorProfile &&
                typeof instructor.instructorProfile === 'object' &&
                'specialties' in instructor.instructorProfile &&
                Array.isArray((instructor.instructorProfile as { specialties?: unknown }).specialties)
              ) {
                specialties = (instructor.instructorProfile as { specialties: string[] }).specialties;
              }
              return (
                <Card
                  key={instructor.id}
                  className="flex flex-col shadow-sm dark:shadow-md transition-all duration-200 hover:scale-[1.005] hover:shadow-lg hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-200 dark:hover:from-zinc-900 dark:hover:to-zinc-800 bg-white dark:bg-zinc-950 border px-4 py-3 min-h-[220px]"
                >
                  <CardHeader className="flex-row items-center space-x-3 pb-1 px-0">
                    <Image
                      src={instructor.image || "/placeholder-avatar.jpg"} 
                      alt={instructor.name || "Instructor"} 
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover border-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-semibold tracking-heading">{instructor.name}</CardTitle>
                        {instructor.instructorProfile?.isVerified && (
                          <CheckCircle2 className="text-green-600 w-4 h-4" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {countryData && (
                          <span className="flex items-center gap-1">
                            <Image
                              src={countryData.flags.svg} 
                              alt={countryData.name.common} 
                              className="w-4 h-3 object-cover rounded-sm" 
                            />
                            {countryData.name.common}
                          </span>
                        )}
                        {instructor.instructorProfile?.isRemote && (
                          <Badge variant="outline" className="text-xs">Remoto</Badge>
                        )}
                      </div>
                      {instructor.experienceLevel && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {EXPERIENCE_LEVELS.find(lvl => lvl.value === instructor.experienceLevel)?.label || instructor.experienceLevel}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 flex-grow px-0 space-y-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {instructor.instructorProfile?.bio || "Sin biografía."}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                          Precio: 
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {instructor.instructorProfile?.pricePerMonth 
                            ? `$${instructor.instructorProfile.pricePerMonth}/mes` 
                            : 'Consultar'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                          Especialidades:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {specialties && specialties.length ? (
                            specialties.map((specialty, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">No especificadas</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <div className="px-0 pb-1 pt-0 mt-auto">
                    <Button 
                      className={`w-full h-8 text-xs ${
                        requestedInstructors.has(instructor.instructorProfile?.id || '') 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : ''
                      }`}
                      onClick={() => handleRequestInstructor(instructor.instructorProfile?.id)}
                      disabled={
                        requestingInstructorId === instructor.instructorProfile?.id || 
                        (requestedInstructors.size > 0 && !requestedInstructors.has(instructor.instructorProfile?.id || ''))
                      }
                    >
                      {requestingInstructorId === instructor.instructorProfile?.id ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Enviando...
                        </>
                      ) : requestedInstructors.has(instructor.instructorProfile?.id || '') ? (
                        <>
                          <CheckCircle2 className="mr-2 h-3 w-3" />
                          Solicitud Enviada
                        </>
                      ) : (
                        "Solicitar Instructor"
                      )}
                    </Button>
                    {requestedInstructors.size > 0 && !requestedInstructors.has(instructor.instructorProfile?.id || '') && (
                      <p className="text-xs text-red-500 mt-1 text-center">
                        Debes cancelar tu solicitud actual primero
                      </p>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
} 