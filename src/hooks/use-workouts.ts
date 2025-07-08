import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

export interface Workout {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  instructorId?: string;
  assignedToId?: string;
  status?: 'draft' | 'published' | 'archived';
  isTemplate?: boolean;
  exercises: WorkoutExercise[];
  createdById: string;
  type: 'personal' | 'template';
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  reps: number;
  weight?: number;
  restTime?: number;
  order: number;
  notes?: string;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscleGroup: string;
  equipment?: string;
  videoUrl?: string;
  imageUrl?: string;
}

// Estado global para los workouts personales
let globalPersonalWorkouts: Workout[] = [];
let globalSubscribers: ((workouts: Workout[]) => void)[] = [];

const notifySubscribers = () => {
  globalSubscribers.forEach((callback) => callback(globalPersonalWorkouts));
};

export function useWorkouts() {
  const [isLoading, setIsLoading] = useState(true);
  const [workouts, setWorkouts] = useState<Workout[]>(globalPersonalWorkouts);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  // Obtener las rutinas personales del usuario
  const fetchWorkouts = useCallback(async () => {
    try {
      const res = await fetch("/api/workouts");
      if (res.ok) {
        const data = await res.json();
        // Filtrar solo las rutinas personales creadas por el usuario
        const personalWorkouts = data.filter(
          (workout: Workout) => 
            workout.createdById === session?.user?.id && 
            workout.type === 'personal' &&
            workout.status !== 'archived'
        );
        globalPersonalWorkouts = personalWorkouts;
        setWorkouts(personalWorkouts);
        notifySubscribers();
      } else {
        throw new Error("Error al obtener tus rutinas personales");
      }
    } catch (error) {
      console.error("Error fetching personal workouts:", error);
      toast.error("Error al cargar tus rutinas personales");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);
  
  // Crear una nueva rutina personal
  const createWorkout = useCallback(async (workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt' | 'createdById' | 'exercises'>, exercises: Omit<WorkoutExercise, 'id' | 'workoutId' | 'exercise'>[]) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...workoutData,
          exercises,
          type: 'personal',
        }),
      });

      if (res.ok) {
        const newWorkout = await res.json();
        globalPersonalWorkouts = [...globalPersonalWorkouts, newWorkout];
        setWorkouts(globalPersonalWorkouts);
        notifySubscribers();
        toast.success("Rutina creada correctamente");
        return newWorkout;
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al crear la rutina");
      }
    } catch (error) {
      console.error("Error creating workout:", error);
      toast.error(error instanceof Error ? error.message : "Error al crear la rutina");
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const deleteWorkout = useCallback(
    async (workoutId: string, workoutName: string) => {
      setIsDeleting(true);
      try {
        const res = await fetch(`/api/workouts/${workoutId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          toast.success("¡Rutina eliminada!", {
            description: `La rutina "${workoutName}" ha sido eliminada correctamente.`,
            duration: 3000,
          });
          globalPersonalWorkouts = globalPersonalWorkouts.filter((workout: Workout) => workout.id !== workoutId);
          setWorkouts(globalPersonalWorkouts);
          notifySubscribers();
        } else {
          throw new Error("Error al eliminar el entrenamiento");
        }
      } catch (error) {
        console.error("Error eliminando la rutina:", error);
        toast.error("Error al eliminar", {
          description: `No se pudo eliminar la rutina "${workoutName}". Por favor, intenta nuevamente.`,
          duration: 4000,
        });
      } finally {
        setIsDeleting(false);
      }
    },
    []
  );

  // Suscribirse a cambios globales
  useEffect(() => {
    const callback = (newWorkouts: Workout[]) => {
      setWorkouts(newWorkouts);
    };
    globalSubscribers.push(callback);
    return () => {
      globalSubscribers = globalSubscribers.filter((cb) => cb !== callback);
    };
  }, []);

  // Actualizar una rutina existente
  const updateWorkout = useCallback(async (workoutId: string, updates: Partial<Workout>, exercises?: Omit<WorkoutExercise, 'id' | 'workoutId' | 'exercise'>[]) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/workouts/${workoutId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...updates,
          ...(exercises && { exercises }),
        }),
      });

      if (res.ok) {
        const updatedWorkout = await res.json();
        globalPersonalWorkouts = globalPersonalWorkouts.map(workout => 
          workout.id === workoutId ? updatedWorkout : workout
        );
        setWorkouts(globalPersonalWorkouts);
        notifySubscribers();
        toast.success("Rutina actualizada correctamente");
        return updatedWorkout;
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al actualizar la rutina");
      }
    } catch (error) {
      console.error("Error updating workout:", error);
      toast.error(error instanceof Error ? error.message : "Error al actualizar la rutina");
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Cargar rutinas cuando cambie la sesión
  useEffect(() => {
    if (!session) return;
    fetchWorkouts();
  }, [session, fetchWorkouts]);

  // Actualizar los datos cuando cambie la ruta
  useEffect(() => {
    if (session) {
      fetchWorkouts();
    }
  }, [pathname, session, fetchWorkouts]);

  return {
    // Datos
    workouts,
    
    // Estados de carga
    isLoading,
    isDeleting,
    isSaving,
    
    // Métodos
    createWorkout,
    updateWorkout,
    deleteWorkout,
    refreshWorkouts: fetchWorkouts,
  };
}
