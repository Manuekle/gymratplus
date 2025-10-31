import AnimatedLayout from "@/components/layout/animated-layout";

export const metadata = {
  title: "Salud - GymRat+",
  description: "Monitorea tus métricas de salud y bienestar general",
  keywords: "salud, métricas, bienestar, seguimiento médico, indicadores",
};

export default function HealthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
