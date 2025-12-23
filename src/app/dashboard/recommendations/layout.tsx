import AnimatedLayout from "@/components/layout/animated-layout";
import { customSEO } from "@/lib/seo/seo";

export const metadata = customSEO({
  title: "Recomendaciones IA",
  description:
    "Obtén recomendaciones personalizadas de entrenamiento y nutrición generadas por inteligencia artificial basadas en tus objetivos y progreso.",
  keywords: [
    "recomendaciones",
    "inteligencia artificial",
    "IA",
    "personalización",
    "fitness",
    "nutrición",
    "planes personalizados",
    "sugerencias",
  ],
});

export default function RecommendationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
