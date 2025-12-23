import type { NextConfig } from "next";

// Configuración dinámica de la base de datos para Prisma
if (process.env.NODE_ENV === "production") {
  process.env.DATABASE_URL = process.env.DATABASE_URL_PRO;
} else {
  process.env.DATABASE_URL = process.env.DATABASE_URL_DEV;
}

import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: false,
  workboxOptions: {
    importScripts: ["/custom-sw.js"],
  },
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh4.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh5.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh6.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
      {
        protocol: "https",
        hostname: "rijwjlzt9wsyq7fc.public.blob.vercel-storage.com",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false, // Asegura que errores de TypeScript detengan la compilación
  },
  async rewrites() {
    return [
      {
        source: "/robots.txt",
        destination: "/api/robots",
      },
    ];
  },
  reactStrictMode: true, // Activa el modo estricto de React
  experimental: {
    serverActions: {}, // Dejar vacío si no necesitas opciones específicas
  },
  turbopack: {}, // Required to silence error when PWA plugin adds webpack config
};

export default withPWA(nextConfig);
