import type { Metadata } from "next";
import AnimatedLayout from "@/components/layout/animated-layout";

export const metadata: Metadata = {
  title: "Historial de Entrenamientos - GymRat+",
  description:
    "Revisa tu historial completo de entrenamientos. Analiza tu progreso, rutinas realizadas y evolución física.",
  keywords: [
    "historial de entrenamientos",
    "entrenamiento",
    "ejercicio",
    "rutinas",
    "fitness",
    "progreso físico",
    "workout",
    "estadísticas de entrenamiento",
  ],
  openGraph: {
    title: "Historial de Entrenamientos | GymRat+",
    description:
      "Revisa tu historial completo de entrenamientos y analiza tu progreso",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Historial de Entrenamientos | GymRat+",
    description:
      "Revisa tu historial completo de entrenamientos y analiza tu progreso",
  },
  robots: {
    index: false, // No indexar historiales personales
    follow: true,
  },
};

export default function WorkoutHistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
