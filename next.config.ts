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
    domains: [
      "lh3.googleusercontent.com",
      "lh4.googleusercontent.com",
      "lh5.googleusercontent.com",
      "lh6.googleusercontent.com",
      "flagcdn.com",
      "rijwjlzt9wsyq7fc.public.blob.vercel-storage.com",
    ],
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === "production", // Asegura que errores de TypeScript detengan la compilación
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
  turbopack: {}, // Required for Next.js 16 with webpack plugins
};

export default withPWA(nextConfig);
