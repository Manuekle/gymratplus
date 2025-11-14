"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

interface WorkoutSession {
  id: string;
  date: string;
  notes?: string;
  exercises: {
    [key: string]: {
      weight: number;
      reps: number;
    };
  };
}

interface ExerciseSet {
  reps: number;
  weight: number;
}

interface WorkoutExercise {
  name: string;
  sets: ExerciseSet[];
}

export type ExerciseProgressRecord = {
  id?: string;
  exercises: {
    [key: string]: {
      weight: number;
      reps: number;
    };
  };
  date: Date | string;
  notes?: string;
};

export const useExerciseProgress = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progressData, setProgressData] = useState<ExerciseProgressRecord[]>(
    [],
  );

  // Usar useRef para el caché para evitar recreaciones
  const dataCacheRef = useRef<Record<string, ExerciseProgressRecord[]>>({});

  // Usar useCallback para evitar recreaciones de funciones
  const fetchExerciseProgressData = useCallback(
    async (exercise: string = "all", startDate?: string, endDate?: string) => {
      console.log("Fetching exercise progress data...", {
        exercise,
        startDate,
        endDate,
      });
      setIsLoading(true);

      // Si no se proporcionan fechas, obtener todos los ejercicios sin filtrar por fecha
      if (!startDate && !endDate) {
        console.log("No date range provided, fetching all exercises");
      }
      // Si se proporciona alguna fecha, validar que ambas estén presentes
      else if ((startDate && !endDate) || (!startDate && endDate)) {
        const error = new Error(
          "Debes proporcionar tanto la fecha de inicio como la de fin",
        );
        console.error("Date validation error:", error);
        toast.error(
          "Error: Debes proporcionar tanto la fecha de inicio como la de fin",
        );
        setIsLoading(false);
        throw error;
      }

      // Crear una clave de caché basada en los parámetros
      const cacheKey = `${exercise}-${startDate || ""}-${endDate || ""}`;
      console.log("Cache key:", cacheKey);

      // Verificar si ya tenemos datos en caché para esta consulta
      if (dataCacheRef.current[cacheKey]) {
        console.log("Using cached data for key:", cacheKey);
        setProgressData(dataCacheRef.current[cacheKey]);
        setIsLoading(false);
        return dataCacheRef.current[cacheKey];
      }

      try {
        let url = `/api/workout-sessions`;

        // Función para formatear fechas al formato YYYY-MM-DD
        const formatDate = (dateString: string): string => {
          try {
            // Si ya está en formato YYYY-MM-DD, devolverlo tal cual
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
              return dateString;
            }

            // Si es una fecha ISO, extraer solo la parte de la fecha
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
              throw new Error("Fecha inválida");
            }

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");

            return `${year}-${month}-${day}`;
          } catch (error) {
            console.error("Error formateando fecha:", error);
            throw new Error(
              "Formato de fecha inválido. Usa el formato YYYY-MM-DD",
            );
          }
        };

        // Solo agregar parámetros de fecha si ambos están presentes
        if (startDate && endDate) {
          const formattedStartDate = formatDate(startDate);
          const formattedEndDate = formatDate(endDate);
          url += `?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
        }

        console.log("Making API request to:", url);

        // Este bloque ya no es necesario ya que lo manejamos arriba

        console.log("Making fetch request...");
        const response = await fetch(url);
        console.log("Response status:", response.status, response.statusText);

        // Verificar el tipo de contenido de la respuesta
        const contentType = response.headers.get("content-type");
        console.log("Response content type:", contentType);

        if (!contentType || !contentType.includes("application/json")) {
          // Si no es JSON, lanzar un error más descriptivo
          const text = await response.text();
          console.error("Respuesta no JSON:", text.substring(0, 150) + "...");
          throw new Error(
            `La respuesta del servidor no es JSON válido (${response.status} ${response.statusText}). ${text.substring(0, 100)}...`,
          );
        }

        if (!response.ok) {
          let errorMessage = `Error ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            console.error("Error response data:", errorData);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            console.error("Error parsing error response:", e);
          }
          throw new Error(
            `Error al obtener datos de progreso: ${errorMessage}`,
          );
        }

        const responseData = await response.json();
        console.log("API Response data:", responseData);

        try {
          // Manejar respuesta con paginación (objeto con data) o array directo
          let data: WorkoutSession[];
          if (
            responseData &&
            typeof responseData === "object" &&
            "data" in responseData
          ) {
            // Nueva estructura con paginación
            data = Array.isArray(responseData.data) ? responseData.data : [];
          } else if (Array.isArray(responseData)) {
            // Estructura antigua (array directo)
            data = responseData;
          } else {
            throw new Error(
              `Se esperaba un array o un objeto con 'data' pero se recibió: ${typeof responseData}`,
            );
          }

          // Transformar los datos para que coincidan con el formato esperado
          const transformedData = (data as WorkoutSession[])
            .map((session) => {
              if (!session || typeof session !== "object") {
                console.error("Sesión inválida:", session);
                return null;
              }

              const transformed = {
                id: session.id || "",
                date: session.date || new Date().toISOString(),
                notes: session.notes || "",
                exercises: session.exercises || {},
              };

              console.log("Transformed session:", transformed);
              return transformed;
            })
            .filter(Boolean) as ExerciseProgressRecord[]; // Filtrar valores nulos

          console.log("Transformed data:", transformedData);
          dataCacheRef.current[cacheKey] = transformedData;
          setProgressData(transformedData);
          return transformedData;
        } catch (transformError) {
          console.error("Error transformando los datos:", transformError);
          toast.error("Error al procesar los datos recibidos");
          throw new Error(`Error al procesar los datos: ${transformError}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error desconocido";
        console.error(
          "Error al cargar datos de progreso de ejercicios:",
          error,
        );

        // Mostrar mensaje de error más específico
        if (errorMessage.includes("Failed to fetch")) {
          toast.error(
            "No se pudo conectar al servidor. Verifica tu conexión a internet.",
          );
        } else if (errorMessage.includes("401")) {
          toast.error(
            "No estás autenticado. Por favor, inicia sesión nuevamente.",
          );
        } else if (errorMessage.includes("404")) {
          toast.error(
            "No se encontró el recurso solicitado. Por favor, verifica la URL.",
          );
        } else {
          toast.error(`Error al cargar datos: ${errorMessage}`);
        }

        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Crear nuevo registro de progreso
  const createExerciseProgressRecord = useCallback(
    async (recordData: ExerciseProgressRecord) => {
      setIsLoading(true);
      try {
        // Primero, intentar obtener el entrenamiento por defecto
        const response = await fetch("/api/workout-sessions/init", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Error al inicializar el entrenamiento por defecto");
        }

        const defaultWorkout = await response.json();

        // Transformar los datos al formato esperado por la API
        const exercises: WorkoutExercise[] = Object.entries(
          recordData.exercises,
        ).map(([name, data]) => ({
          name,
          sets: [{ reps: data.reps, weight: data.weight }],
        }));

        // Ahora crear el registro de progreso
        const createResponse = await fetch("/api/workout-sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: recordData.date,
            notes: recordData.notes,
            workoutId: defaultWorkout.id,
            exercises,
          }),
        });

        // Verificar el tipo de contenido de la respuesta
        const contentType = createResponse.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          // Si no es JSON, lanzar un error más descriptivo
          const text = await createResponse.text();
          console.error("Respuesta no JSON:", text.substring(0, 150) + "...");
          throw new Error(
            "La respuesta del servidor no es JSON válido. Posible problema de autenticación o ruta incorrecta.",
          );
        }

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          throw new Error(
            errorData.error ||
              "Error al crear registro de progreso de ejercicios",
          );
        }

        const newRecord = await createResponse.json();

        // Limpiar caché después de crear un nuevo registro
        dataCacheRef.current = {};

        toast.success("Registro guardado correctamente");
        return newRecord;
      } catch (error) {
        console.error(
          "Error al crear registro de progreso de ejercicios:",
          error,
        );
        toast.error("No se pudo guardar el registro");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Actualizar registro de progreso
  const updateExerciseProgressRecord = useCallback(
    async (id: string, recordData: ExerciseProgressRecord) => {
      setIsLoading(true);
      try {
        // Transformar los datos al formato esperado por la API
        const exercises: WorkoutExercise[] = Object.entries(
          recordData.exercises,
        ).map(([name, data]) => ({
          name,
          sets: [{ reps: data.reps, weight: data.weight }],
        }));

        const response = await fetch(`/api/workout-sessions/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: recordData.date,
            notes: recordData.notes,
            exercises,
          }),
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
            errorData.error ||
              "Error al actualizar registro de progreso de ejercicios",
          );
        }

        const updatedRecord = await response.json();

        // Limpiar caché después de actualizar un registro
        dataCacheRef.current = {};

        toast.success("Registro actualizado correctamente");
        return updatedRecord;
      } catch (error) {
        console.error(
          "Error al actualizar registro de progreso de ejercicios:",
          error,
        );
        toast.error("No se pudo actualizar el registro");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Eliminar registro de progreso
  const deleteExerciseProgressRecord = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/workout-sessions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // Verificar el tipo de contenido de la respuesta
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              "Error al eliminar registro de progreso de ejercicios",
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
      return true;
    } catch (error) {
      console.error(
        "Error al eliminar registro de progreso de ejercicios:",
        error,
      );
      toast.error("No se pudo eliminar el registro");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener estadísticas de progreso (diferencia desde el inicio, promedio, etc.)
  const getExerciseProgressStats = useCallback(
    (exercise: string) => {
      const exerciseData = progressData
        .filter((record) => record.exercises?.[exercise])
        .map((record) => {
          const exerciseData = record.exercises[exercise];
          if (!exerciseData) return null;
          return {
            date: new Date(record.date),
            weight: exerciseData.weight,
            reps: exerciseData.reps,
          };
        })
        .filter(
          (record): record is { date: Date; weight: number; reps: number } =>
            record !== null,
        )
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      if (exerciseData.length < 2) return null;

      const first = exerciseData[0];
      const last = exerciseData[exerciseData.length - 1];

      if (!first || !last) return null;

      const change = last.weight - first.weight;
      const percentageChange =
        first.weight > 0 ? (change / first.weight) * 100 : 0;

      return {
        first: first.weight,
        last: last.weight,
        change,
        percentageChange,
        lastReps: last.reps,
      };
    },
    [progressData],
  );

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
