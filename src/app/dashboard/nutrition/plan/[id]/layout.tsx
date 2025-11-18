import type { Metadata } from "next";
import AnimatedLayout from "@/components/layout/animated-layout";
import { customSEO } from "@/lib/seo/seo";

export const metadata: Metadata = customSEO({
  title: "Plan de Alimentación",
  description:
    "Visualiza y gestiona tu plan de alimentación personalizado con detalles de comidas y macronutrientes",
  keywords: [
    "plan de alimentación",
    "nutrición",
    "dieta",
    "macronutrientes",
    "calorías",
    "comidas",
  ],
  noindex: true, // No indexar planes específicos
});

export default function NutritionPlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
