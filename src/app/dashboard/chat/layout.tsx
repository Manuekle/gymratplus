import AnimatedLayout from "@/components/layout/animated-layout";
import { customSEO } from "@/lib/seo/seo";

export const metadata = customSEO({
  title: "GymRat AI - Tu Entrenador Virtual",
  description:
    "Consulta tus dudas de entrenamiento y nutrición con nuestro entrenador inteligente.",
  keywords: ["ia", "entrenador", "chat", "gymrat", "fitness"],
});

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
