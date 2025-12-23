import AnimatedLayout from "@/components/layout/animated-layout";
import { customSEO } from "@/lib/seo/seo";

export const metadata = customSEO({
  title: "Biblioteca de Ejercicios",
  description:
    "Explora nuestra biblioteca de ejercicios con videos y guías de técnica detalladas.",
  keywords: [
    "ejercicios",
    "gym",
    "técnica",
    "videos",
    "musculación",
    "fitness",
  ],
});

export default function ExercisesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
