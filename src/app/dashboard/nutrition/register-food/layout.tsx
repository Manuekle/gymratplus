import AnimatedLayout from "@/components/layout/animated-layout";

export const metadata = {
  title: "Registro de Alimentos - GymRat+",
  description: "Registro de alimentos",
  keywords:
    "nutrición, dieta, alimentos, calorías, macronutrientes, alimentación",
};

export default function RegisterFoodLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
