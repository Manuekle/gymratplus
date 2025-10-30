import AnimatedLayout from "@/components/layouts/animated-layout";

export const metadata = {
  title: "Pago - GymRat+",
  description: "Pago de tu suscripción",
  keywords: "pago, suscripción, GymRat+",
};

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
