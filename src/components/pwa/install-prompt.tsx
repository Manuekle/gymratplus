"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

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

  if (isStandalone) return null;

  if (isIOS) {
    // Optional: Show iOS install instructions only if desired, or keep hidden to avoid clutter
    // For now, we'll return null to keep it clean unless requested
    return null;
  }

  if (!deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 p-4 bg-background border rounded-lg shadow-lg z-50 md:max-w-sm md:left-auto flex items-center justify-between gap-4">
      <div className="text-sm">
        <p className="font-medium">Instalar GymRat+</p>
        <p className="text-muted-foreground text-xs">
          Accede más rápido y úsala sin conexión
        </p>
      </div>
      <Button size="sm" onClick={handleInstallClick}>
        <HugeiconsIcon icon={Download01Icon} className="mr-2 h-4 w-4" />
        Instalar
      </Button>
    </div>
  );
}
