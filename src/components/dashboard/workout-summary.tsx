"use client";

import { useState, useEffect } from "react";

import { Skeleton } from "../ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { EmptyState } from "@/components/ui/empty-state";
import { WorkoutReminderAlert } from "@/components/workout/workout-reminder-alert";
import { WorkoutSessionCard } from "@/components/workout/workout-session-card";

interface Exercise {
  // Define the exercise properties as needed, for example:
  name: string;
  reps?: number;
  sets?: number;
}

interface WorkoutSession {
  id: string;
  date: string;
  duration?: number;
  exercises: Exercise[];
  notes?: string;
  completed: boolean;
}

export default function WorkoutSummary() {
  const [loading, setLoading] = useState(true);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [lastWorkoutDate, setLastWorkoutDate] = useState<Date | null>(null);

  const fetchWorkoutHistory = async () => {
    try {
      const response = await fetch("/api/workout-session/history");
      if (response.ok) {
        const data = await response.json();
        setWorkoutSessions(data);
        // Obtener la fecha del último entrenamiento
        if (data && data.length > 0) {
          const lastSession = data[0];
          setLastWorkoutDate(new Date(lastSession.date));
        } else {
          setLastWorkoutDate(null);
        }
      }
    } catch (error) {
      console.error("Error al cargar el historial de entrenamientos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutHistory();
  }, []);

  return (
    <Card className="rounded-lg border bg-card h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
          <div>
            <CardTitle className="text-2xl font-semibold tracking-heading">
              Resumen de Entrenamientos
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs mt-1">
              Historial de tus últimos entrenamientos
            </CardDescription>
          </div>
          <Link
            href="/dashboard/workout/history"
            className="group inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Ver más
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="px-4 flex-1 flex flex-col">
        {/* Alerta de recordatorio si no ha entrenado en varios días */}
        {!loading && (
          <WorkoutReminderAlert
            lastWorkoutAt={lastWorkoutDate}
            onRestDayMarked={() => {
              // Refrescar los datos después de marcar un día de descanso
              fetchWorkoutHistory();
            }}
          />
        )}

        <div
          className={`space-y-4 ${workoutSessions.length === 0 && !loading ? "flex-1 flex flex-col" : ""}`}
        >
          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 2 }).map((_, index) => (
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
            <EmptyState
              title="No hay entrenamientos recientes"
              description="Inicia un nuevo entrenamiento para ver tu historial aquí."
              action={{
                label: "Iniciar entrenamiento",
                href: "/dashboard/workout/active",
              }}
              className="flex-1 h-full"
            />
          ) : (
            workoutSessions.slice(0, 2).map((session) => (
              <WorkoutSessionCard key={session.id} session={session} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
