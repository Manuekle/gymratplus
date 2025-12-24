import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "@auth";
import { getPayPalClient } from "@/lib/paypal/client";
import { SubscriptionsController } from "@paypal/paypal-server-sdk";
import {
  getTierFromPayPalPlan,
  SubscriptionTier,
} from "@/lib/subscriptions/feature-gates";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "ID de suscripción requerido" },
        { status: 400 },
      );
    }

    console.log("[Payment Activate] Activating subscription:", {
      subscriptionId,
      userId: session.user.id,
    });

    // 1. Fetch subscription details from PayPal to get the REAL plan
    const paypalClient = getPayPalClient();
    const subscriptionsController = new SubscriptionsController(paypalClient);

    let subscription;
    try {
      const result = await subscriptionsController.getSubscription({
        id: subscriptionId,
      });
      subscription = result.result;
    } catch (error) {
      console.error("[Payment Activate] Error fetching from PayPal:", error);
      return NextResponse.json(
        { error: "Error al verificar la suscripción con PayPal" },
        { status: 500 },
      );
    }

    if (!subscription) {
      return NextResponse.json(
        { error: "Suscripción no encontrada en PayPal" },
        { status: 404 },
      );
    }

    // 2. Determine Plan Type and Tier from PayPal data
    const planId = subscription.planId || "";
    const tier = getTierFromPayPalPlan(planId);

    // Map Tier to PlanType (legacy field, but needed for UI consistency)
    const planType = "monthly"; // All plans are monthly now per user request
    const planName =
      tier === SubscriptionTier.INSTRUCTOR ? "Instructor" : "Pro";
    const amount = tier === SubscriptionTier.INSTRUCTOR ? 19.99 : 9.99;

    // 3. Calculate Dates
    const now = new Date();
    const trialEndsAt = new Date(now);
    trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14 days trial

    const currentPeriodEnd = new Date(now);
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    // Determine isInstructor
    const isInstructor = tier === SubscriptionTier.INSTRUCTOR;

    // 4. Update user in database - CRITICAL: Update subscriptionTier
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        subscriptionStatus: "active", // Activate immediately upon user confirmation return
        subscriptionTier: tier, // Update the Tier!
        planType: planType,
        trialEndsAt: trialEndsAt,
        currentPeriodEnd: currentPeriodEnd,
        cancelAtPeriodEnd: false,
        isInstructor: isInstructor,
      },
    });

    // Update instructor profile if needed
    if (isInstructor) {
      await prisma.instructorProfile.upsert({
        where: { userId: session.user.id },
        update: { isPaid: true },
        create: {
          userId: session.user.id,
          isPaid: true,
        },
      });
    }

    console.log("[Payment Activate] User updated:", {
      userId: updatedUser.id,
      subscriptionStatus: updatedUser.subscriptionStatus,
      subscriptionTier: updatedUser.subscriptionTier,
      planType: updatedUser.planType,
      subscriptionId: subscriptionId,
    });

    // 5. Create invoice record
    const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const invoice = await prisma.invoice.create({
      data: {
        userId: session.user.id,
        invoiceNumber,
        subscriptionId,
        planName,
        planType,
        amount,
        currency: "USD",
        status: "paid",
        billingDate: now,
        paidAt: now,
      },
    });

    // 6. Send invoice email (non-blocking)
    try {
      await fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/email/send-invoice`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoiceNumber,
            planName,
            planType,
            amount,
            subscriptionId,
            trialEndsAt: trialEndsAt.toLocaleDateString("es-ES"),
            nextBillingDate: currentPeriodEnd.toLocaleDateString("es-ES"),
          }),
        },
      );
      console.log("[Payment Activate] Invoice email request sent");
    } catch (emailError) {
      console.error(
        "[Payment Activate] Failed to send invoice email:",
        emailError,
      );
    }

    return NextResponse.json({
      success: true,
      message: "Suscripción activada exitosamente",
      subscription: {
        id: subscriptionId,
        status: updatedUser.subscriptionStatus,
        tier: updatedUser.subscriptionTier,
        planType: updatedUser.planType,
        trialEndsAt: updatedUser.trialEndsAt,
        currentPeriodEnd: updatedUser.currentPeriodEnd,
      },
      invoice: {
        number: invoiceNumber,
        amount,
        planName,
      },
    });
  } catch (error) {
    console.error("[Payment Activate] Error:", error);

    return NextResponse.json(
      {
        error: "Error al activar la suscripción",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    );
  }
}
