import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo";
import ClientLayout from "./client-layout";
import { JsonLd } from "@/components/seo/json-ld";

// Metadata SEO para la página principal y por defecto
export const metadata: Metadata = {
  ...generateSEOMetadata({
    title: "GymRat+ - Plataforma Inteligente de Fitness",
    description:
      "La plataforma inteligente que conecta entrenadores y atletas para experiencias de entrenamiento personalizadas. Planes de nutrición inteligentes, seguimiento avanzado y coaching profesional en un solo lugar.",
    keywords: [
      "fitness",
      "entrenamiento personalizado",
      "nutrición inteligente",
      "coaching profesional",
      "entrenadores",
      "atletas",
      "planes de entrenamiento",
      "seguimiento de progreso",
      "app fitness",
      "gymrat",
      "rutinas de ejercicio",
      "macronutrientes",
      "calorías",
      "analíticas fitness",
    ],
    openGraph: {
      title: "GymRat+ - Transforma tu cuerpo, transforma tu vida",
      description:
        "Plataforma inteligente de fitness con planes de entrenamiento personalizados, nutrición inteligente y coaching profesional.",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "GymRat+ - Plataforma Inteligente de Fitness",
      description:
        "Transforma tu cuerpo, transforma tu vida. Planes de entrenamiento personalizados y nutrición inteligente.",
    },
  }),
  icons: {
    icon: [
      {
        url: "/icons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/icons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/icons/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
    shortcut: "/favicon.ico",
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/icons/apple-touch-icon.png",
      },
      {
        rel: "mask-icon",
        url: "/icons/safari-pinned-tab.svg",
        color: "#000000",
      },
    ],
  },
  manifest: "/icons/manifest.json",
  other: {
    'msapplication-config': '/icons/browserconfig.xml',
    'msapplication-TileColor': '#fffffff',
    'msapplication-TileImage': '/icons/mstile-144x144.png',
    'theme-color': '#fffffff',
    'msapplication-TileShape': 'square',
    'msapplication-TileSize': '144x144',
  },
  alternates: {
    canonical: "https://gymratplus.com",
  },
};

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
};

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
      <head>
        {/* Google Consent Mode v2 (Default: Denied) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'denied'
            });
            `,
          }}
        />
        {/* End Google Consent Mode */}

        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KSV33ZCJ');`,
          }}
        />
        {/* End Google Tag Manager */}

        {/* Google Analytics (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-2BT4LMS24S"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2BT4LMS24S');
          `,
          }}
        />
        {/* End Google Analytics */}

        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2777571336577174"
          crossOrigin="anonymous"
        ></script>
        {/* End Google AdSense */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/favicon-180x180.png" />
      </head>
      <body
        className="min-h-screen bg-background antialiased"
        suppressHydrationWarning
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KSV33ZCJ"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <JsonLd />
        <ClientLayout>{children}</ClientLayout>
        <SpeedInsights />
      </body>
    </html>
  );
}
