/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { DropletIcon } from "hugeicons-react";

interface WaterLogProps {
  waterIntake?: number;
}

interface ApiResponse {
  waterIntake: number;
  success: boolean;
  message?: string;
}

const MAX_WATER_INTAKE = 8; // 8 gotas = 4L (cada gota es 0.5L)

/** Componente principal */
export default function WaterLog({
  waterIntake: initialWaterIntake = 0,
}: WaterLogProps) {
  const [waterIntake, setWaterIntake] = useState<number>(initialWaterIntake);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Obtiene la fecha en formato YYYY-MM-DD
  const getCurrentDate = () => new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchCurrentWaterIntake();

    // Verifica cada minuto si es un nuevo día
    const timer = setInterval(() => {
      const savedDate = localStorage.getItem("lastWaterUpdate");
      if (savedDate !== getCurrentDate()) {
        resetWaterIntake();
      }
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  /** Obtiene el consumo actual de agua de la API */
  const fetchCurrentWaterIntake = async () => {
    try {
      const response = await fetch("/api/profile/water");
      if (!response.ok) throw new Error("Error fetching data");

      const data: ApiResponse = await response.json();
      setWaterIntake(data.waterIntake || 0);
      localStorage.setItem("lastWaterUpdate", getCurrentDate());
    } catch (error) {
      console.error("Failed to fetch water intake:", error);
      toast.error("Error al actualizar", {
        description: "Ocurrió un problema al actualizar tu consumo.",
      });
    }
  };

  /** Reinicia el consumo de agua al comenzar un nuevo día */
  const resetWaterIntake = async () => {
    await updateWaterIntake(0);
    // toast({
    //   title: "New Day",
    //   description: "Water intake tracking has been reset",
    // });
    toast.success("Consumo diario", {
      description: `Se ha restablecido el seguimiento del consumo de agua`,
    });
    localStorage.setItem("lastWaterUpdate", getCurrentDate());
  };

  /** Actualiza el consumo de agua en la API */
  const updateWaterIntake = async (newValue: number) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const response = await fetch("/api/profile/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waterIntake: newValue }),
      });

      if (!response.ok) throw new Error("Failed to update");

      setWaterIntake(newValue);

      toast.success("Consumo actualizado", {
        description: `Toma de agua actualizada a ${newValue}L`,
      });
    } catch (error) {
      console.error("Failed to update water intake:", error);
      toast.error("Error al actualizar", {
        description: "Ocurrió un problema al actualizar tu consumo.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  /** Maneja el click en una gota para sumar 0.5L */
  const handleClick = (index: number) => {
    const currentLevel = index + 0.5;
    if (waterIntake >= currentLevel) return;

    const newValue = Math.min(MAX_WATER_INTAKE, waterIntake + 0.5);
    updateWaterIntake(newValue);
  };

  /** Maneja el doble click para restar 0.5L */
  const handleDoubleClick = useCallback(() => {
    if (waterIntake > 0) {
      const newValue = Math.max(0, waterIntake - 0.5);
      updateWaterIntake(newValue);
    }
  }, [waterIntake]);

  /** Calcula cuánto llenar la gota (completa, media o vacía) */
  const getDropletFill = (index: number): number => {
    const fullDroplets = Math.floor(waterIntake);
    const partialDroplet = waterIntake % 1;

    if (index < fullDroplets) return 1; // Llena
    if (index === fullDroplets && partialDroplet >= 0.5) return 0.5; // Media
    return 0; // Vacía
  };

  return (
    <div className="flex flex-wrap gap-3">
      {Array.from({ length: MAX_WATER_INTAKE }).map((_, index) => {
        const fillLevel = getDropletFill(index);

        return (
          <div
            key={index}
            className="relative cursor-pointer"
            onClick={() => handleClick(index)}
            onDoubleClick={handleDoubleClick}
          >
            <DropletIcon size={26} className="text-blue-300" />
            {fillLevel > 0 && (
              <div
                className="absolute bottom-0 left-0 right-0 bg-blue-300 rounded-b-full"
                style={{
                  height: `${fillLevel * 100}%`,
                  opacity: 0.7,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
