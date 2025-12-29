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
    <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 px-4 py-3 text-center text-xs font-medium shadow-lg backdrop-blur-sm animate-in slide-in-from-top duration-300">
      <div className="flex items-center justify-center gap-2">
        {!isOnline && (
          <>
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
            </svg>
            <span>Modo offline - Algunos datos pueden estar desactualizados</span>
          </>
        )}
        {isOnline && isSyncing && (
          <>
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Sincronizando datos...</span>
          </>
        )}
      </div>
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
