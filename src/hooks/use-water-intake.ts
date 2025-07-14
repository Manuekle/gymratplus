"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  const [pendingHistoryUpdate, setPendingHistoryUpdate] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

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

        toast.error("Error", {
          description: "No se pudo cargar el consumo de agua",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [session],
  );

  const fetchHistory = useCallback(async () => {
    if (!session?.user) return;

    try {
      setIsHistoryLoading(true);
      const response = await fetch("/api/water-intake/history");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al obtener el historial de consumo de agua",
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
      if (!session?.user) return false;

      try {
        // Ensure newIntake is a valid number
        if (isNaN(newIntake) || newIntake < 0) {
          throw new Error("Valor de consumo inválido");
        }

        // Optimistic update
        const previousIntake = intake;
        setIntake(newIntake);

        // --- Actualiza el history en memoria para el día actual (optimista) ---
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;
        setHistory((prev) => {
          const found = prev.find((h) => h.date === todayStr);
          if (found) {
            return prev.map((h) => h.date === todayStr ? { ...h, liters: newIntake } : h);
          } else {
            return [...prev, { date: todayStr, liters: newIntake }];
          }
        });
        // ---------------------------------------------------------------

        setIsUpdating(true);
        const response = await fetch("/api/water-intake", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ intake: Number(newIntake) }),
        });

        if (!response.ok) {
          // Revert on error
          setIntake(previousIntake);
          // Revert history también
          setHistory((prev) => {
            const found = prev.find((h) => h.date === todayStr);
            if (found) {
              return prev.map((h) => h.date === todayStr ? { ...h, liters: previousIntake } : h);
            } else {
              return prev;
            }
          });
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Error al actualizar el consumo de agua",
          );
        }

        // En vez de fetchHistory inmediato, marcamos que hay actualización pendiente
        setPendingHistoryUpdate(true);

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        toast.error("Error", {
          description: errorMessage,
        });
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [session, intake],
  );

  const addWater = useCallback(
    async (amount = 0.25) => {
      const validAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0.25;
      const newIntake = Math.min(10, intake + validAmount); // Limitar a 10 litros
      return updateIntake(Number(newIntake.toFixed(2))); // Ensure 2 decimal places
    },
    [intake, updateIntake],
  );

  const removeWater = useCallback(
    async (amount = 0.25) => {
      const validAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0.25;
      const newIntake = Math.max(0, intake - validAmount); // Don't go below 0
      return updateIntake(Number(newIntake.toFixed(2))); // Ensure 2 decimal places
    },
    [intake, updateIntake],
  );

  useEffect(() => {
    if (session?.user) {
      fetchIntake();
      fetchHistory();
      fetchTargetIntake();
    }
  }, [session, fetchIntake, fetchHistory, fetchTargetIntake]);

  // Debounce para actualizar el historial solo después de 1s sin cambios
  useEffect(() => {
    if (!pendingHistoryUpdate) return;
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchHistory().catch(console.error);
      setPendingHistoryUpdate(false);
    }, 1000);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [pendingHistoryUpdate, fetchHistory]);

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
