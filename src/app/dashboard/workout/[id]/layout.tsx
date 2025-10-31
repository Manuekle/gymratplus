import AnimatedLayout from "@/components/layout/animated-layout";

export const metadata = {
  title: "Entrenamiento - GymRat+",
  description: "Crea y sigue planes de entrenamiento personalizados",
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
