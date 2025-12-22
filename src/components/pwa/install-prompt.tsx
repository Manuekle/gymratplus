"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { MultiplicationSignIcon } from "@hugeicons/core-free-icons";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(true);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as unknown as { MSStream: unknown }).MSStream,
    );

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  if (isStandalone) return null;

  if (isIOS) {
    return null;
  }

  if (!deferredPrompt || !showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 md:bottom-6 md:right-6">
      <div className="backdrop-blur-xl bg-white/90 dark:bg-black/90 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl shadow-lg p-3 md:p-4 flex items-center gap-3 max-w-[280px] md:max-w-sm">
        <div className="flex-1 min-w-0">
          <h3 className="text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5 truncate">
            Instalar GymRat+
          </h3>
          <p className="text-[10px] md:text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">
            Acceso rápido
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="h-7 w-7 p-0 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Cerrar"
          >
            <HugeiconsIcon
              icon={MultiplicationSignIcon}
              className="w-3.5 h-3.5"
            />
          </Button>
          <Button
            size="sm"
            onClick={handleInstallClick}
            className="h-7 px-3 text-xs backdrop-blur-xl bg-zinc-900/90 dark:bg-zinc-100/90 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-zinc-800/50 dark:border-zinc-200/50"
          >
            Instalar
          </Button>
        </div>
      </div>
    </div>
  );
}
