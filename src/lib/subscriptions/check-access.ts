import { auth } from "../../../auth";
import {
  canAccessFeature,
  FEATURES,
  FeatureName,
  SubscriptionTier,
} from "./feature-gates";

/**
 * Require a specific feature access (throws if unauthorized)
 * Use in API routes and server components
 */
export async function requireFeature(featureName: FeatureName) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized - No session found");
  }

  const userTier =
    (session.user as any).subscriptionTier || SubscriptionTier.FREE;

  if (!canAccessFeature(userTier, featureName)) {
    const feature = FEATURES[featureName];
    throw new Error(
      `Upgrade required - This feature requires ${feature.tier} tier`,
    );
  }

  return true;
}

/**
 * Check if current user has access to a feature (returns boolean)
 * Use in API routes and server components
 */
export async function hasFeatureAccess(
  featureName: FeatureName,
): Promise<boolean> {
  try {
    const session = await auth();

    if (!session?.user) {
      return false;
    }

    const userTier =
      (session.user as any).subscriptionTier || SubscriptionTier.FREE;
    return canAccessFeature(userTier, featureName);
  } catch {
    return false;
  }
}

/**
 * Get current user's subscription tier
 */
export async function getCurrentTier(): Promise<SubscriptionTier> {
  const session = await auth();

  if (!session?.user) {
    return SubscriptionTier.FREE;
  }

  return (session.user as any).subscriptionTier || SubscriptionTier.FREE;
}
