import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { hasAccess, SubscriptionTier } from "@/lib/subscriptions/feature-gates";

/**
 * Server-side access control helper
 * Use this in server components or server actions to check subscription access
 */
export async function requireSubscription(
  requiredTier: SubscriptionTier,
  redirectUrl?: string,
) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userTier =
    (session.user as any).subscriptionTier || SubscriptionTier.FREE;

  if (!hasAccess(userTier, requiredTier)) {
    const upgradeParam =
      requiredTier === SubscriptionTier.INSTRUCTOR
        ? "instructor"
        : requiredTier === SubscriptionTier.PRO
          ? "pro"
          : "";

    redirect(
      redirectUrl || `/dashboard/profile/billing?upgrade=${upgradeParam}`,
    );
  }

  return session;
}

/**
 * Check if user has access without redirecting
 */
export async function checkSubscriptionAccess(
  requiredTier: SubscriptionTier,
): Promise<boolean> {
  const session = await auth();

  if (!session?.user) {
    return false;
  }

  const userTier =
    (session.user as any).subscriptionTier || SubscriptionTier.FREE;

  return hasAccess(userTier, requiredTier);
}
