import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { getPreApprovalController } from "@/lib/mercadopago/client";
import { sendEmail } from "@/lib/email/resend";
import { renderInvoiceEmail } from "@/lib/email/templates/invoice-email";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("[Mercado Pago Webhook] Received notification:", {
      type: body.type,
      action: body.action,
      data: body.data,
    });

    // Mercado Pago sends different types of notifications
    // For preapprovals (subscriptions), we're interested in:
    // - preapproval (subscription created/updated)
    // - authorized_payment (payment was successful)

    if (body.type === "preapproval" || body.type === "subscription_preapproval") {
      const preapprovalId = body.data?.id;

      if (!preapprovalId) {
        return NextResponse.json({ received: true });
      }

      // Get preapproval details from Mercado Pago
      const preApproval = getPreApprovalController();
      let subscription;

      try {
        subscription = await preApproval.get({ id: preapprovalId });
        console.log("[Webhook] Subscription details:", {
          id: subscription.id,
          status: subscription.status,
          payer_email: subscription.payer_email,
          amount: subscription.auto_recurring?.transaction_amount,
        });
      } catch (mpError: any) {
        console.error("[Webhook] Error fetching subscription:", mpError);
        return NextResponse.json({ received: true, error: "Failed to fetch subscription" });
      }

      // For now, we'll handle based on the action
      switch (body.action) {
        case "created":
        case "updated":
          console.log(`[Webhook] Preapproval ${body.action}:`, preapprovalId);

          // Only activate if subscription is authorized or active
          if (subscription.status === "authorized" || subscription.status === "active") {
            // Find user by external_reference (userId) or payer email
            const userId = subscription.external_reference;
            const payerEmail = subscription.payer_email;

            let user;

            if (userId) {
              console.log("[Webhook] Finding user by external_reference:", userId);
              user = await prisma.user.findUnique({
                where: { id: userId },
              });
            }

            if (!user && payerEmail) {
              console.log("[Webhook] Finding user by email (fallback):", payerEmail);
              user = await prisma.user.findUnique({
                where: { email: payerEmail },
              });
            }

            if (!user) {
              console.error("[Webhook] User not found. External reference:", userId, "Email:", payerEmail);
              break;
            }

            // Determine plan type from subscription amount
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
              where: { id: user.id },
              data: {
                subscriptionStatus: "active",
                subscriptionTier,
                planType,
                trialEndsAt,
                currentPeriodEnd,
                cancelAtPeriodEnd: false,
              },
            });

            console.log("[Webhook] Subscription activated:", {
              userId: updatedUser.id,
              tier: updatedUser.subscriptionTier,
              status: updatedUser.subscriptionStatus,
            });

            // Create Invoice Record
            const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const finalAmount = amount || (subscriptionTier === "PRO" ? 37700 : 74500);
            const planNameDisplay =
              subscriptionTier === "PRO" ? "GymRat+ - Plan PRO" : "GymRat+ - Plan Instructor";

            await prisma.invoice.create({
              data: {
                userId: user.id,
                invoiceNumber,
                subscriptionId: preapprovalId,
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
                userName: user.name || "Usuario",
                userEmail: user.email!,
                invoiceNumber,
                invoiceDate: new Date().toLocaleDateString("es-CO"),
                planName: planNameDisplay,
                planType: "monthly",
                amount: finalAmount,
                currency: "COP",
                trialEndsAt: trialEndsAt.toLocaleDateString("es-CO"),
                nextBillingDate: currentPeriodEnd.toLocaleDateString("es-CO"),
                subscriptionId: preapprovalId,
              });

              await sendEmail({
                to: user.email!,
                subject: "¡Bienvenido a GymRat+! - Confirmación de suscripción",
                html: emailHtml,
              });

              console.log("[Webhook] Welcome email sent to:", user.email);
            } catch (emailError) {
              console.error("[Webhook] Error sending welcome email:", emailError);
            }
          } else {
            console.log("[Webhook] Subscription not authorized yet, status:", subscription.status);
          }
          break;

        case "cancelled":
          console.log("[Webhook] Preapproval cancelled:", preapprovalId);
          // Find user by subscription ID and update
          const invoice = await prisma.invoice.findFirst({
            where: { subscriptionId: preapprovalId },
            include: { user: true },
          });

          if (invoice) {
            await prisma.user.update({
              where: { id: invoice.userId },
              data: {
                subscriptionStatus: "canceled",
                subscriptionTier: "FREE",
                isInstructor: false,
              },
            });
          }
          break;

        default:
          console.log("[Webhook] Unknown action:", body.action);
      }
    }

    if (body.type === "authorized_payment") {
      const paymentId = body.data?.id;
      console.log("[Webhook] Payment authorized:", paymentId);

      // Payment was successful
      // You can update invoice records or send confirmation emails here
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Mercado Pago Webhook] Error processing webhook:", error);
    // Still return 200 to prevent retries
    return NextResponse.json({ received: true, error: "Processing failed" });
  }
}
