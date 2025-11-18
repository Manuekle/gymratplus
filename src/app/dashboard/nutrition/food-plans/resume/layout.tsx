import type { Metadata } from "next";
import AnimatedLayout from "@/components/layout/animated-layout";
import { customSEO } from "@/lib/seo/seo";

export const metadata: Metadata = customSEO({
  title: "Gráficas de Plan de Alimentación",
  description:
    "Visualiza gráficas y estadísticas detalladas de tu plan de alimentación: distribución de macros, calorías por comida y más",
  keywords: [
    "gráficas nutricionales",
    "estadísticas de dieta",
    "macronutrientes",
    "calorías",
    "análisis nutricional",
    "visualización de datos",
  ],
  noindex: true, // No indexar gráficas específicas
});

export default function FoodPlansResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
