/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { DropletIcon } from "hugeicons-react";
import { cn } from "@/lib/utils";

const MAX_INTAKE = 8; // 8 gotas = 4L (cada gota representa 0.5L)

export default function WaterLog() {
  const [intake, setIntake] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchWaterIntake();
  }, []);

  // Obtener la ingesta actual desde la API
  const fetchWaterIntake = async () => {
    try {
      const response = await fetch("/api/profile/water");
      if (!response.ok) throw new Error("Error fetching data");

      const data = await response.json();
      setIntake(data.intake || 0);
    } catch (error) {
      console.error("Error fetching water intake:", error);
      toast.error("No se pudo cargar la ingesta de agua.");
    }
  };

  // Actualizar la ingesta en la API
  const updateWaterIntake = async (newIntake: number) => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch("/api/profile/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intake: newIntake }),
      });

      if (!response.ok) throw new Error("Error updating intake");

      setIntake(newIntake);
      toast.success("Consumo actualizado", {
        description: `Has tomado ${newIntake}L de agua hoy.`,
      });
    } catch (error) {
      console.error("Error updating water intake:", error);
      toast.error("No se pudo actualizar la ingesta de agua.");
    } finally {
      setLoading(false);
    }
  };

  // Manejar clics para sumar 0.5L
  const handleClick = (_index: number) => {
    const newIntake = Math.min(MAX_INTAKE, intake + 0.5);
    if (newIntake !== intake) updateWaterIntake(newIntake);
  };

  // Manejar doble clics para restar 0.5L
  const handleDoubleClick = useCallback(() => {
    if (intake > 0) updateWaterIntake(Math.max(0, intake - 0.5));
  }, [intake]);

  return (
    <div className="flex flex-wrap gap-3">
      {Array.from({ length: MAX_INTAKE }).map((_, index) => {
        const isFilled = intake >= index + 0.5;

        return (
          <div
            key={index}
            className="relative cursor-pointer"
            onClick={() => handleClick(index)}
            onDoubleClick={handleDoubleClick}
          >
            <DropletIcon
              size={24}
              className={cn("text-gray-300", isFilled && "text-blue-500")}
            />
          </div>
        );
      })}
    </div>
  );
}
