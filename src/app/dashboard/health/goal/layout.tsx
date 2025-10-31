import AnimatedLayout from "@/components/layout/animated-layout";

export const metadata = {
  title: "Objetivos - GymRat+",
  description: "Monitorea tus métricas de salud y bienestar general",
  keywords: "salud, métricas, bienestar, seguimiento médico, indicadores",
};

export default function GoalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
