"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

export type ProgressRecord = {
  id?: string;
  weight?: number;
  bodyFatPercentage?: number;
  muscleMassPercentage?: number;
  date: Date | string;
  notes?: string;
};

export const useProgress = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progressData, setProgressData] = useState<ProgressRecord[]>([]);

  // Usar useRef para el caché para evitar recreaciones
  const dataCacheRef = useRef<Record<string, ProgressRecord[]>>({});

  // Usar useCallback para evitar recreaciones de funciones
  const fetchProgressData = useCallback(
    async (
      type: "weight" | "bodyFat" | "muscle" | "all" = "all",
      startDate?: string,
      endDate?: string,
    ) => {
      setIsLoading(true);

      // Crear una clave de caché basada en los parámetros
      const cacheKey = `${type}-${startDate || ""}-${endDate || ""}`;

      // Verificar si ya tenemos datos en caché para esta consulta
      if (dataCacheRef.current[cacheKey]) {
        setProgressData(dataCacheRef.current[cacheKey]);
        setIsLoading(false);
        return dataCacheRef.current[cacheKey];
      }

      try {
        let url = `/api/progress?type=${type}`;

        if (startDate) {
          url += `&startDate=${startDate}`;
        }

        if (endDate) {
          url += `&endDate=${endDate}`;
        }

        const response = await fetch(url);

        // Verificar el tipo de contenido de la respuesta
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          // Si no es JSON, lanzar un error más descriptivo
          const text = await response.text();
          console.error("Respuesta no JSON:", text.substring(0, 150) + "...");
          throw new Error(
            "La respuesta del servidor no es JSON válido. Posible problema de autenticación o ruta incorrecta.",
          );
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Error al obtener datos de progreso",
          );
        }

        const data = await response.json();

        // Guardar en caché usando la referencia
        dataCacheRef.current[cacheKey] = data;

        setProgressData(data);
        return data;
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

  // Crear nuevo registro de progreso
  const createProgressRecord = useCallback(
    async (recordData: ProgressRecord) => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(recordData),
        });

        // Verificar el tipo de contenido de la respuesta
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          // Si no es JSON, lanzar un error más descriptivo
          const text = await response.text();
          console.error("Respuesta no JSON:", text.substring(0, 150) + "...");
          throw new Error(
            "La respuesta del servidor no es JSON válido. Posible problema de autenticación o ruta incorrecta.",
          );
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Error al crear registro de progreso",
          );
        }

        const newRecord = await response.json();

        // Limpiar caché después de crear un nuevo registro
        dataCacheRef.current = {};

        toast.success("Registro guardado correctamente");
        setProgressData((prevProgressData) => [...prevProgressData, newRecord]);
        return newRecord;
      } catch (error) {
        console.error("Error al crear registro de progreso:", error);
        toast.error("No se pudo guardar el registro");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Actualizar registro de progreso
  const updateProgressRecord = useCallback(
    async (id: string, recordData: ProgressRecord) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/progress/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(recordData),
        });

        // Verificar el tipo de contenido de la respuesta
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          // Si no es JSON, lanzar un error más descriptivo
          const text = await response.text();
          console.error("Respuesta no JSON:", text.substring(0, 150) + "...");
          throw new Error(
            "La respuesta del servidor no es JSON válido. Posible problema de autenticación o ruta incorrecta.",
          );
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Error al actualizar registro de progreso",
          );
        }

        const updatedRecord = await response.json();

        // Limpiar caché después de actualizar un registro
        dataCacheRef.current = {};

        toast.success("Registro actualizado correctamente");
        setProgressData((prevProgressData) =>
          prevProgressData.map((record) =>
            record.id === updatedRecord.id ? updatedRecord : record,
          ),
        );
        return updatedRecord;
      } catch (error) {
        console.error("Error al actualizar registro de progreso:", error);
        toast.error("No se pudo actualizar el registro");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Eliminar registro de progreso
  const deleteProgressRecord = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/progress/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // Verificar el tipo de contenido de la respuesta
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Error al eliminar registro de progreso",
          );
        } else {
          const text = await response.text();
          console.error("Respuesta no JSON:", text.substring(0, 150) + "...");
          throw new Error("La respuesta del servidor no es JSON válido");
        }
      }

      // Limpiar caché después de eliminar un registro
      dataCacheRef.current = {};

      toast.success("Registro eliminado correctamente");
      setProgressData((prevProgressData) =>
        prevProgressData.filter((record) => record.id !== id),
      );
      return true;
    } catch (error) {
      console.error("Error al eliminar registro de progreso:", error);
      toast.error("No se pudo eliminar el registro");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener estadísticas de progreso (diferencia desde el inicio, promedio, etc.)
  const getProgressStats = useCallback(
    (
      data: ProgressRecord[] | undefined,
      type: "weight" | "bodyFat" | "muscle",
    ) => {
      // Handle undefined or empty data
      if (!data || data.length === 0) {
        return {
          change: 0,
          percentChange: 0,
          average: 0,
        };
      }

      // Filter out any undefined or invalid records
      const validData = data.filter(
        (record): record is ProgressRecord =>
          record !== undefined && record.date !== undefined,
      );

      if (validData.length < 2) {
        const firstRecord = validData[0];
        const firstValue = firstRecord ? getValue(firstRecord, type) : 0;
        return {
          change: 0,
          percentChange: 0,
          average: firstValue,
        };
      }

      // Sort the valid data
      const sortedData = [...validData].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      // Get first and last records (we know they exist since we have at least 2 items)
      const first = sortedData[0];
      const last = sortedData[sortedData.length - 1];

      // Add safety checks in case the type system doesn't recognize our array bounds check
      if (!first || !last) {
        return {
          change: 0,
          percentChange: 0,
          average: 0,
        };
      }

      const firstValue = getValue(first, type);
      const lastValue = getValue(last, type);

      // Calcular promedio
      const sum = sortedData.reduce(
        (acc, record) => acc + (getValue(record, type) || 0),
        0,
      );
      const average = sum / sortedData.length;

      // Calcular cambio
      const change = lastValue - firstValue;
      const percentChange = firstValue !== 0 ? (change / firstValue) * 100 : 0;

      return {
        change,
        percentChange,
        average,
      };
    },
    [],
  );

  // Función auxiliar para obtener el valor correspondiente según el tipo
  const getValue = (
    record: ProgressRecord,
    type: "weight" | "bodyFat" | "muscle",
  ) => {
    switch (type) {
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

  return {
    isLoading,
    progressData,
    fetchProgressData,
    createProgressRecord,
    updateProgressRecord,
    deleteProgressRecord,
    getProgressStats,
  };
};
