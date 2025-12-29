"use client";

import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/layout/theme/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import RedisInitializer from "@/components/init/redis-initializer";
import { motion, AnimatePresence } from "framer-motion";
import { StreakAlertProvider } from "@/providers/streak-alert-provider";
import { NotificationsProvider } from "@/providers/notifications-provider";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { useOfflineSync } from "@/hooks/use-offline-sync";

function OfflineIndicator() {
  const { isOnline, isSyncing } = useOfflineSync();

  if (isOnline && !isSyncing) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium shadow-md">
      {!isOnline && "⚠️ Modo offline - Algunos datos pueden estar desactualizados"}
      {isOnline && isSyncing && "🔄 Sincronizando datos..."}
    </div>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("✅ Service Worker registered:", registration.scope);
        })
        .catch((error) => {
          console.error("❌ Service Worker registration failed:", error);
        });
    }
  }, []);

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
            <OfflineIndicator />
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
        <Toaster position="top-center" />
      </AuthProvider>
      <Analytics />
    </ThemeProvider>
  );
}
