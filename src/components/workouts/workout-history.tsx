"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { differenceInDays } from "date-fns";

import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Clock01Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";

export default function WorkoutSummary() {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;

  interface Exercise {
    // Define exercise properties as needed (example property below)
    name: string;
  }

  interface WorkoutSession {
    id: string;
    notes?: string;
    date: string;
    duration?: number;
    exercises: Exercise[];
  }

  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    const fetchWorkoutHistory = async () => {
      try {
        const response = await fetch("/api/workout-session/history");
        if (response.ok) {
          const data = await response.json();
          setWorkoutSessions(data);
        }
      } catch (error) {
        console.error("Error al cargar el historial de entrenamientos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutHistory();
  }, []);

  // Calcular el total de páginas
  const totalPages = Math.ceil(workoutSessions.length / itemsPerPage);

  // Obtener los entrenamientos para la página actual
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWorkouts = workoutSessions.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  console.log(workoutSessions);

  return (
    <Card className="rounded-lg border bg-card h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
          <div>
            <CardTitle className="text-2xl font-semibold tracking-heading">
              Historial
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs mt-1">
              Aquí puedes ver tu resumen de entrenamientos
            </CardDescription>
          </div>
          <Link
            href="/dashboard/workout/history"
            className="group inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Ver todos
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="px-4">
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <div className="mt-2 flex items-center text-xs text-muted-foreground space-x-4">
                    <div className="flex items-center">
                      <Skeleton className="h-4 w-10" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-10" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : workoutSessions.length === 0 ? (
            <div className="justify-center py-40 items-center flex flex-col">
              <h2 className="text-xs font-medium">
                No hay entrenamientos recientes.
              </h2>
              <p className="text-muted-foreground text-xs">
                Inicia un nuevo entrenamiento para ver tu historial aquí.
              </p>
            </div>
          ) : (
            <>
              {currentWorkouts.map((session) => (
                <div key={session.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between">
                    <h4 className="font-semibold  tracking-heading text-lg">
                      {" "}
                      {session.notes?.replace("Día: ", "") || "Entrenamiento"}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {(() => {
                        const sessionDate = new Date(session.date);
                        sessionDate.setHours(0, 0, 0, 0);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const daysDiff = differenceInDays(today, sessionDate);

                        if (daysDiff === 0) {
                          return "Hoy";
                        } else if (daysDiff === 1) {
                          return "Ayer";
                        } else {
                          return `Hace ${daysDiff} ${daysDiff === 1 ? "día" : "días"}`;
                        }
                      })()}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-muted-foreground space-x-4">
                    <div className="flex items-center">
                      <HugeiconsIcon
                        icon={Clock01Icon}
                        className="h-3 w-3 mr-1 text-foreground"
                      />
                      <span>
                        {session.duration ? `${session.duration} min` : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span>{session.exercises.length} ejercicios</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-xs text-muted-foreground">
                    Mostrando {startIndex + 1}-
                    {Math.min(endIndex, workoutSessions.length)} de{" "}
                    {workoutSessions.length} entrenamientos
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 0}
                      className="h-8 w-8 p-0"
                    >
                      <HugeiconsIcon
                        icon={ArrowLeft01Icon}
                        className="h-4 w-4"
                      />
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {currentPage + 1} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages - 1}
                      className="h-8 w-8 p-0"
                    >
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className="h-4 w-4"
                      />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
