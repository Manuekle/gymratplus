import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export interface Instructor {
  id: string;
  userId: string;
  name: string;
  image?: string;
  bio?: string;
  curriculum?: string;
  pricePerMonth?: number;
  contactEmail?: string;
  contactPhone?: string;
  country?: string;
  city?: string;
  isRemote?: boolean;
  status: string;
  startDate?: string;
}

// Estado global para los instructores
let globalInstructors: Instructor[] = [];
let globalSubscribers: ((instructors: Instructor[]) => void)[] = [];

const notifySubscribers = () => {
  globalSubscribers.forEach((callback) => callback(globalInstructors));
};

export function useMyInstructors() {
  const [isLoading, setIsLoading] = useState(true);
  const [instructors, setInstructors] = useState<Instructor[]>(globalInstructors);
  const { data: session } = useSession();

  const fetchInstructors = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/students/my-instructors");
      if (res.ok) {
        const data = await res.json();
        globalInstructors = data;
        setInstructors(data);
        notifySubscribers();
      } else {
        throw new Error("Error al obtener los instructores");
      }
    } catch (error) {
      console.error("Error fetching instructors:", error);
      toast.error("Error al cargar los instructores");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Suscribirse a cambios globales
  useEffect(() => {
    const callback = (newInstructors: Instructor[]) => {
      setInstructors(newInstructors);
    };
    globalSubscribers.push(callback);
    return () => {
      globalSubscribers = globalSubscribers.filter((cb) => cb !== callback);
    };
  }, []);

  // Cargar instructores cuando cambie la sesión
  useEffect(() => {
    if (!session) return;
    fetchInstructors();
  }, [session, fetchInstructors]);

  return {
    instructors,
    isLoading,
    refreshInstructors: fetchInstructors,
  };
} 