import type { Metadata } from "next";
import AnimatedLayout from "@/components/layout/animated-layout";

export const metadata: Metadata = {
  title: "Detalle de Entrenamiento - GymRat+",
  description:
    "Visualiza y gestiona tu entrenamiento personalizado. Consulta ejercicios, series, repeticiones y músculos trabajados con nuestro mapa muscular interactivo.",
  keywords: [
    "entrenamiento",
    "ejercicio",
    "rutinas",
    "fitness",
    "progreso físico",
    "workout",
    "mapa muscular",
    "ejercicios",
    "series",
    "repeticiones",
  ],
  openGraph: {
    title: "Detalle de Entrenamiento | GymRat+",
    description:
      "Visualiza y gestiona tu entrenamiento personalizado con mapa muscular interactivo",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Detalle de Entrenamiento | GymRat+",
    description:
      "Visualiza y gestiona tu entrenamiento personalizado con mapa muscular interactivo",
  },
  robots: {
    index: false, // No indexar páginas de entrenamientos específicos
    follow: true,
  },
};

export default function WorkoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
