"use client";

import { useEffect, useRef } from "react";

interface AdBannerProps {
    dataAdSlot: string;
    dataAdFormat?: "auto" | "fluid" | "rectangle";
    dataFullWidthResponsive?: boolean;
}

export default function AdBanner({
    dataAdSlot,
    dataAdFormat = "auto",
    dataFullWidthResponsive = true,
}: AdBannerProps) {
    const isDev = process.env.NODE_ENV === "development";
    const adRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Only load ads in production or if forced
        if (isDev) return;

        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error("AdSense error:", err);
        }
    }, [isDev]);

    if (isDev) {
        return (
            <div className="w-full p-4 my-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-center">
                <p className="text-xs font-semibold text-zinc-500">Google AdSense Placeholder</p>
                <p className="text-xs text-zinc-400">Slot ID: {dataAdSlot}</p>
                <p className="text-xs text-zinc-400">Dimensión: {dataAdFormat}</p>
            </div>
        );
    }

    return (
        <div className="w-full my-4 overflow-hidden rounded-lg mx-auto text-center">
            <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-2777571336577174"
                data-ad-slot={dataAdSlot}
                data-ad-format={dataAdFormat}
                data-full-width-responsive={dataFullWidthResponsive.toString()}
            ></ins>
        </div>
    );
}
