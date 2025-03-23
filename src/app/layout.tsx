"use client";

// import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import RedisInitializer from "@/components/init/redis-initializer";

const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "GymRat+",
//   description:
//     "Aplicación de fitness para seguimiento de entrenamientos y nutrición",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Meta descripción y robots */}
        <meta
          name="description"
          content="Aplicación de fitness para seguimiento de entrenamientos y nutrición"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://gymratplus.vercel.app/" />

        {/* Open Graph (Facebook y general) */}
        <meta property="og:title" content="GymRat+ - Tu compañero de fitness" />
        <meta
          property="og:description"
          content="Registra tus entrenamientos, controla tu nutrición y mejora tu progreso con GymRat+."
        />
        <meta
          property="og:image"
          content="https://gymratplus.vercel.app/og-image.webp"
        />
        <meta property="og:url" content="https://gymratplus.vercel.app/" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="es_ES" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="GymRat+ - Tu compañero de fitness"
        />
        <meta
          name="twitter:description"
          content="Registra tus entrenamientos, controla tu nutrición y mejora tu progreso con GymRat+."
        />
        <meta
          name="twitter:image"
          content="https://gymratplus.vercel.app/og-image.webp"
        />
        <meta name="twitter:site" content="@tu_cuenta" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] ${inter.className} antialiased`}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <Analytics />
        <RedisInitializer />
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
