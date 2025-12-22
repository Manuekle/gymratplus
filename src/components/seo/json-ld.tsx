"use client";

import Script from "next/script";

export function JsonLd() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "GymRat+",
        applicationCategory: "HealthApplication",
        operatingSystem: "Web",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
        },
        author: {
            "@type": "Organization",
            name: "GymRat+",
            url: "https://gymratplus.com",
        },
        description:
            "Plataforma inteligente de fitness que conecta entrenadores y atletas para experiencias de entrenamiento personalizadas.",
    };

    return (
        <Script
            id="json-ld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
