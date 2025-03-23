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
      <body className={`${inter.className} antialiased`}>
        <Analytics />
        <AuthProvider>
          <div className="absolute top-0 z-[-2] h-screen w-screen bg-neutral-50 dark:bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(0,0,0,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
