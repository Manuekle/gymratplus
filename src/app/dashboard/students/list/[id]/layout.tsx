import AnimatedLayout from "@/components/layout/animated-layout";
import { customSEO } from "@/lib/seo/seo";

export const metadata = customSEO({
  title: "Detalle de Alumno",
  description:
    "Gestiona el perfil, planes de entrenamiento y nutrición de tu alumno",
  keywords: [
    "alumno",
    "estudiante",
    "gestión",
    "planes de entrenamiento",
    "perfil",
  ],
  noindex: true,
});
export default function StudentsItemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
