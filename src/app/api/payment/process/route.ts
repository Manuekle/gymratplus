import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { getPayPalClient, getBaseUrl } from "@/lib/paypal/client";
import { auth } from "../../../../../../../../../../auth";
import {
  SubscriptionsController,
  PlanRequestStatus,
  ApplicationContextUserAction,
  ExperienceContextShippingPreference,
  PayeePaymentMethodPreference,
  IntervalUnit,
  TenureType,
  SetupFeeFailureAction,
} from "@paypal/paypal-server-sdk";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { planType, ...instructorData } = body;

    if (!planType || !["monthly", "annual"].includes(planType)) {
      return NextResponse.json(
        { error: "Tipo de plan inválido" },
        { status: 400 },
      );
    }

    const paypalClient = getPayPalClient();
    const subscriptionsController = new SubscriptionsController(paypalClient);
    const baseUrl = getBaseUrl();

    // Precios según el plan
    const prices = {
      monthly: "5.99",
      annual: "50.00",
    };

    const planName = planType === "monthly" ? "Plan Mensual" : "Plan Anual";
    const price = prices[planType as keyof typeof prices];
    const billingCycle = planType === "monthly" ? "MONTH" : "YEAR";

    // Map plan types to real PayPal Plan IDs
    const PAYPAL_PLAN_IDS: Record<string, string> = {
      monthly: "P-3NC83718PK617725CNFENPCA", // Plan PRO - $9.99/mes
      annual: "P-8D459588D1260134BNFENROI", // Plan INSTRUCTOR - $19.99/mes
      pro: "P-3NC83718PK617725CNFENPCA", // Alias for PRO
      instructor: "P-8D459588D1260134BNFENROI", // Alias for INSTRUCTOR
    };

    // Get Plan ID from mapping
    let planId = PAYPAL_PLAN_IDS[planType.toLowerCase()];

    if (!planId) {
      return NextResponse.json(
        { error: `Plan type inválido: ${planType}` },
        { status: 400 },
      );
    }

    // Crear la suscripción en PayPal usando el Plan ID existente
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
      const errorDetails = result.body
        ? JSON.stringify(result.body)
        : "Sin detalles";
      console.error("Error creando suscripción:", {
        statusCode: result.statusCode,
        body: result.body,
        result: result.result,
        request: subscriptionRequest,
      });
      throw new Error(
        `Error al crear la suscripción en PayPal (${result.statusCode}): ${errorDetails}`,
      );
    }

    const subscription = result.result;

    // Buscar el link de aprobación en la respuesta
    const approvalLink = subscription.links?.find(
      (link) => link.rel === "approve",
    );

    if (!approvalLink?.href) {
      throw new Error("No se encontró el link de aprobación de PayPal");
    }

    // Calcular fechas
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const currentPeriodEnd = new Date();
    if (planType === "annual") {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    // Actualizar usuario con información de la suscripción (estado pendiente hasta aprobación)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        subscriptionStatus: "trialing",
        planType,
        trialEndsAt,
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
      },
    });

    // Si hay datos del instructor, guardarlos también
    if (instructorData && Object.keys(instructorData).length > 0) {
      // Esto se manejará en el endpoint de registro de instructor
      // Por ahora solo retornamos la URL de aprobación
    }

    return NextResponse.json({
      success: true,
      message: "Redirigiendo a PayPal para completar el pago",
      approvalUrl: approvalLink.href,
      subscriptionId: subscription.id,
      subscription: {
        status: "trialing",
        planType,
        trialEndsAt,
        currentPeriodEnd,
      },
    });
  } catch (error) {
    console.error("Error processing payment:", error);

    // Extraer más información del error
    let errorMessage = "Error desconocido";
    let errorDetails = "";

    if (error instanceof Error) {
      errorMessage = error.message;

      // Si el error tiene más información (como de PayPal SDK)
      if ("body" in error && typeof error.body === "string") {
        try {
          const errorBody = JSON.parse(error.body);
          errorDetails = errorBody.error_description || errorBody.message || "";
        } catch {
          errorDetails = error.body;
        }
      } else if ("result" in error && error.result) {
        errorDetails = JSON.stringify(error.result);
      }
    }

    return new NextResponse(
      JSON.stringify({
        error: "Error al procesar la suscripción",
        message: errorMessage,
        details:
          errorDetails ||
          (error instanceof Error ? error.message : "Error desconocido"),
        // Incluir información adicional para debugging
        ...(process.env.NODE_ENV === "development" && {
          stack: error instanceof Error ? error.stack : undefined,
        }),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
