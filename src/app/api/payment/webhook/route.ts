import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

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

        if (body.type === "preapproval") {
            const preapprovalId = body.data?.id;

            if (!preapprovalId) {
                return NextResponse.json({ received: true });
            }

            // Get preapproval details from Mercado Pago
            // Note: In production, you should verify the webhook signature
            // and fetch the preapproval details from MP API to ensure authenticity

            // For now, we'll handle based on the action
            switch (body.action) {
                case "created":
                    console.log("[Webhook] Preapproval created:", preapprovalId);
                    // Subscription was created, update user status
                    break;

                case "updated":
                    console.log("[Webhook] Preapproval updated:", preapprovalId);
                    // Subscription was updated, check new status
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
