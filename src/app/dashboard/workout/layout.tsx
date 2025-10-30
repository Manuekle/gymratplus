import AnimatedLayout from "@/components/layouts/animated-layout";

export const metadata = {
  title: "Entrenamiento - GymRat+",
  description:
    "Planifica y registra tus rutinas de ejercicio y progreso físico",
  keywords:
    "entrenamiento, ejercicio, rutinas, fitness, progreso físico, workout",
};

export default function WorkoutsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
