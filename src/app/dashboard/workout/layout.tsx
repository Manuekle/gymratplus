import type { Metadata } from "next";
import AnimatedLayout from "@/components/layout/animated-layout";

export const metadata: Metadata = {
  title: "Entrenamientos - GymRat+",
  description:
    "Planifica y registra tus rutinas de ejercicio y progreso físico. Crea entrenamientos personalizados y sigue tu evolución.",
  keywords: [
    "entrenamiento",
    "ejercicio",
    "rutinas",
    "fitness",
    "progreso físico",
    "workout",
    "plan de entrenamiento",
    "rutina de ejercicios",
  ],
  openGraph: {
    title: "Entrenamientos | GymRat+",
    description:
      "Planifica y registra tus rutinas de ejercicio y progreso físico",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Entrenamientos | GymRat+",
    description:
      "Planifica y registra tus rutinas de ejercicio y progreso físico",
  },
};

export default function WorkoutsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
