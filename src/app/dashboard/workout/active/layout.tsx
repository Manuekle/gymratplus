import AnimatedLayout from "@/components/layout/animated-layout";

export const metadata = {
  title: "Entrenamiento Activo - GymRat+",
  description: "Realiza tu entrenamiento activo",
  keywords:
    "entrenamiento, ejercicio, rutinas, fitness, progreso físico, workout, entrenamiento activo",
};

export default function ActiveWorkoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
