import AnimatedLayout from "@/components/layouts/animated-layout";

export const metadata = {
  title: "Salud - Historial - GymRat+",
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
