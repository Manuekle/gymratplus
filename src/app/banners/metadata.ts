import { Metadata } from "next";

export const metadata: Metadata = {
    title: "OG Banners Preview - GymRat+",
    description: "Vista previa de los banners OpenGraph y Twitter de GymRat+ con diseño liquid glass para redes sociales",
    openGraph: {
        title: "GymRat+ - Transforma tu cuerpo con IA",
        description: "Entrena más inteligente con tu coach de IA personal. Planes personalizados de entrenamiento y nutrición.",
        images: [
            {
                url: "/banners/opengraph",
                width: 1200,
                height: 630,
                alt: "GymRat+ - Transforma tu cuerpo con IA",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "GymRat+ - Transforma tu cuerpo con IA",
        description: "Entrena más inteligente con tu coach de IA personal. Planes personalizados de entrenamiento y nutrición.",
        images: ["/banners/twitter"],
    },
};
