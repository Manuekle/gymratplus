import type { Metadata } from "next";
import AnimatedLayout from "@/components/layout/animated-layout";
import { customSEO } from "@/lib/seo/seo";

export const metadata: Metadata = customSEO({
  title: "Rutina de Estudiante",
  description:
    "Visualiza y gestiona la rutina de entrenamiento asignada a un estudiante",
  keywords: [
    "rutina de estudiante",
    "entrenamiento asignado",
    "instructor",
    "estudiante",
    "workout",
  ],
  noindex: true, // No indexar rutinas específicas de estudiantes
});

export default function StudentWorkoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
