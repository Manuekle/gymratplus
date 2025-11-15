import AnimatedLayout from "@/components/layout/animated-layout";
import { customSEO } from "@/lib/seo/seo";

export const metadata = customSEO({
  title: "Registro de Alimentos",
  description: "Registra tus comidas y controla tu ingesta nutricional diaria",
  keywords: [
    "nutrición",
    "dieta",
    "alimentos",
    "calorías",
    "macronutrientes",
    "alimentación",
    "registro de comidas",
  ],
});

export default function RegisterFoodLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
