import AnimatedLayout from "@/components/layout/animated-layout";
import { customSEO } from "@/lib/seo/seo";

export const metadata = customSEO({
  title: "Suscripciones",
  description:
    "Elige el plan que mejor se adapte a tus necesidades. Planes de fitness con entrenamiento personalizado, nutrición inteligente y coaching profesional.",
  keywords: [
    "suscripción",
    "planes",
    "pago",
    "pricing",
    "pro",
    "instructor",
    "membresía",
  ],
  noindex: true, // Private page - no need to index in search engines
});

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
