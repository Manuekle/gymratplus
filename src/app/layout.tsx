import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo";
import ClientLayout from "./client-layout";
import { JsonLd } from "@/components/seo/json-ld";

// Metadata SEO para la página principal y por defecto
export const metadata: Metadata = {
  ...generateSEOMetadata({
    title: "GymRat+ | Plataforma Inteligente de Fitness",
    description:
      "La plataforma inteligente que conecta entrenadores y atletas para experiencias de entrenamiento personalizadas. Planes de nutrición inteligentes, seguimiento avanzado y coaching profesional en un solo lugar.",
    keywords: [
      "fitness",
      "entrenamiento personalizado",
      "nutrición inteligente",
      "coaching profesional",
      "entrenadores",
      "atletas",
      "planes de entrenamiento",
      "seguimiento de progreso",
      "app fitness",
      "gymrat",
      "rutinas de ejercicio",
      "macronutrientes",
      "calorías",
      "analíticas fitness",
    ],
    openGraph: {
      title: "GymRat+ | Transforma tu cuerpo, transforma tu vida",
      description:
        "Plataforma inteligente de fitness con planes de entrenamiento personalizados, nutrición inteligente y coaching profesional.",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "GymRat+ | Plataforma Inteligente de Fitness",
      description:
        "Transforma tu cuerpo, transforma tu vida. Planes de entrenamiento personalizados y nutrición inteligente.",
    },
    manifest: "/manifest.json",
  }),
  icons: {
    icon: [
      { url: "/icons/logo-light.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/icons/favicon-180x180.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-background antialiased"
        suppressHydrationWarning
      >
        <JsonLd />
        <ClientLayout>{children}</ClientLayout>
        <SpeedInsights />
      </body>
    </html>
  );
}
