import AnimatedLayout from "@/components/layouts/animated-layout";

export const metadata = {
  title: "Historial de Entrenamientos - Dashboard - GymRat+",
  description: "Revisa tu historial de entrenamientos",
  keywords:
    "entrenamiento, ejercicio, rutinas, fitness, progreso físico, workout, historial de entrenamientos",
};

export default function WorkoutHistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
