import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { getPayPalClient, getBaseUrl } from "@/lib/paypal/client";
import { auth } from "../../../../../auth";
import {
  SubscriptionsController,
  ApplicationContextUserAction,
  ExperienceContextShippingPreference,
  PayeePaymentMethodPreference,
} from "@paypal/paypal-server-sdk";

export async function POST(req: Request) {
  try {
    // Validate PayPal credentials first
    try {
      getPayPalClient();
    } catch (error) {
      console.error("PayPal client initialization failed:", error);
      return NextResponse.json(
        {
          error: "Configuración de PayPal incompleta",
          message:
            error instanceof Error
              ? error.message
              : "Error al inicializar cliente PayPal",
        },
        { status: 500 },
      );
    }

    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { planType, ...instructorData } = body;

    console.log("[Payment Process] Request received:", {
      planType,
      userId: session.user.id,
      userEmail: session.user.email,
    });

    if (!planType || !["monthly", "annual"].includes(planType)) {
      return NextResponse.json(
        { error: "Tipo de plan inválido" },
        { status: 400 },
      );
    }

    const paypalClient = getPayPalClient();
    const subscriptionsController = new SubscriptionsController(paypalClient);
    const baseUrl = getBaseUrl();

    // Map plan types to real PayPal Plan IDs
    // NOTE: These Plan IDs must exist in your PayPal Business account
    // To create plans, visit: https://www.paypal.com/billing/plans
    const PAYPAL_PLAN_IDS: Record<string, string> = {
      monthly: process.env.PAYPAL_PLAN_ID_PRO || "P-3NC83718PK617725CNFENPCA",
      annual:
        process.env.PAYPAL_PLAN_ID_INSTRUCTOR || "P-8D459588D1260134BNFENROI",
    };

    // Get Plan ID from mapping
    const planId = PAYPAL_PLAN_IDS[planType.toLowerCase()];

    if (!planId) {
      console.error("[Payment Process] Invalid plan type:", planType);
      return NextResponse.json(
        { error: `Plan type inválido: ${planType}` },
        { status: 400 },
      );
    }

    console.log("[Payment Process] Using PayPal Plan ID:", {
      planType,
      planId,
      isFromEnv:
        planType === "monthly"
          ? !!process.env.PAYPAL_PLAN_ID_PRO
          : !!process.env.PAYPAL_PLAN_ID_INSTRUCTOR,
    });

    // Crear la suscripción en PayPal usando el Plan ID existente
    const subscriptionRequest = {
      planId: planId,
      startTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 días de prueba gratis
      subscriber: {
        name: {
          givenName: session.user.name?.split(" ")[0] || "Usuario",
          surname: session.user.name?.split(" ").slice(1).join(" ") || "",
        },
        emailAddress: session.user.email || undefined,
      },
      applicationContext: {
        brandName: "GymRat Plus",
        locale: "es-ES",
        shippingPreference: ExperienceContextShippingPreference.NoShipping,
        userAction: ApplicationContextUserAction.SubscribeNow,
        paymentMethod: {
          payeePreferred: PayeePaymentMethodPreference.ImmediatePaymentRequired,
        },
        returnUrl: `${baseUrl}/dashboard/profile/billing?success=true`,
        cancelUrl: `${baseUrl}/dashboard/profile/payment?canceled=true`,
      },
    };

    console.log("[Payment Process] Creating subscription with request:", {
      planId: subscriptionRequest.planId,
      startTime: subscriptionRequest.startTime,
      subscriberName: subscriptionRequest.subscriber.name,
      returnUrl: subscriptionRequest.applicationContext.returnUrl,
    });

    let result;
    try {
      result = await subscriptionsController.createSubscription({
        body: subscriptionRequest,
      });
    } catch (paypalError: any) {
      console.error("[Payment Process] PayPal SDK Error:", {
        error: paypalError,
        message: paypalError?.message,
        statusCode: paypalError?.statusCode,
        body: paypalError?.body,
        result: paypalError?.result,
      });

      // Try to extract meaningful error message
      let errorMessage = "Error al comunicarse con PayPal";
      let errorDetails = "";

      if (paypalError?.body) {
        try {
          const errorBody =
            typeof paypalError.body === "string"
              ? JSON.parse(paypalError.body)
              : paypalError.body;
          errorMessage =
            errorBody.message || errorBody.error_description || errorMessage;
          errorDetails = JSON.stringify(errorBody, null, 2);
        } catch {
          errorDetails = String(paypalError.body);
        }
      }

      return NextResponse.json(
        {
          error: "Error al crear la suscripción en PayPal",
          message: errorMessage,
          details: errorDetails,
          planId: planId,
          ...(process.env.NODE_ENV === "development" && {
            debug: {
              statusCode: paypalError?.statusCode,
              paypalError: String(paypalError),
            },
          }),
        },
        { status: 500 },
      );
    }

    console.log("[Payment Process] PayPal response:", {
      statusCode: result.statusCode,
      subscriptionId: result.result?.id,
      links: result.result?.links?.map((l) => ({ rel: l.rel, href: l.href })),
    });

    if (result.statusCode !== 201 || !result.result) {
      const errorDetails = result.body
        ? JSON.stringify(result.body)
        : "Sin detalles";
      console.error("[Payment Process] Unexpected response:", {
        statusCode: result.statusCode,
        body: result.body,
        result: result.result,
      });

      return NextResponse.json(
        {
          error: "Respuesta inesperada de PayPal",
          message: `Status code: ${result.statusCode}`,
          details: errorDetails,
          ...(process.env.NODE_ENV === "development" && {
            debug: {
              statusCode: result.statusCode,
              body: result.body,
            },
          }),
        },
        { status: 500 },
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
