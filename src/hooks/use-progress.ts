"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

export type ProgressRecord = {
  id?: string;
  weight?: number;
  bodyFatPercentage?: number;
  muscleMassPercentage?: number;
  date: Date | string;
  originalDate?: Date | string; // Added for compatibility with ProgressChart
  notes?: string;
};

export const useProgress = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progressData, setProgressData] = useState<ProgressRecord[]>([]);
  const dataCacheRef = useRef<Record<string, ProgressRecord[]>>({});

  const fetchProgressData = useCallback(
    async (
      type: "weight" | "bodyFat" | "muscle" | "all" = "all",
      startDate?: string,
      endDate?: string,
    ) => {
      setIsLoading(true);
      const cacheKey = `${type}-${startDate || ""}-${endDate || ""}`;

      if (dataCacheRef.current[cacheKey]) {
        setProgressData(dataCacheRef.current[cacheKey]);
        setIsLoading(false);
        return dataCacheRef.current[cacheKey];
      }

      try {
        let url = `/api/progress?type=${type}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;

        const response = await fetch(url);
        const contentType = response.headers.get("content-type");

        if (!contentType?.includes("application/json")) {
          const text = await response.text();
          console.error("Respuesta no JSON:", text.substring(0, 150) + "...");
          throw new Error("La respuesta del servidor no es JSON válido");
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Error al obtener datos de progreso",
          );
        }

        const data = await response.json();

        // Ensure all records have originalDate for compatibility
        const processedData = data.map((record: ProgressRecord) => ({
          ...record,
          originalDate: record.date,
        }));

        dataCacheRef.current[cacheKey] = processedData;
        setProgressData(processedData);
        return processedData;
      } catch (error) {
        console.error("Error al cargar datos de progreso:", error);
        toast.error("No se pudieron cargar los datos de progreso");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const clearCache = useCallback(() => {
    dataCacheRef.current = {};
    setProgressData([]);
  }, []);

  const createProgressRecord = useCallback(
    async (recordData: Omit<ProgressRecord, "id">) => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recordData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al crear el registro");
        }

        clearCache();
        const newRecord = await response.json();
        toast.success("Registro guardado exitosamente");
        return newRecord;
      } catch (error) {
        console.error("Error al crear registro de progreso:", error);
        toast.error("Error al guardar el registro");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [clearCache],
  );

  const updateProgressRecord = useCallback(
    async (id: string, recordData: Partial<ProgressRecord>) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/progress/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recordData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al actualizar el registro");
        }

        clearCache();
        const updatedRecord = await response.json();
        toast.success("Registro actualizado exitosamente");
        return updatedRecord;
      } catch (error) {
        console.error("Error al actualizar registro de progreso:", error);
        toast.error("Error al actualizar el registro");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [clearCache],
  );

  const deleteProgressRecord = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/progress/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al eliminar el registro");
        }

        clearCache();
        toast.success("Registro eliminado exitosamente");
        return true;
      } catch (error) {
        console.error("Error al eliminar registro de progreso:", error);
        toast.error("Error al eliminar el registro");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [clearCache],
  );

  const getProgressStats = useCallback(
    (data: ProgressRecord[], type: "weight" | "bodyFat" | "muscle") => {
      if (!data || data.length === 0) {
        return {
          change: 0,
          percentChange: 0,
          average: 0,
        };
      }

      const validData = data.filter(
        (record) =>
          record !== undefined &&
          record.date !== undefined &&
          (type === "weight"
            ? record.weight !== undefined
            : type === "bodyFat"
              ? record.bodyFatPercentage !== undefined
              : record.muscleMassPercentage !== undefined),
      );

      if (validData.length === 0) {
        return {
          change: 0,
          percentChange: 0,
          average: 0,
        };
      }

      const sortedData = [...validData].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      const first = sortedData[0];
      const last = sortedData[sortedData.length - 1];

      const getValue = (record: ProgressRecord, t: typeof type): number => {
        switch (t) {
          case "weight":
            return record.weight || 0;
          case "bodyFat":
            return record.bodyFatPercentage || 0;
          case "muscle":
            return record.muscleMassPercentage || 0;
          default:
            return 0;
        }
      };

      const firstValue = getValue(first, type);
      const lastValue = getValue(last, type);
      const sum = sortedData.reduce(
        (acc, record) => acc + getValue(record, type),
        0,
      );
      const average = sum / sortedData.length;
      const change = lastValue - firstValue;
      const percentChange = firstValue !== 0 ? (change / firstValue) * 100 : 0;

      return {
        change,
        percentChange,
        average,
        current: lastValue,
        isPositive: type === "muscle" ? change > 0 : change < 0,
      };
    },
    [],
  );

  return {
    progressData,
    isLoading,
    fetchProgressData,
    createProgressRecord,
    updateProgressRecord,
    deleteProgressRecord,
    getProgressStats,
    clearCache,
  };
};
