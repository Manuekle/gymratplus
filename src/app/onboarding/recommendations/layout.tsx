import AnimatedLayout from "@/components/layouts/animated-layout";

export const metadata = {
  title: "Recomendaciones - GymRat+",
  description: "Recomendaciones para tu rutina de entrenamiento",
  keywords: "recomendaciones, rutina, entrenamiento, fitness, progreso físico",
};

export default function RecommendationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
