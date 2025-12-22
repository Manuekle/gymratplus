"use client";

import { useSession } from "next-auth/react";
import {
  canAccessFeature,
  FEATURES,
  FeatureName,
  SubscriptionTier,
} from "@/lib/subscriptions/feature-gates";
import { UpgradePrompt } from "./UpgradePrompt";

interface FeatureGateProps {
  feature: FeatureName;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

/**
 * Client-side feature gate component
 * Conditionally renders children based on user's subscription tier
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
}: FeatureGateProps) {
  const { data: session, status } = useSession();

  // While loading, show nothing
  if (status === "loading") {
    return null;
  }

  const userTier =
    (session?.user as any)?.subscriptionTier || SubscriptionTier.FREE;

  if (canAccessFeature(userTier, feature)) {
    return <>{children}</>;
  }

  // User doesn't have access
  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    return <UpgradePrompt requiredFeature={feature} />;
  }

  return null;
}
