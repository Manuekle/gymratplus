"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { CookieIcon, SecurityCheckIcon } from "@hugeicons/core-free-icons";

// Helper to update GTM consent
function updateConsent(granted: boolean) {
    const status = granted ? "granted" : "denied";

    // @ts-ignore - gtag defined in global scope
    if (typeof window !== "undefined" && window.gtag) {
        // @ts-ignore
        window.gtag("consent", "update", {
            ad_storage: status,
            ad_user_data: status,
            ad_personalization: status,
            analytics_storage: status,
        });
    }

    localStorage.setItem("cookie_consent", status);
}

export default function CookieConsentBanner() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem("cookie_consent");
        if (!consent) {
            setShowBanner(true);
        } else {
            // Re-apply consent on reload to be sure
            const granted = consent === "granted";
            updateConsent(granted);
        }
    }, []);

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom-full duration-500">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl shadow-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl shrink-0">
                            <HugeiconsIcon
                                icon={CookieIcon}
                                className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
                            />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                Privacidad y Cookies
                                <HugeiconsIcon
                                    icon={SecurityCheckIcon}
                                    className="h-4 w-4 text-green-500"
                                />
                            </h3>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-lg leading-relaxed">
                                Usamos cookies propias y de terceros para mejorar tu experiencia,
                                analizar el tráfico y mostrarte contenido personalizado. Al hacer
                                clic en "Aceptar todo", das tu consentimiento a nuestro uso de
                                cookies.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                updateConsent(false);
                                setShowBanner(false);
                            }}
                            className="w-full sm:w-auto text-xs border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                            Rechazar
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                updateConsent(true);
                                setShowBanner(false);
                            }}
                            className="w-full sm:w-auto text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                        >
                            Aceptar todo
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
