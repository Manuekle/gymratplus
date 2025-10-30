import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GymRat+",
  description:
    "Aplicación de fitness para seguimiento de entrenamientos y nutrición",
  metadataBase: new URL("https://gymratplus.vercel.app"),
  openGraph: {
    title: "GymRat+ - Tu compañero de fitness",
    description:
      "Registra tus entrenamientos, controla tu nutrición y mejora tu progreso con GymRat+.",
    url: "https://gymratplus.vercel.app",
    siteName: "GymRat+",
  },
};
