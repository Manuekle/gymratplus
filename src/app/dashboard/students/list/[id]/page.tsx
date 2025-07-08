"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { Flame, Target, Activity, Clock, ArrowLeft, Dumbbell } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface StudentDetail {
  id: string;
  studentId: string;
  name: string | null;
  email: string | null;
  image: string | null;
  agreedPrice: number | null;
  status: string;
  lastWorkoutAt: Date | null;
  currentWorkoutStreak: number;
  completedWorkoutsLast7Days: number;
  totalWorkouts: number;
  averageWorkoutsPerWeek: number;
  lastNutritionLog?: Date | null;
  hasActiveMealPlan: boolean;
  hasActiveWorkoutPlan: boolean;
}

interface AssignedWorkout {
  id: string;
  name: string;
  description?: string;
  assignedDate: string;
  dueDate?: string;
  status: string;
  notes?: string;
  exercises: AssignedWorkoutExercise[];
  assignedToId?: string;
}

// Tipos para ejercicios asignados
interface AssignedWorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restTime?: number;
  exercise?: { name: string };
}

export default function StudentDetailPage() {
  const params = useParams();
  const studentRelationId = params?.id as string;

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [workouts, setWorkouts] = useState<AssignedWorkout[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingWorkouts, setLoadingWorkouts] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<AssignedWorkout | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch student detail
  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/instructors/students");
        if (!res.ok) throw new Error("No se pudo cargar el alumno");
        const data = await res.json();
        const found = data.find((s: StudentDetail) => s.id === studentRelationId);
        if (!found) throw new Error("Alumno no encontrado");
        setStudent(found);
      } catch (e: any) {
        setError(e.message || "Error inesperado");
      } finally {
        setLoading(false);
      }
    };
    if (studentRelationId) fetchStudent();
  }, [studentRelationId]);

  // Fetch assigned workouts
  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoadingWorkouts(true);
      try {
        const res = await fetch("/api/instructors/workouts/assigned");
        if (!res.ok) throw new Error("No se pudieron cargar las rutinas");
        const data = await res.json();
        if (student && student.studentId) {
          setWorkouts(data.filter((w: AssignedWorkout) => w.assignedToId === student.studentId));
        } else {
          setWorkouts([]);
        }
      } catch (e: any) {
        setWorkouts([]);
      } finally {
        setLoadingWorkouts(false);
      }
    };
    if (student && student.studentId) fetchWorkouts();
  }, [student]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <Skeleton className="h-32 w-32 rounded-full mx-auto mb-4" />
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-32 mx-auto mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-2" />
        <Skeleton className="h-8 w-full mb-2" />
      </div>
    );
  }
  if (error || !student) {
    return (
      <div className="max-w-2xl mx-auto py-10 text-center">
        <p className="text-destructive font-semibold mb-4">{error || "Alumno no encontrado"}</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/students/list">
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">
      <Button asChild variant="ghost" size="sm">
        <Link href="/dashboard/students/list">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Link>
      </Button>
      <Card>
        <CardContent className="flex flex-col items-center py-8">
          <Avatar className="h-32 w-32 mb-4">
            <AvatarImage src={student.image || "/placeholder-avatar.jpg"} alt={student.name || "Alumno"} />
            <AvatarFallback className="text-4xl font-semibold">
              {student.name?.charAt(0).toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-semibold mb-1">{student.name}</h2>
          <p className="text-muted-foreground mb-2">{student.email}</p>
          <div className="flex gap-2 mb-2">
            <Badge variant={student.status === "active" ? "default" : "secondary"}>
              {student.status === "active" ? "Activo" : student.status === "pending" ? "Pendiente" : student.status}
            </Badge>
            {student.agreedPrice && (
              <Badge variant="outline">${student.agreedPrice}/mes</Badge>
            )}
          </div>
          <div className="flex gap-2 mb-2">
            <Badge variant="secondary" className="gap-1">
              <Flame className="h-4 w-4" />
              Racha: {student.currentWorkoutStreak}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Dumbbell className="h-4 w-4" />
              Entrenamientos: {student.totalWorkouts}
            </Badge>
          </div>
          <div className="flex gap-2 mb-2">
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-4 w-4" />
              Último: {student.lastWorkoutAt ? (isToday(new Date(student.lastWorkoutAt)) ? "Hoy" : format(new Date(student.lastWorkoutAt), "d MMM yyyy", { locale: es })) : "Sin entrenamientos"}
            </Badge>
          </div>
          <div className="flex gap-2 mb-2">
            {student.hasActiveWorkoutPlan && (
              <Badge variant="default" className="gap-1">
                <Target className="h-4 w-4" />
                Plan de entrenamiento activo
              </Badge>
            )}
            {student.hasActiveMealPlan && (
              <Badge variant="default" className="gap-1">
                <Activity className="h-4 w-4" />
                Plan de nutrición activo
              </Badge>
            )}
            {!student.hasActiveWorkoutPlan && !student.hasActiveMealPlan && (
              <Badge variant="outline">Sin planes activos</Badge>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Rutinas asignadas</CardTitle>
          <CardDescription>Rutinas que le has creado y asignado a este alumno.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingWorkouts ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : workouts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Este alumno aún no tiene rutinas asignadas por ti.
            </div>
          ) : (
            <div className="space-y-4">
              {workouts.map((w: AssignedWorkout) => (
                <Card key={w.id} className="border border-muted-foreground/10 cursor-pointer hover:shadow-md transition"
                  onClick={() => { setSelectedWorkout(w); setIsModalOpen(true); }}
                >
                  <CardContent className="py-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{w.name}</h3>
                        <p className="text-xs text-muted-foreground mb-1">Asignada: {format(new Date(w.assignedDate), "d MMM yyyy", { locale: es })}</p>
                        {w.dueDate && <p className="text-xs text-muted-foreground mb-1">Vence: {format(new Date(w.dueDate), "d MMM yyyy", { locale: es })}</p>}
                        {w.status && <Badge variant="outline" className="text-xs">{w.status}</Badge>}
                        {w.notes && <p className="text-xs mt-1">Notas: {w.notes}</p>}
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <span className="text-xs text-muted-foreground">{w.exercises.length} ejercicios</span>
                        <Button size="sm" variant="outline" className="text-xs mt-2" onClick={() => { setSelectedWorkout(w); setIsModalOpen(true); }}>
                          Ver detalle
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Modal de detalle de rutina */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de rutina</DialogTitle>
            <DialogDescription>
              Información completa de la rutina asignada.
            </DialogDescription>
          </DialogHeader>
          {selectedWorkout && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{selectedWorkout.name}</h3>
              {selectedWorkout.description && <p className="text-sm text-muted-foreground">{selectedWorkout.description}</p>}
              <div className="flex gap-2 flex-wrap text-xs">
                <span>Asignada: {format(new Date(selectedWorkout.assignedDate), "d MMM yyyy", { locale: es })}</span>
                {selectedWorkout.dueDate && <span>Vence: {format(new Date(selectedWorkout.dueDate), "d MMM yyyy", { locale: es })}</span>}
                {selectedWorkout.status && <Badge variant="outline">{selectedWorkout.status}</Badge>}
              </div>
              {selectedWorkout.notes && <p className="text-xs">Notas: {selectedWorkout.notes}</p>}
              <Separator />
              <h4 className="font-semibold text-sm mb-1">Ejercicios</h4>
              {selectedWorkout.exercises.length === 0 ? (
                <p className="text-xs text-muted-foreground">No hay ejercicios registrados.</p>
              ) : (
                <ul className="space-y-1">
                  {selectedWorkout.exercises.map((ex: AssignedWorkoutExercise, idx: number) => (
                    <li key={ex.id || idx} className="flex flex-col md:flex-row md:items-center md:gap-2 text-xs">
                      <span className="font-medium">{ex.exercise?.name || ex.name}</span>
                      <span>- {ex.sets}x{ex.reps} reps</span>
                      {ex.restTime && <span>- {ex.restTime}s descanso</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
