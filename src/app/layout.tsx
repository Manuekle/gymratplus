"use client";

import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/layout/theme/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import RedisInitializer from "@/components/init/redis-initializer";
import { motion, AnimatePresence } from "framer-motion";
import { StreakAlertProvider } from "@/providers/streak-alert-provider";
import { NotificationsProvider } from "@/providers/notifications-provider";

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
      <body className="min-h-screen bg-background antialiased">
        <ClientProviders>
          {children}
          <Analytics />
        </ClientProviders>
      </body>
    </html>
  );
}

function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <RedisInitializer />
        <StreakAlertProvider>
          <NotificationsProvider>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="min-h-screen flex flex-col"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </NotificationsProvider>
        </StreakAlertProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
