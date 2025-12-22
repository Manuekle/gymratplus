import { NextResponse } from "next/server";
import { getPayPalClient, getBaseUrl } from "@/lib/paypal/client";
import {
  SubscriptionsController,
  ApplicationContextUserAction,
  ExperienceContextShippingPreference,
  PayeePaymentMethodPreference,
} from "@paypal/paypal-server-sdk";
import { prisma } from "@/lib/database/prisma";
import { auth } from "../../../../../../auth.ts";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { planId, planType } = body;

    if (!planId || !planType) {
      return NextResponse.json(
        { error: "Plan ID y tipo de plan son requeridos" },
        { status: 400 },
      );
    }

    const paypalClient = getPayPalClient();
    const subscriptionsController = new SubscriptionsController(paypalClient);
    const baseUrl = getBaseUrl();

    // Crear la suscripción en PayPal
    const subscriptionRequest = {
      planId: planId,
      startTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 días de prueba gratis
      subscriber: {
        name: {
          givenName: session.user.name?.split(" ")[0] || "Usuario",
          surname: session.user.name?.split(" ").slice(1).join(" ") || "",
        },
      },
      applicationContext: {
        brandName: "GymRat Plus",
        locale: "es-ES",
        shippingPreference: ExperienceContextShippingPreference.NoShipping,
        userAction: ApplicationContextUserAction.SubscribeNow,
        paymentMethod: {
          payeePreferred: PayeePaymentMethodPreference.ImmediatePaymentRequired,
        },
        returnUrl: `${baseUrl}/dashboard/profile/payment?success=true`,
        cancelUrl: `${baseUrl}/dashboard/profile/payment?canceled=true`,
      },
    };

    const result = await subscriptionsController.createSubscription({
      body: subscriptionRequest,
    });

    if (result.statusCode !== 201 || !result.result) {
      throw new Error("Error al crear la suscripción en PayPal");
    }

    const subscription = result.result;

    // Guardar el ID de la suscripción en la base de datos
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        subscriptionStatus: "trialing",
        planType,
      },
    });

    // Buscar el link de aprobación en la respuesta
    const approvalLink = subscription.links?.find(
      (link) => link.rel === "approve",
    );

    if (!approvalLink?.href) {
      throw new Error("No se encontró el link de aprobación de PayPal");
    }

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      approvalUrl: approvalLink.href,
      subscription: subscription,
    });
  } catch (error) {
    console.error("Error creating PayPal subscription:", error);
    return NextResponse.json(
      {
        error: "Error al crear la suscripción",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    );
  }
}
