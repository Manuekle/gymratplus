import AnimatedLayout from "@/components/layouts/animated-layout";

export const metadata = {
  title: "Nutrición - Planes de Alimentación - GymRat+",
  description: "Crea y sigue planes de alimentación personalizados",
  keywords:
    "nutrición, dieta, alimentos, calorías, macronutrientes, alimentación, planes de alimentación",
};

export default function FoodPlansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
