"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

export type ExerciseProgressRecord = {
  id?: string;
  benchPress?: number;
  squat?: number;
  deadlift?: number;
  date: Date | string;
  notes?: string;
};

export const useExerciseProgress = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progressData, setProgressData] = useState<ExerciseProgressRecord[]>(
    []
  );

  // Usar useRef para el caché para evitar recreaciones
  const dataCacheRef = useRef<Record<string, ExerciseProgressRecord[]>>({});

  // Usar useCallback para evitar recreaciones de funciones
  const fetchExerciseProgressData = useCallback(
    async (
      exercise: "benchPress" | "squat" | "deadlift" | "all" = "all",
      startDate?: string,
      endDate?: string
    ) => {
      setIsLoading(true);

      // Crear una clave de caché basada en los parámetros
      const cacheKey = `${exercise}-${startDate || ""}-${endDate || ""}`;

      // Verificar si ya tenemos datos en caché para esta consulta
      if (dataCacheRef.current[cacheKey]) {
        setProgressData(dataCacheRef.current[cacheKey]);
        setIsLoading(false);
        return dataCacheRef.current[cacheKey];
      }

      try {
        let url = `/api/exercise-progress?exercise=${exercise}`;

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
            "La respuesta del servidor no es JSON válido. Posible problema de autenticación o ruta incorrecta."
          );
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              "Error al obtener datos de progreso de ejercicios"
          );
        }

        const data = await response.json();

        // Guardar en caché usando la referencia
        dataCacheRef.current[cacheKey] = data;

        setProgressData(data);
        return data;
      } catch (error) {
        console.error(
          "Error al cargar datos de progreso de ejercicios:",
          error
        );
        toast.error(
          "No se pudieron cargar los datos de progreso de ejercicios"
        );
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Crear nuevo registro de progreso
  const createExerciseProgressRecord = useCallback(
    async (recordData: ExerciseProgressRecord) => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/exercise-progress", {
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
            "La respuesta del servidor no es JSON válido. Posible problema de autenticación o ruta incorrecta."
          );
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              "Error al crear registro de progreso de ejercicios"
          );
        }

        const newRecord = await response.json();

        // Limpiar caché después de crear un nuevo registro
        dataCacheRef.current = {};

        toast.success("Registro guardado correctamente");
        window.location.reload();
        return newRecord;
      } catch (error) {
        console.error(
          "Error al crear registro de progreso de ejercicios:",
          error
        );
        toast.error("No se pudo guardar el registro");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Actualizar registro de progreso
  const updateExerciseProgressRecord = useCallback(
    async (id: string, recordData: ExerciseProgressRecord) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/exercise-progress/${id}`, {
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
            "La respuesta del servidor no es JSON válido. Posible problema de autenticación o ruta incorrecta."
          );
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              "Error al actualizar registro de progreso de ejercicios"
          );
        }

        const updatedRecord = await response.json();

        // Limpiar caché después de actualizar un registro
        dataCacheRef.current = {};

        toast.success("Registro actualizado correctamente");
        window.location.reload();
        return updatedRecord;
      } catch (error) {
        console.error(
          "Error al actualizar registro de progreso de ejercicios:",
          error
        );
        toast.error("No se pudo actualizar el registro");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Eliminar registro de progreso
  const deleteExerciseProgressRecord = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/exercise-progress/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // Verificar el tipo de contenido de la respuesta
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              "Error al eliminar registro de progreso de ejercicios"
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
      window.location.reload();
      return true;
    } catch (error) {
      console.error(
        "Error al eliminar registro de progreso de ejercicios:",
        error
      );
      toast.error("No se pudo eliminar el registro");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener estadísticas de progreso (diferencia desde el inicio, promedio, etc.)
  const getExerciseProgressStats = useCallback(
    (
      data: ExerciseProgressRecord[],
      exercise: "benchPress" | "squat" | "deadlift"
    ) => {
      if (!data || data.length < 2) {
        return {
          change: 0,
          percentChange: 0,
          average: data && data.length > 0 ? getValue(data[0], exercise) : 0,
        };
      }

      const sortedData = [...data].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      const first = sortedData[0];
      const last = sortedData[sortedData.length - 1];

      const firstValue = getValue(first, exercise);
      const lastValue = getValue(last, exercise);

      // Calcular promedio
      const sum = sortedData.reduce(
        (acc, record) => acc + (getValue(record, exercise) || 0),
        0
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
    []
  );

  // Función auxiliar para obtener el valor correspondiente según el ejercicio
  const getValue = (
    record: ExerciseProgressRecord,
    exercise: "benchPress" | "squat" | "deadlift"
  ) => {
    switch (exercise) {
      case "benchPress":
        return record.benchPress || 0;
      case "squat":
        return record.squat || 0;
      case "deadlift":
        return record.deadlift || 0;
      default:
        return 0;
    }
  };

  return {
    isLoading,
    progressData,
    fetchExerciseProgressData,
    createExerciseProgressRecord,
    updateExerciseProgressRecord,
    deleteExerciseProgressRecord,
    getExerciseProgressStats,
  };
};
