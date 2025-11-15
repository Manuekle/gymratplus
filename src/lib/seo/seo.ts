import type { Metadata } from "next";

// Configuración base de la aplicación
const SITE_CONFIG = {
  name: "GymRat+",
  description:
    "Aplicación de fitness para seguimiento de entrenamientos y nutrición",
  url: "https://gymratplus.vercel.app",
  ogImage: "/og-image.png",
  twitterHandle: "@gymratplus",
} as const;

// Tipos para mejor tipado
export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string | string[];
  image?: string;
  url?: string;
  noindex?: boolean;
  nofollow?: boolean;
  openGraph?: {
    title?: string;
    description?: string;
    type?: "website" | "article" | "profile";
    image?: string;
  };
  twitter?: {
    card?: "summary" | "summary_large_image";
    title?: string;
    description?: string;
    image?: string;
  };
}

/**
 * Genera metadata completa para Next.js con SEO optimizado
 * @param config - Configuración de SEO
 * @returns Metadata de Next.js
 */
export function generateMetadata(config: SEOConfig = {}): Metadata {
  const {
    title,
    description,
    keywords,
    image,
    url,
    noindex = false,
    nofollow = false,
    openGraph,
    twitter,
  } = config;

  // Construir título completo
  const fullTitle = title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.name;

  // Construir descripción
  const metaDescription = description || SITE_CONFIG.description;

  // Construir URL completa
  const fullUrl = url
    ? `${SITE_CONFIG.url}${url.startsWith("/") ? url : `/${url}`}`
    : SITE_CONFIG.url;

  // Construir imagen completa
  const ogImageUrl = image
    ? image.startsWith("http")
      ? image
      : `${SITE_CONFIG.url}${image.startsWith("/") ? image : `/${image}`}`
    : `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`;

  // Procesar keywords
  const keywordsArray = Array.isArray(keywords)
    ? keywords
    : keywords
      ? keywords.split(",").map((k) => k.trim())
      : undefined;

  // Robots
  const robots = [];
  if (noindex) robots.push("noindex");
  if (nofollow) robots.push("nofollow");
  if (robots.length === 0) robots.push("index", "follow");

  return {
    title: fullTitle,
    description: metaDescription,
    keywords: keywordsArray,
    metadataBase: new URL(SITE_CONFIG.url),
    robots: robots.join(", "),
    openGraph: {
      title: openGraph?.title || fullTitle,
      description: openGraph?.description || metaDescription,
      url: fullUrl,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: openGraph?.image || ogImageUrl,
          width: 1200,
          height: 630,
          alt: openGraph?.title || fullTitle,
        },
      ],
      locale: "es_ES",
      type: openGraph?.type || "website",
    },
    twitter: {
      card: twitter?.card || "summary_large_image",
      title: twitter?.title || fullTitle,
      description: twitter?.description || metaDescription,
      images: twitter?.image ? [twitter.image] : [ogImageUrl],
      creator: SITE_CONFIG.twitterHandle,
    },
    alternates: {
      canonical: fullUrl,
    },
  };
}

/**
 * Helper para generar metadata de páginas del dashboard
 */
export const dashboardSEO = {
  home: () =>
    generateMetadata({
      title: "Dashboard",
      description:
        "Planifica y registra tus rutinas de ejercicio y progreso físico",
      keywords: [
        "entrenamiento",
        "ejercicio",
        "rutinas",
        "fitness",
        "progreso físico",
        "workout",
      ],
    }),

  workout: () =>
    generateMetadata({
      title: "Entrenamientos",
      description:
        "Planifica y registra tus rutinas de ejercicio y progreso físico. Crea entrenamientos personalizados y sigue tu evolución.",
      keywords: [
        "entrenamiento",
        "ejercicio",
        "rutinas",
        "fitness",
        "progreso físico",
        "workout",
        "plan de entrenamiento",
        "rutina de ejercicios",
      ],
    }),

  nutrition: () =>
    generateMetadata({
      title: "Nutrición",
      description:
        "Seguimiento de tu dieta, calorías y macronutrientes diarios",
      keywords: [
        "nutrición",
        "dieta",
        "alimentos",
        "calorías",
        "macronutrientes",
        "alimentación",
      ],
    }),

  health: () =>
    generateMetadata({
      title: "Salud",
      description: "Monitorea tus métricas de salud y bienestar general",
      keywords: [
        "salud",
        "métricas",
        "bienestar",
        "seguimiento médico",
        "indicadores",
      ],
    }),

  profile: () =>
    generateMetadata({
      title: "Perfil",
      description: "Gestiona tu perfil, configuración y preferencias",
      keywords: ["perfil", "configuración", "ajustes", "cuenta"],
      noindex: true,
    }),

  notifications: () =>
    generateMetadata({
      title: "Notificaciones",
      description: "Revisa tus alertas, mensajes y actualizaciones importantes",
      keywords: [
        "notificaciones",
        "alertas",
        "mensajes",
        "actualizaciones",
        "avisos",
      ],
      noindex: true,
    }),

  students: () =>
    generateMetadata({
      title: "Estudiantes",
      description:
        "Gestiona tus estudiantes y asigna planes de entrenamiento y nutrición",
      keywords: [
        "estudiantes",
        "clientes",
        "planes de entrenamiento",
        "instructor",
      ],
      noindex: true,
    }),

  instructors: () =>
    generateMetadata({
      title: "Instructores",
      description:
        "Encuentra y contrata instructores certificados para tu entrenamiento",
      keywords: [
        "instructores",
        "entrenadores",
        "coaches",
        "fitness",
        "personal trainer",
      ],
    }),
};

/**
 * Helper para generar metadata de páginas de autenticación
 */
export const authSEO = {
  signin: () =>
    generateMetadata({
      title: "Iniciar Sesión",
      description: "Inicia sesión en tu cuenta de GymRat+",
      keywords: ["iniciar sesión", "login", "acceso", "cuenta"],
      noindex: true,
    }),

  signup: () =>
    generateMetadata({
      title: "Registrarse",
      description: "Crea tu cuenta en GymRat+ y comienza tu viaje fitness",
      keywords: ["registro", "signup", "crear cuenta", "nuevo usuario"],
      noindex: true,
    }),
};

/**
 * Helper para generar metadata de onboarding
 */
export const onboardingSEO = {
  main: () =>
    generateMetadata({
      title: "Primeros pasos",
      description:
        "Completa tu perfil y configura tu cuenta para una experiencia personalizada",
      keywords: [
        "onboarding",
        "configuración inicial",
        "bienvenida",
        "primeros pasos",
        "introducción",
      ],
      noindex: true,
    }),

  recommendations: () =>
    generateMetadata({
      title: "Recomendaciones",
      description:
        "Recibe recomendaciones personalizadas basadas en tus objetivos",
      keywords: [
        "recomendaciones",
        "sugerencias",
        "personalización",
        "objetivos",
      ],
      noindex: true,
    }),
};

/**
 * Helper para generar metadata personalizada
 * Útil para páginas dinámicas o con contenido específico
 */
export function customSEO(config: SEOConfig): Metadata {
  return generateMetadata(config);
}
