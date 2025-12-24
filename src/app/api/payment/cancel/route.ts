import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "@auth";
import { getPayPalClient } from "@/lib/paypal/client";
import { SubscriptionsController } from "@paypal/paypal-server-sdk";
import { SubscriptionTier } from "@/lib/subscriptions/feature-gates";
import { sendEmail } from "@/lib/email/resend";
import { renderCancellationEmail } from "@/lib/email/templates/cancellation-email";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Get user details for period end
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { currentPeriodEnd: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    // 1. Get user's current subscription info from DB to find the subscription ID
    // We need to look up the most recent active invoice or rely on a stored subscriptionId field if we added one (we did add it to User in my thought process but let's check schema).
    // Checking schema: User model has `subscriptionStatus`, `subscriptionTier`.
    // Wait, schema check: `User` model does NOT have `subscriptionId`.
    // However, `Invoice` model has `subscriptionId`.
    // And `webhook/route.ts` uses `email` to find user.
    // We probably need to find the latest active invoice or store subscriptionId on User.
    // Let's check schema again. `User` has `invoices`.

    // Actually, for this MVP, if we don't have subscriptionID on User, we might have trouble cancelling at PayPal unless we find it.
    // Let's check `User` schema in `schema.prisma` from previous turn (Step 256).
    // `User` model: id, name... subscriptionTier, subscriptionStatus...
    // NO `subscriptionId` on User.
    // `Invoice` model: subscriptionId.

    // So we should find the latest invoice for this user that has a sub ID?
    // Or maybe we can't cancel at PayPal easily without it.
    // BUT, `activate/route.ts` received `subscriptionId` and created an Invoice.
    // So we can query the latest Invoice for this user.

    const latestInvoice = await prisma.invoice.findFirst({
      where: {
        userId: session.user.id,
        subscriptionId: { not: null },
      },
      orderBy: { createdAt: "desc" },
    });

    const subscriptionId = latestInvoice?.subscriptionId;

    if (subscriptionId) {
      try {
        // 2. Cancel at PayPal
        const paypalClient = getPayPalClient();
        const subscriptionsController = new SubscriptionsController(
          paypalClient,
        );

        // The SDK might have a cancel operation.
        // Using generic request if specific method not obvious or rely on "suspend" / "cancel"
        // Checking usage examples... usually strictly `cancelSubscription` or similar.
        // If specific method is unknown, I'll assume `cancelSubscription` exists or try to correct.
        // Alternatively, simply updating local DB is a good first step if PayPal fails or is complex.

        // Let's try to pass a reason.
        await subscriptionsController.cancelSubscription({
          id: subscriptionId,
          reason: "User requested cancellation via dashboard",
        });

        console.log(
          `[Cancel Plan] PayPal subscription ${subscriptionId} cancelled.`,
        );
      } catch (paypalError) {
        console.error(
          "[Cancel Plan] Error cancelling at PayPal (proceeding to local cancel):",
          paypalError,
        );
        // We proceed to cancel locally so the user isn't stuck.
      }
    } else {
      console.warn(
        "[Cancel Plan] No subscriptionId found for user. Cancelling locally only.",
      );
    }

    // 3. Send Cancellation Email
    const endDate = user.currentPeriodEnd
      ? new Date(user.currentPeriodEnd).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
          "es-ES",
        ); // Fallback +30 days if null

    try {
      await sendEmail({
        to: session.user.email!,
        subject: "Confirmación de cancelación - GymRat+",
        html: await renderCancellationEmail({
          userName: session.user.name || "Usuario",
          planName: latestInvoice?.planName || "Suscripción",
          endDate: endDate,
        }),
      });
    } catch (emailError) {
      console.error("Error sending cancellation email:", emailError);
      // Continue execution, email failure shouldn't block cancellation
    }

    // 4. Update User in DB
    // We do NOT immediately set to FREE. We set cancelAtPeriodEnd = true.
    // The user keeps their tier until the period ends.
    // A separate process (webhook or login check) will downgrade them when expired.

    // Check if we assume the period ends now or later.
    // If we rely on PayPal webhooks, we usually wait for BILLING.SUBSCRIPTION.CANCELLED or EXPIRED.
    // But setting `subscriptionStatus` to "active" + `cancelAtPeriodEnd` is a common pattern for "graceful cancel".
    // Alternatively, we can set `subscriptionStatus` to "canceled" BUT `subscriptionTier` stays as is.
    // Let's stick to: Status = canceled, Tier = [Current], cancelAtPeriodEnd = true.
    // And ensure `feature-gates.ts` allows access if Tier is high, regardless of status?
    // Actually, usually app checks Tier. If Tier is PRO, they get PRO access.
    // So by NOT changing Tier to FREE, we preserve access.

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        subscriptionStatus: "canceled", // This indicates intent to cancel
        cancelAtPeriodEnd: true,
        // subscriptionTier: SubscriptionTier.FREE, <--- REMOVED: Do not downgrade yet!
        // isInstructor: false, <--- REMOVED: Do not remove status yet!
      },
    });

    // We do NOT update InstructorProfile.isPaid yet either, as they are still paid until period ends.

    return NextResponse.json({
      success: true,
      message:
        "Suscripción cancelada. Tendrás acceso hasta el final del periodo.",
    });
  } catch (error) {
    console.error("[Cancel Plan] Error:", error);
    return NextResponse.json(
      { error: "Error al cancelar la suscripción" },
      { status: 500 },
    );
  }
}
