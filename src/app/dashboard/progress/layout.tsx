import AnimatedLayout from "@/components/layout/animated-layout";
import { customSEO } from "@/lib/seo/seo";

export const metadata = customSEO({
  title: "Mi Evolución",
  description:
    "Sigue tu transformación física con fotos de progreso y registro de peso.",
  keywords: ["progreso", "fotos", "evolución", "gymrat", "transformación"],
});

export default function ProgressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
