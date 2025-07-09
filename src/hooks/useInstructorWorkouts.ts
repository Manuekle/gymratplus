import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

export interface AssignedWorkout extends WorkoutBase {
  id: string;
  assignedToId: string;
  assignedTo: {
    id: string;
    name: string;
    email: string;
  };
  assignedDate: string;
  dueDate?: string;
  status: "assigned" | "in_progress" | "completed" | "skipped";
  notes?: string;
}

interface WorkoutBase {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  instructorId: string;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
}

interface Student {
  id: string;
  name: string;
  email: string;
}

// Estado global para los workouts asignados
let globalAssignedWorkouts: AssignedWorkout[] = [];
let globalSubscribers: ((workouts: AssignedWorkout[]) => void)[] = [];

const notifySubscribers = () => {
  globalSubscribers.forEach((callback) => callback(globalAssignedWorkouts));
};

interface AssignWorkoutData {
  workoutId: string; // id de la rutina a asignar
  studentId: string;
  dueDate?: string;
  notes?: string;
  // Los siguientes campos son opcionales y pueden ser usados para compatibilidad
  name?: string;
  description?: string;
  exercises?: Array<{
    id: string;
    sets: number;
    reps: number;
    order: number;
    restTime?: number;
  }>;
  workoutType?:
    | "estandar"
    | "hipertrofia"
    | "fuerza"
    | "perdida_grasa"
    | "resistencia"
    | "movilidad";
}

export function useInstructorWorkouts() {
  const [isLoading, setIsLoading] = useState(true);
  const [assignedWorkouts, setAssignedWorkouts] = useState<AssignedWorkout[]>(
    globalAssignedWorkouts,
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  // Obtener los estudiantes del instructor
  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch("/api/instructors/students");
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      } else {
        throw new Error("Error al cargar los estudiantes");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Error al cargar los estudiantes");
    }
  }, []);

  // Obtener las rutinas asignadas por el instructor
  const fetchAssignedWorkouts = useCallback(async () => {
    try {
      const res = await fetch("/api/instructors/workouts/assigned");
      if (res.ok) {
        const data = await res.json();
        globalAssignedWorkouts = data;
        setAssignedWorkouts(data);
        notifySubscribers();
      } else {
        throw new Error("Error al cargar las rutinas asignadas");
      }
    } catch (error) {
      console.error("Error fetching assigned workouts:", error);
      toast.error("Error al cargar las rutinas asignadas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Asignar una rutina a un estudiante
  const assignWorkout = useCallback(async (data: AssignWorkoutData) => {
    setIsAssigning(true);
    try {
      const res = await fetch("/api/instructors/workouts/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workoutId: data.workoutId,
          studentId: data.studentId,
          dueDate: data.dueDate,
          notes: data.notes,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al asignar la rutina");
      }

      const newAssignedWorkout = await res.json();

      // Actualizar la lista de rutinas asignadas usando el callback para evitar dependencia
      setAssignedWorkouts((prevWorkouts) => {
        const updatedWorkouts = [...prevWorkouts, newAssignedWorkout];
        globalAssignedWorkouts = updatedWorkouts;
        notifySubscribers();
        return updatedWorkouts;
      });

      toast.success("Rutina asignada correctamente");
      return { success: true, workout: newAssignedWorkout };
    } catch (error) {
      console.error("Error assigning workout:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al asignar la rutina",
      );
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Error al asignar la rutina",
      };
    } finally {
      setIsAssigning(false);
    }
  }, []);

  // Actualizar el estado de una rutina asignada
  const updateAssignedWorkout = useCallback(
    async (
      assignmentId: string,
      updates: { status?: string; notes?: string; dueDate?: Date },
    ) => {
      setIsUpdating(true);
      try {
        const res = await fetch(
          `/api/instructors/workouts/assigned/${assignmentId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updates),
          },
        );

        if (res.ok) {
          const updatedWorkout = await res.json();
          globalAssignedWorkouts = globalAssignedWorkouts.map((workout) =>
            workout.id === assignmentId ? updatedWorkout : workout,
          );
          setAssignedWorkouts(globalAssignedWorkouts);
          notifySubscribers();
          toast.success("Rutina actualizada correctamente");
          return updatedWorkout;
        } else {
          const errorData = await res.json();
          throw new Error(errorData.message || "Error al actualizar la rutina");
        }
      } catch (error) {
        console.error("Error updating assigned workout:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Error al actualizar la rutina",
        );
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [],
  );

  // Eliminar una asignación de rutina
  const deleteAssignedWorkout = useCallback(async (assignmentId: string) => {
    try {
      const res = await fetch(
        `/api/instructor/workouts/assigned/${assignmentId}`,
        {
          method: "DELETE",
        },
      );

      if (res.ok) {
        globalAssignedWorkouts = globalAssignedWorkouts.filter(
          (workout) => workout.id !== assignmentId,
        );
        setAssignedWorkouts(globalAssignedWorkouts);
        notifySubscribers();
        toast.success("Asignación de rutina eliminada");
        return true;
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al eliminar la asignación");
      }
    } catch (error) {
      console.error("Error deleting assigned workout:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al eliminar la asignación",
      );
      throw error;
    }
  }, []);

  // Suscribirse a cambios globales
  useEffect(() => {
    const callback = (newWorkouts: AssignedWorkout[]) => {
      setAssignedWorkouts(newWorkouts);
    };
    globalSubscribers.push(callback);
    return () => {
      globalSubscribers = globalSubscribers.filter((cb) => cb !== callback);
    };
  }, []);

  // Cargar datos cuando cambie la sesión
  useEffect(() => {
    if (!session) return;
    fetchAssignedWorkouts();
    fetchStudents();
  }, [session, fetchAssignedWorkouts, fetchStudents]);

  // Actualizar los datos cuando cambie la ruta
  useEffect(() => {
    fetchAssignedWorkouts();
  }, [pathname, fetchAssignedWorkouts]);

  return {
    // Datos
    assignedWorkouts,
    students,

    // Estados de carga
    isLoading,
    isAssigning,
    isUpdating,

    // Métodos
    assignWorkout,
    updateAssignedWorkout,
    deleteAssignedWorkout,
    refreshAssignedWorkouts: fetchAssignedWorkouts,
    refreshStudents: fetchStudents,
  };
}
