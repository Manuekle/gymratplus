import AnimatedLayout from "@/components/layout/animated-layout";
import { customSEO } from "@/lib/seo/seo";

export const metadata = customSEO({
  title: "Historial de Objetivos",
  description: "Revisa tus objetivos completados y logros alcanzados",
  keywords: [
    "objetivos",
    "historial",
    "completados",
    "logros",
    "progreso",
    "fitness",
  ],
  noindex: true,
});

export default function GoalsHistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
