import type { Metadata } from "next";
import { generateMetadata } from "@/lib/seo/seo";

// Metadata para el layout raíz
export const metadata: Metadata = generateMetadata({
  title: "GymRat+",
  description:
    "Aplicación de fitness para seguimiento de entrenamientos y nutrición",
});
