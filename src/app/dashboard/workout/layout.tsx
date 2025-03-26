import AnimatedLayout from "@/components/layouts/animated-layout";

export const metadata = {
  title: "Entrenamiento - Dashboard - GymRat+",
  description:
    "Planifica y registra tus rutinas de ejercicio y progreso físico",
  keywords:
    "entrenamiento, ejercicio, rutinas, fitness, progreso físico, workout",
};

export default function WorkoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
