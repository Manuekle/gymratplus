import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export interface AssignedWorkout {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  instructorId?: string;
  instructor?: {
    id: string;
    name: string;
    email: string;
  };
  assignedToId: string;
  assignedDate: string;
  dueDate?: string;
  status?: string;
  notes?: string;
  exercises: Array<{
    id: string;
    exerciseId: string;
    sets: number;
    reps: number;
    weight?: number;
    restTime?: number;
    order: number;
    notes?: string;
    exercise: {
      id: string;
      name: string;
      muscleGroup: string;
      equipment?: string;
      videoUrl?: string;
      imageUrl?: string;
    };
  }>;
}

export function useAssignedWorkouts() {
  const [isLoading, setIsLoading] = useState(true);
  const [assignedWorkouts, setAssignedWorkouts] = useState<AssignedWorkout[]>([]);
  const { data: session } = useSession();

  const fetchAssignedWorkouts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/students/workouts/assigned');
      if (res.ok) {
        const data = await res.json();
        setAssignedWorkouts(data);
      } else {
        throw new Error('Error al obtener rutinas asignadas');
      }
    } catch (error) {
      console.error('Error fetching assigned workouts:', error);
      toast.error('Error al cargar tus rutinas asignadas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchAssignedWorkouts();
    }
  }, [session?.user?.id, fetchAssignedWorkouts]);

  return {
    assignedWorkouts,
    isLoading,
    refreshAssignedWorkouts: fetchAssignedWorkouts,
  };
} 