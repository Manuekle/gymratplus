import AnimatedLayout from "@/components/layout/animated-layout";
import { customSEO } from "@/lib/seo/seo";

export const metadata = customSEO({
  title: "Lista de Alumnos",
  description:
    "Gestiona a tus alumnos y asigna planes de entrenamiento y nutrición personalizados",
  keywords: [
    "alumnos",
    "estudiantes",
    "gestión",
    "planes de entrenamiento",
    "instructor",
  ],
  noindex: true,
});
export default function StudentsListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
