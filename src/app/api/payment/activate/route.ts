import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { getPreApprovalController } from "@/lib/mercadopago/client";
import { auth } from "@auth";
import { sendEmail } from "@/lib/email/resend";
import { renderInvoiceEmail } from "@/lib/email/templates/invoice-email";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "subscription_id es requerido" },
        { status: 400 },
      );
    }

    console.log("[Payment Activate] Processing activation:", {
      userId: session.user.id,
      subscriptionId,
    });

    // Get subscription details from Mercado Pago
    const preApproval = getPreApprovalController();
    let subscription;

    try {
      subscription = await preApproval.get({ id: subscriptionId });
    } catch (mpError: any) {
      console.error("[Payment Activate] Mercado Pago Error:", mpError);
      return NextResponse.json(
        {
          error: "Error al verificar la suscripción",
          message: mpError?.message || "Error desconocido",
        },
        { status: 500 },
      );
    }

    console.log("[Payment Activate] Subscription status:", {
      id: subscription.id,
      status: subscription.status,
      reason: subscription.reason,
    });

    // Verify subscription is authorized or active
    if (
      subscription.status !== "authorized" &&
      subscription.status !== "active"
    ) {
      return NextResponse.json(
        {
          error: "Suscripción no autorizada",
          message: `Estado actual: ${subscription.status}`,
        },
        { status: 400 },
      );
    }

    // Determine plan type from subscription reason or auto_recurring amount
    const amount = subscription.auto_recurring?.transaction_amount;
    let planType: "pro" | "instructor";
    let subscriptionTier: "PRO" | "INSTRUCTOR";

    if (amount === 37700) {
      planType = "pro";
      subscriptionTier = "PRO";
    } else if (amount === 74500) {
      planType = "instructor";
      subscriptionTier = "INSTRUCTOR";
    } else {
      // Fallback: try to determine from reason
      const reason = subscription.reason?.toLowerCase() || "";
      if (reason.includes("instructor")) {
        planType = "instructor";
        subscriptionTier = "INSTRUCTOR";
      } else {
        planType = "pro";
        subscriptionTier = "PRO";
      }
    }

    // Calculate dates
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    // Update user with active subscription
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        subscriptionStatus: "active",
        subscriptionTier,
        planType,
        trialEndsAt,
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
      },
    });

    console.log("[Payment Activate] Subscription activated:", {
      userId: updatedUser.id,
      tier: updatedUser.subscriptionTier,
      status: updatedUser.subscriptionStatus,
    });

    // Create Invoice Record
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const finalAmount = amount || (subscriptionTier === "PRO" ? 37700 : 74500);
    const planNameDisplay =
      subscriptionTier === "PRO" ? "GymRat Plus - Plan PRO" : "GymRat Plus - Plan Instructor";

    await prisma.invoice.create({
      data: {
        userId: session.user.id,
        invoiceNumber,
        subscriptionId,
        planName: planNameDisplay,
        planType: "monthly",
        amount: finalAmount,
        currency: "COP",
        status: "paid",
        paidAt: new Date(),
        billingDate: new Date(),
      },
    });

    // Send Welcome/Invoice Email
    try {
      const emailHtml = await renderInvoiceEmail({
        userName: session.user.name || "Usuario",
        userEmail: session.user.email!,
        invoiceNumber,
        invoiceDate: new Date().toLocaleDateString("es-CO"),
        planName: planNameDisplay,
        planType: "monthly",
        amount: finalAmount,
        currency: "COP",
        trialEndsAt: trialEndsAt.toLocaleDateString("es-CO"),
        nextBillingDate: currentPeriodEnd.toLocaleDateString("es-CO"),
        subscriptionId: subscriptionId,
      });

      await sendEmail({
        to: session.user.email!,
        subject: "¡Bienvenido a GymRat+! - Confirmación de suscripción",
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Suscripción activada exitosamente",
      subscriptionTier,
      planType,
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
