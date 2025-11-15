import AnimatedLayout from "@/components/layout/animated-layout";
import { customSEO } from "@/lib/seo/seo";

export const metadata = customSEO({
  title: "Pago",
  description: "Gestiona tu suscripción y métodos de pago",
  keywords: ["pago", "suscripción", "facturación", "métodos de pago"],
  noindex: true,
});

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
