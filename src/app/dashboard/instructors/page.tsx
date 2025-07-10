"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TagSelector } from "@/components/ui/tag-selector";
import { SPECIALTIES } from "@/data/specialties";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Instructor {
  id: string;
  name: string;
  image?: string;
  interests?: string[];
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const fetchInstructors = async (tags: string[] = []) => {
    setLoading(true);
    try {
      const url = `/api/instructors${tags.length > 0 ? `?tags=${tags.join(',')}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al cargar instructores");
      const data = await res.json();
      setInstructors(data);
    } catch (error) {
      console.error('Error fetching instructors:', error);
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors(selectedTags);
  }, [selectedTags]);

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
          <div className="mt-4">
            <TagSelector
              selectedTags={selectedTags}
              onTagSelect={setSelectedTags}
              availableTags={SPECIALTIES}
              placeholder="Filtrar por intereses..."
            />
          </div>
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
            <div className="text-center text-sm text-muted-foreground py-8">
              No hay instructores disponibles en este momento.
            </div>
          ) : (
            <div className="space-y-4">
              {instructors.map((inst) => (
                <Card
                  key={inst.id}
                  className="border border-muted-foreground/10"
                >
                  <CardContent className="py-4 flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={inst.image || "/placeholder-avatar.jpg"}
                        alt={inst.name}
                      />
                      <AvatarFallback>
                        {inst.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold tracking-heading text-lg">
                        {inst.name}
                      </p>
                      {inst.interests && inst.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {inst.interests.map(interest => (
                            <Badge key={interest} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      <Link href={`/dashboard/instructors/${inst.id}`}>
                        Ver perfil
                      </Link>
                    </Button>
                  </CardContent>
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
