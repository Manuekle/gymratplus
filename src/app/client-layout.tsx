"use client";

import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/layout/theme/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import RedisInitializer from "@/components/init/redis-initializer";
import { motion, AnimatePresence } from "framer-motion";
import { StreakAlertProvider } from "@/providers/streak-alert-provider";
import { NotificationsProvider } from "@/providers/notifications-provider";
import { PWAInit } from "@/components/pwa/pwa-init";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <PWAInit />
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
      <Analytics />
    </ThemeProvider>
  );
}
