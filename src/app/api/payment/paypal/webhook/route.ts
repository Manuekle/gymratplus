import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { paypalClient } from "@/lib/payment/paypal-client";
import { SubscriptionsController } from "@paypal/paypal-server-sdk";
import {
  getTierFromPayPalPlan,
  SubscriptionTier,
} from "@/lib/subscriptions/feature-gates";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const eventType = body.event_type;
    const resource = body.resource;

    console.log("PayPal Webhook recibido:", eventType);

    // Verificar que el webhook viene de PayPal (en producción, verificar la firma)
    // Por ahora, procesamos los eventos directamente

    if (eventType === "BILLING.SUBSCRIPTION.CREATED") {
      // Suscripción creada
      const subscriptionId = resource?.id;
      const subscriberEmail = resource?.subscriber?.email_address;

      if (subscriptionId && subscriberEmail) {
        // Buscar usuario por email
        const user = await prisma.user.findUnique({
          where: { email: subscriberEmail },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: "trialing",
            },
          });
        }
      }
    } else if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED") {
      // Suscripción activada (después del período de prueba)
      const subscriptionId = resource?.id;
      const subscriberEmail = resource?.subscriber?.email_address;

      if (subscriptionId && subscriberEmail) {
        const user = await prisma.user.findUnique({
          where: { email: subscriberEmail },
        });

        if (user) {
          // Obtener detalles de la suscripción para calcular fechas y tier
          const payPalClientInstance = getPayPalClient();
          const subscriptionsController = new SubscriptionsController(
            payPalClientInstance,
          );
          const result = await subscriptionsController.getSubscription({
            id: subscriptionId,
          });

          if (result.result) {
            const subscription = result.result;
            const billingInfo = subscription.billing_info;
            const nextBillingTime = billingInfo?.next_billing_time
              ? new Date(billingInfo.next_billing_time)
              : null;

            // Determine tier from plan ID
            const planId = subscription.planId || "";
            const tier = getTierFromPayPalPlan(planId);

            // Determine if user should be instructor based on tier
            const shouldBeInstructor = tier === SubscriptionTier.INSTRUCTOR;

            await prisma.user.update({
              where: { id: user.id },
              data: {
                subscriptionStatus: "active",
                subscriptionTier: tier,
                currentPeriodEnd: nextBillingTime,
                isInstructor: shouldBeInstructor,
              },
            });

            // Update instructor profile if needed
            if (shouldBeInstructor) {
              await prisma.instructorProfile.upsert({
                where: { userId: user.id },
                update: { isPaid: true },
                create: {
                  userId: user.id,
                  isPaid: true,
                },
              });
            }
          }
        }
      }
    } else if (eventType === "BILLING.SUBSCRIPTION.CANCELLED") {
      // Suscripción cancelada
      const subscriptionId = resource?.id;
      const subscriberEmail = resource?.subscriber?.email_address;

      if (subscriptionId && subscriberEmail) {
        const user = await prisma.user.findUnique({
          where: { email: subscriberEmail },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: "canceled",
              subscriptionTier: SubscriptionTier.FREE,
              isInstructor: false,
            },
          });

          // También actualizar el perfil de instructor
          await prisma.instructorProfile.updateMany({
            where: { userId: user.id },
            data: { isPaid: false },
          });
        }
      }
    } else if (eventType === "BILLING.SUBSCRIPTION.SUSPENDED") {
      // Suscripción suspendida (pago fallido)
      const subscriptionId = resource?.id;
      const subscriberEmail = resource?.subscriber?.email_address;

      if (subscriptionId && subscriberEmail) {
        const user = await prisma.user.findUnique({
          where: { email: subscriberEmail },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: "past_due",
            },
          });
        }
      }
    } else if (eventType === "PAYMENT.SALE.COMPLETED") {
      // Pago completado
      const subscriptionId = resource?.billing_agreement_id;
      const subscriberEmail = resource?.payer_info?.email;

      if (subscriptionId && subscriberEmail) {
        const user = await prisma.user.findUnique({
          where: { email: subscriberEmail },
        });

        if (user) {
          // Actualizar el estado a activo cuando se completa el pago
          // Note: On payment completed, tier should already be set from ACTIVATED event
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: "active",
            },
          });

          // Update instructor profile only if user is instructor tier
          const updatedUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { subscriptionTier: true },
          });

          if (updatedUser?.subscriptionTier === SubscriptionTier.INSTRUCTOR) {
            await prisma.instructorProfile.upsert({
              where: { userId: user.id },
              update: { isPaid: true },
              create: {
                userId: user.id,
                isPaid: true,
              },
            });
          }
        }
      }
    } else if (eventType === "BILLING.SUBSCRIPTION.UPDATED") {
      // Suscripción actualizada
      const subscriptionId = resource?.id;
      const subscriberEmail = resource?.subscriber?.email_address;

      if (subscriptionId && subscriberEmail) {
        const user = await prisma.user.findUnique({
          where: { email: subscriberEmail },
        });

        if (user && resource.status) {
          const statusMap: Record<string, string> = {
            ACTIVE: "active",
            SUSPENDED: "past_due",
            CANCELLED: "canceled",
            EXPIRED: "canceled",
          };

          const mappedStatus = statusMap[resource.status] || "inactive";

          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: mappedStatus,
            },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing PayPal webhook:", error);
    return NextResponse.json(
      {
        error: "Error al procesar el webhook",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    );
  }
}
