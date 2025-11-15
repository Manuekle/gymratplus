import AnimatedLayout from "@/components/layout/animated-layout";
import { customSEO } from "@/lib/seo/seo";

export const metadata = customSEO({
  title: "Planes de Alimentación",
  description: "Crea y sigue planes de alimentación personalizados",
  keywords: [
    "nutrición",
    "dieta",
    "alimentos",
    "calorías",
    "macronutrientes",
    "alimentación",
    "planes de alimentación",
  ],
});

export default function FoodPlansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
