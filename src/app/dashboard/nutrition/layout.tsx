import AnimatedLayout from "@/components/layouts/animated-layout";

export const metadata = {
  title: "Nutrición - Dashboard - GymRat+",
  description: "Seguimiento de tu dieta, calorías y macronutrientes diarios",
  keywords:
    "nutrición, dieta, alimentos, calorías, macronutrientes, alimentación",
};

export default function NutritionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
