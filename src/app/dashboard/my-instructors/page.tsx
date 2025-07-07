"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Mail01Icon, PhoneOff01Icon } from "hugeicons-react"
import { Badge } from "@/components/ui/badge"

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
      const uniqueCountries = Array.from(new Set(data.map(i => i.country).filter(Boolean))) as string[];
      if (uniqueCountries.length > 0) {
        const flags: Record<string, string> = {};
        for (const c of uniqueCountries) {
          try {
            const flagResponse = await fetch(`https://restcountries.com/v3.1/alpha/${c}`);
            if (flagResponse.ok) {
              const countryData = await flagResponse.json();
              if (countryData && countryData.length > 0 && countryData[0].flags?.svg) {
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
      } else if (typeof error === 'string') {
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-semibold mb-6">Mis Instructores</h1>
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
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-semibold mb-6">Mis Instructores</h1>

      {instructors.length === 0 ? (
        <p className="text-gray-500">Aún no tienes instructores asignados.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructors.map((instructor) => (
            <Card key={instructor.id} className="flex flex-col">
              <CardHeader className="flex-row items-center space-x-4 pb-2">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={instructor.image || "/placeholder-avatar.jpg"} alt={instructor.name || "Instructor"} />
                  <AvatarFallback>{instructor.name?.charAt(0) || "I"}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{instructor.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    {instructor.city}, {instructor.country}
                    {instructor.country && countryFlags[instructor.country] && (
                      <img 
                        src={countryFlags[instructor.country]}
                        alt={`Bandera de ${instructor.country}`}
                        className="w-5 h-auto inline-block ml-1 rounded-sm shadow"
                      />
                    )}
                  </CardDescription>
                  {instructor.isRemote && <Badge className="mt-1">Remoto</Badge>}
                </div>
              </CardHeader>
              <CardContent className="pt-2 flex-grow">
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-2">
                  {instructor.bio || "Sin biografía."
                }</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Precio acordado: {instructor.pricePerMonth ? `$${instructor.pricePerMonth}/mes` : 'No especificado'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Especialidades: {instructor.curriculum || 'No especificado'}</p>

                <div className="mt-4 pt-4 border-t border-dashed">
                  <h3 className="text-sm font-semibold mb-2">Contacto</h3>
                  <div className="space-y-2 text-sm">
                    {instructor.contactEmail && (
                      <p className="flex items-center gap-2">
                        <Mail01Icon className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${instructor.contactEmail}`} className="hover:underline">{instructor.contactEmail}</a>
                      </p>
                    )}
                    {instructor.contactPhone && (
                      <p className="flex items-center gap-2">
                        <PhoneOff01Icon className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${instructor.contactPhone}`} className="hover:underline">{instructor.contactPhone}</a>
                      </p>
                    )}
                    {!instructor.contactEmail && !instructor.contactPhone && (
                      <p className="text-xs text-muted-foreground">Información de contacto no disponible.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 