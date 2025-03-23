import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === "production",
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
};

export default nextConfig;
