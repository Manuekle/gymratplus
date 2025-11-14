import type { Metadata } from "next";
import AnimatedLayout from "@/components/layout/animated-layout";

export const metadata: Metadata = {
  title: "Entrenamiento Activo - GymRat+",
  description:
    "Realiza tu entrenamiento activo. Registra series, repeticiones y descansos en tiempo real mientras entrenas.",
  keywords: [
    "entrenamiento activo",
    "entrenamiento en curso",
    "ejercicio",
    "rutinas",
    "fitness",
    "workout",
    "registro de entrenamiento",
  ],
  openGraph: {
    title: "Entrenamiento Activo | GymRat+",
    description:
      "Realiza tu entrenamiento activo y registra tu progreso en tiempo real",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Entrenamiento Activo | GymRat+",
    description:
      "Realiza tu entrenamiento activo y registra tu progreso en tiempo real",
  },
  robots: {
    index: false, // No indexar entrenamientos activos
    follow: true,
  },
};

export default function ActiveWorkoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
