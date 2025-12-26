/**
 * Subscription Tier System
 *
 * Manages access control for features based on user subscription tier
 */

export enum SubscriptionTier {
  FREE = "FREE",
  PRO = "PRO",
  INSTRUCTOR = "INSTRUCTOR",
}

/**
 * Hierarchy of subscription tiers (higher number = higher tier)
 */
export const TIER_HIERARCHY = {
  [SubscriptionTier.FREE]: 0,
  [SubscriptionTier.PRO]: 1,
  [SubscriptionTier.INSTRUCTOR]: 2,
} as const;

/**
 * Check if a user's tier has access to a required tier
 */
export function hasAccess(
  userTier: string,
  requiredTier: SubscriptionTier,
): boolean {
  const userLevel = TIER_HIERARCHY[userTier as SubscriptionTier] ?? 0;
  const requiredLevel = TIER_HIERARCHY[requiredTier];
  return userLevel >= requiredLevel;
}

/**
 * Feature definitions with their required subscription tier
 */
export const FEATURES = {
  // FREE tier features
  BASIC_WORKOUTS: {
    tier: SubscriptionTier.FREE,
    name: "Entrenamientos Básicos",
    description: "Crear y ver tus propios entrenamientos",
  },
  WEIGHT_TRACKING: {
    tier: SubscriptionTier.FREE,
    name: "Seguimiento de Peso",
    description: "Registra y visualiza tu progreso de peso",
  },
  COMMUNITY: {
    tier: SubscriptionTier.FREE,
    name: "Comunidad",
    description: "Acceso a la comunidad de GymRat+",
  },

  // PRO tier features
  CUSTOM_PLANS: {
    tier: SubscriptionTier.PRO,
    name: "Planes Personalizados",
    description: "Planes de entrenamiento adaptados a tus objetivos",
  },
  AI_NUTRITION: {
    tier: SubscriptionTier.PRO,
    name: "Nutrición IA",
    description: "Planes nutricionales con inteligencia artificial",
  },
  INSTRUCTOR_CHAT: {
    tier: SubscriptionTier.PRO,
    name: "Chat con Instructores",
    description: "Comunícate directamente con tu entrenador",
  },
  FOOD_RECOMMENDATIONS: {
    tier: SubscriptionTier.PRO,
    name: "Recomendaciones de Comida",
    description: "Sugerencias personalizadas de alimentos",
  },
  ADVANCED_TRACKING: {
    tier: SubscriptionTier.PRO,
    name: "Seguimiento Avanzado",
    description: "Análisis detallado de tu progreso",
  },

  // INSTRUCTOR tier features
  STUDENT_MANAGEMENT: {
    tier: SubscriptionTier.INSTRUCTOR,
    name: "Gestión de Estudiantes",
    description: "Administra tus clientes y su progreso",
  },
  UNLIMITED_PLANS: {
    tier: SubscriptionTier.INSTRUCTOR,
    name: "Planes Ilimitados",
    description: "Crea planes sin límites para tus estudiantes",
  },
  ADVANCED_ANALYTICS: {
    tier: SubscriptionTier.INSTRUCTOR,
    name: "Analíticas Avanzadas",
    description: "Dashboard completo con métricas detalladas",
  },
  INSTRUCTOR_PROFILE: {
    tier: SubscriptionTier.INSTRUCTOR,
    name: "Perfil de Instructor",
    description: "Perfil público para atraer estudiantes",
  },
  WORKOUT_ASSIGNMENT: {
    tier: SubscriptionTier.INSTRUCTOR,
    name: "Asignación de Rutinas",
    description: "Asigna rutinas personalizadas a estudiantes",
  },
} as const;

export type FeatureName = keyof typeof FEATURES;

/**
 * Check if a user can access a specific feature
 */
export function canAccessFeature(
  userTier: string,
  featureName: FeatureName,
): boolean {
  const feature = FEATURES[featureName];
  if (!feature) return false;
  return hasAccess(userTier, feature.tier);
}

/**
 * Get all features available for a tier
 */
export function getFeaturesForTier(tier: SubscriptionTier): FeatureName[] {
  return Object.entries(FEATURES)
    .filter(([_, feature]) => hasAccess(tier, feature.tier))
    .map(([name, _]) => name as FeatureName);
}

/**
 * Get the tier name in Spanish
 */
export function getTierName(tier: string): string {
  const names: Record<string, string> = {
    [SubscriptionTier.FREE]: "Gratis",
    [SubscriptionTier.PRO]: "Pro",
    [SubscriptionTier.INSTRUCTOR]: "Instructor",
  };
  return names[tier] || "Desconocido";
}

/**
 * Get the tier price
 */
export function getTierPrice(tier: string): string {
  const prices: Record<string, string> = {
    [SubscriptionTier.FREE]: "$0",
    [SubscriptionTier.PRO]: "$9.99",
    [SubscriptionTier.INSTRUCTOR]: "$19.99",
  };
  return prices[tier] || "$0";
}

/**
 * Mercado Pago Plan ID to Subscription Tier mapping
 *
 * IMPORTANT: Update these with real Plan IDs from Mercado Pago when ready for production
 */

export const MERCADOPAGO_PLAN_MAPPING: Record<string, SubscriptionTier> = {
  // Real Mercado Pago Plan IDs from your account
  [process.env.MERCADOPAGO_PLAN_ID_PRO || ""]: SubscriptionTier.PRO,
  [process.env.MERCADOPAGO_PLAN_ID_INSTRUCTOR || ""]:
    SubscriptionTier.INSTRUCTOR,
};

/**
 * Get subscription tier from Mercado Pago plan ID
 */
export function getTierFromMercadoPagoPlan(planId: string): SubscriptionTier {
  if (planId === process.env.MERCADOPAGO_PLAN_ID_PRO) return SubscriptionTier.PRO;
  if (planId === process.env.MERCADOPAGO_PLAN_ID_INSTRUCTOR)
    return SubscriptionTier.INSTRUCTOR;

  return MERCADOPAGO_PLAN_MAPPING[planId] || SubscriptionTier.FREE;
}
