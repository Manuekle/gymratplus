"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";

interface InstructorProfile {
  bio: string | null;
  isVerified: boolean;
  pricePerMonth: number | null;
  country: string | null;
  city: string | null;
  isRemote: boolean;
  tags?: string[];
}

interface Instructor {
  id: string;
  name: string | null;
  image: string | null;
  instructorProfile: InstructorProfile | null;
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  // Removed selectedTags state as it's not currently used

  const fetchInstructors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/instructors");
      if (!res.ok) throw new Error("Error al cargar instructores");
      const data = await res.json();
      setInstructors(data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-heading">
            Instructores disponibles
          </CardTitle>
          <CardDescription className="text-xs">
            Elige un instructor para ver su perfil o solicitar ser su alumno.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : instructors.length === 0 ? (
            <div className="text-center text-xs text-muted-foreground py-8">
              No hay instructores disponibles en este momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {instructors.map((instructor: Instructor) => (
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
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {instructor.name}
                        </CardTitle>
                      </div>
                      {instructor.instructorProfile?.country && (
                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                          {instructor.instructorProfile?.country && (
                            <span className="flex items-center gap-1">
                              <Image
                                src={`https://flagcdn.com/24x18/${instructor.instructorProfile.country.toLowerCase()}.png`}
                                alt={instructor.instructorProfile.country}
                                width={16}
                                height={12}
                                className="w-4 h-3 object-cover rounded-sm"
                              />
                              {instructor.instructorProfile.country}
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
                        <div className="text-xs font-medium">
                          $
                          {instructor.instructorProfile.pricePerMonth.toFixed(
                            2
                          )}
                          /mes
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-xs text-muted-foreground line-clamp-3 mb-4">
                      {instructor.instructorProfile?.bio ||
                        "Instructor certificado con experiencia en entrenamiento personalizado."}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {instructor.instructorProfile?.tags
                        ?.slice(0, 4)
                        .map((tag: string, idx: number) => (
                          <Badge
                            key={`${tag}-${idx}`}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button asChild className="w-full">
                      <Link href={`/dashboard/instructors/${instructor.id}`}>
                        Ver perfil
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Enlaces a otras páginas de instructores */}
      <div className="flex flex-col md:flex-row gap-4 pt-6">
        <Button asChild variant="default" className="flex-1">
          <Link href="/dashboard/instructors/list">
            Ver todos mis instructores
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/dashboard/instructors/search">Buscar instructores</Link>
        </Button>
      </div>
    </div>
  );
}
