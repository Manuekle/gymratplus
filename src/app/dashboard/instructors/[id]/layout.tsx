import AnimatedLayout from "@/components/layout/animated-layout";
import { customSEO } from "@/lib/seo/seo";

export const metadata = customSEO({
  title: "Perfil de Instructor",
  description:
    "Conoce el perfil, experiencia y planes disponibles del instructor",
  keywords: [
    "instructor",
    "entrenador",
    "coach",
    "perfil",
    "planes de entrenamiento",
  ],
});
export default function InstructorsIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
