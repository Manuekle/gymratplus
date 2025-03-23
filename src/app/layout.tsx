"use client";

import { useEffect } from "react";
// import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";

const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "gymratplus",
//   description:
//     "Aplicación de fitness para seguimiento de entrenamientos y nutrición",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Inside your layout component
  useEffect(() => {
    // Initialize Redis subscriber
    fetch("/api/init").catch(console.error);
  }, []);
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta
          name="description"
          content="Aplicación de fitness para seguimiento de entrenamientos y nutrición"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://gymratplus.vercel.app/" />
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
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
