"use server";

import { revalidatePath } from "next/cache";

type WorkoutFormData = {
  goal: string;
  splitType: string;
  methodology: string;
  trainingFrequency: number;
  name: string;
};

export async function createCustomWorkout(formData: WorkoutFormData) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/custom-workout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al crear el entrenamiento");
    }

    const workout = await response.json();

    // Revalidar la ruta para actualizar los datos
    revalidatePath("/workout-generator");

    return workout;
  } catch (error) {
    console.error("Error creating custom workout:", error);
    throw error;
  }
}
