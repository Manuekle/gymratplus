import AnimatedLayout from "@/components/layout/animated-layout";
import { customSEO } from "@/lib/seo/seo";

export const metadata = customSEO({
  title: "Objetivos",
  description: "Crea y gestiona tus objetivos de salud y bienestar",
  keywords: [
    "objetivos",
    "salud",
    "métricas",
    "bienestar",
    "seguimiento",
    "indicadores",
  ],
});

export default function GoalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
