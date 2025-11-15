import AnimatedLayout from "@/components/layout/animated-layout";
import { customSEO } from "@/lib/seo/seo";

export const metadata = customSEO({
  title: "Buscar Instructores",
  description:
    "Encuentra y contrata instructores certificados para tu entrenamiento personalizado",
  keywords: [
    "instructores",
    "entrenadores",
    "coaches",
    "búsqueda",
    "personal trainer",
  ],
});
export default function InstructorsSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
