"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function WorkoutHistory() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [workoutSessions, setWorkoutSessions] = useState<any[]>([]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (workoutSessions.length === 0) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold mb-4">
          No hay entrenamientos completados
        </h2>
        <Button onClick={() => router.push("/workouts")}>
          Iniciar un entrenamiento
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Historial de entrenamientos</h1>
        <Button onClick={() => router.push("/dashboard/workout")}>
          Volver a entrenamientos
        </Button>
      </div>

      <div className="space-y-4">
        {workoutSessions.map((session) => (
          <Card key={session.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">
                    {session.notes?.replace("Día: ", "") || "Entrenamiento"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(session.date), "PPP", { locale: es })} •
                    {formatDistanceToNow(new Date(session.date), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
                <Badge variant={session.completed ? "default" : "outline"}>
                  {session.completed ? "Completado" : "En progreso"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Duración</p>
                  <p className="font-medium">
                    {session.duration ? `${session.duration} min` : "N/A"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Ejercicios</p>
                  <p className="font-medium">{session.exercises.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Sets completados
                  </p>
                  <p className="font-medium">
                    {session.exercises.reduce(
                      (acc: number, ex: any) =>
                        acc +
                        ex.sets.filter((set: any) => set.completed).length,
                      0
                    )}
                  </p>
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="exercises">
                  <AccordionTrigger>Ver detalles</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {session.exercises.map((exercise: any) => (
                        <div
                          key={exercise.id}
                          className="border rounded-md p-3"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">
                              {exercise.exercise.name}
                            </h4>
                            <Badge variant="outline">
                              {exercise.completed ? "Completado" : "Incompleto"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-4 gap-2 text-sm font-medium mb-1">
                            <div>Set</div>
                            <div>Peso (kg)</div>
                            <div>Reps</div>
                            <div>Estado</div>
                          </div>

                          {exercise.sets.map((set: any) => (
                            <div
                              key={set.id}
                              className="grid grid-cols-4 gap-2 text-sm py-1 border-t"
                            >
                              <div>{set.setNumber}</div>
                              <div>{set.weight || "-"}</div>
                              <div>{set.reps || "-"}</div>
                              <div>
                                {set.completed ? (
                                  <span className="text-green-600">✓</span>
                                ) : (
                                  <span className="text-red-600">✗</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
