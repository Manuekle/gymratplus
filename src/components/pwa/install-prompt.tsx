"use client";

import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Share08Icon,
  PlusSignIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);

    // Detect Standalone
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsIOS(isIosDevice);
    setIsStandalone(isStandaloneMode);

    // Show only on iOS and if not already installed
    // And delay a bit to not be annoying immediately
    if (isIosDevice && !isStandaloneMode) {
      const timer = setTimeout(() => {
        // Check if user has dismissed it before
        const hasDismissed = localStorage.getItem("pwa-ios-prompt-dismissed");
        if (!hasDismissed) {
          setIsVisible(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("pwa-ios-prompt-dismissed", "true");
  };

  if (!isIOS || isStandalone) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-50 flex flex-col gap-4 rounded-xl border border-white/20 bg-black/60 p-4 text-white shadow-2xl backdrop-blur-md md:left-auto md:right-4 md:w-96"
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-lg">Instala la App</h3>
              <p className="text-sm text-gray-200">
                Instala GymRat+ en tu pantalla de inicio para una mejor
                experiencia.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-white"
              onClick={handleDismiss}
            >
              <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col gap-3 rounded-lg bg-white/10 p-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                1
              </span>
              <div className="flex items-center gap-2">
                <span>Toca el botón compartir</span>
                <HugeiconsIcon
                  icon={Share08Icon}
                  className="h-5 w-5 text-blue-400"
                />
              </div>
            </div>
            <div className="h-px w-full bg-white/10" />
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                2
              </span>
              <div className="flex items-center gap-2">
                <span>Selecciona "Agregar a Inicio"</span>
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  className="h-5 w-5 text-gray-300"
                />
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-gray-400">
            No ocupa espacio en tu dispositivo
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
