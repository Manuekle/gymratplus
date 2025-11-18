import type { Metadata } from "next";
import { generateMetadata } from "@/lib/seo/seo";

export const metadata: Metadata = generateMetadata({
  title: "Precios y Planes",
  description:
    "Elige el plan perfecto para ti. Planes para estudiantes e instructores con precios flexibles y funcionalidades completas.",
  keywords: [
    "precios",
    "planes",
    "suscripción",
    "pricing",
    "instructor",
    "estudiante",
    "fitness",
    "gymrat",
    "tarifas",
  ],
  openGraph: {
    title: "Precios y Planes | GymRat+",
    description:
      "Elige el plan perfecto para ti. Planes para estudiantes e instructores.",
    type: "website",
  },
});

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
