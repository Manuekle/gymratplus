"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface WaterIntakeHistory {
  date: string;
  liters: number;
}

export function useWaterIntake() {
  const { data: session } = useSession();
  const [intake, setIntake] = useState<number>(0);
  const [targetIntake, setTargetIntake] = useState<number>(2.5); // Default target
  const [history, setHistory] = useState<WaterIntakeHistory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIntake = useCallback(
    async (date?: string) => {
      if (!session?.user) return;

      try {
        setIsLoading(true);
        const dateParam = date ? `?date=${date}` : "";
        const response = await fetch(`/api/water-intake${dateParam}`);

        if (!response.ok) {
          throw new Error("Error al obtener el consumo de agua");
        }

        const data = await response.json();
        setIntake(data.intake);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        toast({
          title: "Error",
          description: "No se pudo cargar el consumo de agua",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [session]
  );

  const fetchHistory = useCallback(async () => {
    if (!session?.user) return;

    try {
      setIsHistoryLoading(true);
      const response = await fetch("/api/water-intake/history");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al obtener el historial de consumo de agua"
        );
      }

      const data = await response.json();

      // Ensure data is an array
      if (Array.isArray(data)) {
        setHistory(data);
      } else {
        console.error("History data is not an array:", data);
        setHistory([]);
      }
    } catch (err) {
      console.error("Error fetching water intake history:", err);
      toast.error("Error", {
        description:
          err instanceof Error
            ? err.message
            : "Error al obtener el historial de consumo de agua",
      });

      // Set empty history to avoid rendering issues
      setHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [session]);

  const fetchTargetIntake = useCallback(async () => {
    if (!session?.user) return;

    try {
      const response = await fetch("/api/profile");

      if (response.status === 404) {
        // Profile not found, use default value
        console.log("Profile not found, using default water intake target");
        return;
      }

      if (!response.ok) {
        throw new Error("Error al obtener el perfil");
      }

      const data = await response.json();
      if (data.waterIntake) {
        setTargetIntake(data.waterIntake);
      }
    } catch (err) {
      console.error("Error fetching target water intake:", err);
      // Continue with default value
    }
  }, [session]);

  const updateIntake = useCallback(
    async (newIntake: number) => {
      if (!session?.user) return;

      try {
        // Ensure newIntake is a valid number
        if (isNaN(newIntake) || newIntake < 0) {
          throw new Error("Valor de consumo inválido");
        }

        setIsUpdating(true);
        const response = await fetch("/api/water-intake", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ intake: Number(newIntake) }), // Ensure it's a number
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Error al actualizar el consumo de agua"
          );
        }

        setIntake(newIntake);

        // Refresh history after update
        fetchHistory();

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        // toast({
        //   title: "Error",
        //   description:
        //     err instanceof Error
        //       ? err.message
        //       : "No se pudo actualizar el consumo de agua",
        //   variant: "destructive",
        // });
        toast.error("Error", {
          description:
            err instanceof Error
              ? err.message
              : "No se pudo actualizar el consumo de agua",
        });
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [session, fetchHistory]
  );

  const addWater = useCallback(
    async (amount = 0.25) => {
      const validAmount =
        typeof amount === "number" && !isNaN(amount) ? amount : 0.25;
      const newIntake = Math.min(10, intake + validAmount); // Limitar a 10 litros
      // console.log("Agregar L", newIntake);
      return updateIntake(newIntake);
    },
    [intake, updateIntake]
  );

  const removeWater = useCallback(
    async (amount = 0.25) => {
      const validAmount =
        typeof amount === "number" && !isNaN(amount) ? amount : 0.25;
      const newIntake = Math.min(10, intake - validAmount); // Limitar a 10 litros
      // console.log("Agregar L", newIntake);
      return updateIntake(newIntake);
    },
    [intake, updateIntake]
  );

  useEffect(() => {
    if (session?.user) {
      fetchIntake();
      fetchHistory();
      fetchTargetIntake();
    }
  }, [session, fetchIntake, fetchHistory, fetchTargetIntake]);

  return {
    intake,
    targetIntake,
    history,
    isLoading,
    isHistoryLoading,
    isUpdating,
    error,
    addWater,
    removeWater,
    updateIntake,
    fetchIntake,
    fetchHistory,
  };
}
