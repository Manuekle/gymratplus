import AnimatedLayout from "@/components/layout/animated-layout";

export const metadata = {
  title: "Historial - GymRat+",
  description: "Revisa y gestiona tu historial de mediciones",
  keywords: "salud, métricas, bienestar, seguimiento médico, indicadores",
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
