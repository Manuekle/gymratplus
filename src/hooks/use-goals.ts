"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";

export type GoalType = "weight" | "strength" | "measurement" | "activity";
export type GoalStatus = "active" | "completed" | "abandoned";

export interface GoalProgress {
  id?: string;
  goalId: string;
  value: number;
  date: Date | string;
  notes?: string;
  createdAt?: Date | string;
}

export interface Goal {
  id?: string;
  type: GoalType;
  title: string;
  description?: string;
  targetValue?: number;
  currentValue?: number;
  initialValue?: number;
  unit?: string;
  exerciseType?: string;
  measurementType?: string;
  startDate: Date | string;
  targetDate?: Date | string;
  completedDate?: Date | string;
  status: GoalStatus;
  progress?: number;
  progressUpdates?: GoalProgress[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export function useGoals() {
  const [isLoading, setIsLoading] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);

  // Usar useRef para el caché para evitar recreaciones
  const dataCacheRef = useRef<Record<string, Goal[]>>({});

  // Obtener todos los objetivos o filtrar por tipo/estado
  const fetchGoals = useCallback(
    async (type?: GoalType, status?: GoalStatus) => {
      setIsLoading(true);

      // Crear una clave de caché basada en los parámetros
      const cacheKey = `${type || "all"}-${status || "all"}`;

      // Verificar si ya tenemos datos en caché para esta consulta
      if (dataCacheRef.current[cacheKey]) {
        setGoals(dataCacheRef.current[cacheKey]);
        setIsLoading(false);
        return dataCacheRef.current[cacheKey];
      }

      try {
        let url = `/api/goals`;
        const params = new URLSearchParams();

        if (type) params.append("type", type);
        if (status) params.append("status", status);

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        console.log("Fetching goals from:", url);
        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: `Error HTTP: ${response.status}` }));
          throw new Error(
            errorData.error || `Error al obtener objetivos: ${response.status}`,
          );
        }

        const data = await response.json();
        console.log("Goals data received:", data);

        // Verificar que data es un array
        if (!Array.isArray(data)) {
          console.error("La respuesta no es un array:", data);
          throw new Error("Formato de respuesta inválido");
        }

        // Guardar en caché
        dataCacheRef.current[cacheKey] = data;

        setGoals(data);
        return data;
      } catch (error) {
        console.error("Error al cargar objetivos:", error);
        toast.error(
          "No se pudieron cargar los objetivos: " +
            (error instanceof Error ? error.message : "Error desconocido"),
        );
        setGoals([]);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Obtener un objetivo específico
  const fetchGoal = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/goals/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener objetivo");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al cargar objetivo:", error);
      toast.error("No se pudo cargar el objetivo");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Crear un nuevo objetivo
  const createGoal = useCallback(async (goalData: Goal) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear objetivo");
      }

      const newGoal = await response.json();

      // Limpiar caché
      dataCacheRef.current = {};

      toast.success("Objetivo creado correctamente");
      setGoals((prevGoals) => [...prevGoals, newGoal]);
      return newGoal;
    } catch (error) {
      console.error("Error al crear objetivo:", error);
      toast.error("No se pudo crear el objetivo");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Actualizar un objetivo
  const updateGoal = useCallback(
    async (id: string, goalData: Partial<Goal>) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/goals/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(goalData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al actualizar objetivo");
        }

        const updatedGoal = await response.json();

        // Limpiar caché
        dataCacheRef.current = {};

        toast.success("Objetivo actualizado correctamente");
        setGoals((prevGoals) =>
          prevGoals.map((goal) =>
            goal.id === updatedGoal.id ? updatedGoal : goal,
          ),
        );
        return updatedGoal;
      } catch (error) {
        console.error("Error al actualizar objetivo:", error);
        toast.error("No se pudo actualizar el objetivo");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Eliminar un objetivo
  const deleteGoal = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar objetivo");
      }

      // Limpiar caché
      dataCacheRef.current = {};

      toast.success("Objetivo eliminado correctamente");
      setGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== id));
      return true;
    } catch (error) {
      console.error("Error al eliminar objetivo:", error);
      toast.error("No se pudo eliminar el objetivo");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Añadir una actualización de progreso
  const addProgressUpdate = useCallback(
    async (goalId: string, progressData: Omit<GoalProgress, "goalId">) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/goals/${goalId}/progress`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(progressData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Error al añadir actualización de progreso",
          );
        }

        const newProgressUpdate = await response.json();

        // Limpiar caché
        dataCacheRef.current = {};

        toast.success("Progreso actualizado correctamente");
        setGoals((prevGoals) =>
          prevGoals.map((goal) =>
            goal.id === goalId
              ? {
                  ...goal,
                  progressUpdates: [
                    ...(goal.progressUpdates || []),
                    newProgressUpdate,
                  ],
                }
              : goal,
          ),
        );
        return newProgressUpdate;
      } catch (error) {
        console.error("Error al añadir actualización de progreso:", error);
        toast.error("No se pudo actualizar el progreso");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Obtener actualizaciones de progreso de un objetivo
  const fetchProgressUpdates = useCallback(async (goalId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/goals/${goalId}/progress`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al obtener actualizaciones de progreso",
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al cargar actualizaciones de progreso:", error);
      toast.error("No se pudieron cargar las actualizaciones de progreso");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar objetivos automáticamente al montar el componente
  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return {
    isLoading,
    goals,
    fetchGoals,
    fetchGoal,
    createGoal,
    updateGoal,
    deleteGoal,
    addProgressUpdate,
    fetchProgressUpdates,
  };
}
