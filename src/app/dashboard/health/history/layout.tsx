import AnimatedLayout from "@/components/layout/animated-layout";
import { customSEO } from "@/lib/seo/seo";

export const metadata = customSEO({
  title: "Historial",
  description:
    "Revisa y gestiona tu historial de mediciones y métricas de salud",
  keywords: [
    "historial",
    "salud",
    "métricas",
    "bienestar",
    "seguimiento médico",
    "indicadores",
  ],
  noindex: true,
});

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
