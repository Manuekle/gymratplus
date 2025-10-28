import AnimatedLayout from "@/components/layouts/animated-layout";

export const metadata = {
  title: "Nutrición - Dashboard - GymRat+",
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
