import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import {
  getMercadoPagoClient,
  getPreApprovalController,
  getBaseUrl,
  MERCADOPAGO_PLAN_IDS,
} from "@/lib/mercadopago/client";
import { auth } from "@auth";

export async function POST(req: Request) {
  try {
    // Validate Mercado Pago credentials first
    try {
      getMercadoPagoClient();
    } catch (error) {
      console.error("Mercado Pago client initialization failed:", error);
      return NextResponse.json(
        {
          error: "Configuración de Mercado Pago incompleta",
          message:
            error instanceof Error
              ? error.message
              : "Error al inicializar cliente Mercado Pago",
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

    if (!planType || !["pro", "instructor"].includes(planType)) {
      return NextResponse.json(
        { error: "Tipo de plan inválido" },
        { status: 400 },
      );
    }

    const preApproval = getPreApprovalController();
    const baseUrl = getBaseUrl();

    // Get Plan ID from mapping
    const planId = MERCADOPAGO_PLAN_IDS[planType.toLowerCase() as keyof typeof MERCADOPAGO_PLAN_IDS];

    if (!planId) {
      console.error("[Payment Process] Invalid plan type:", planType);
      return NextResponse.json(
        { error: `Plan type inválido: ${planType}` },
        { status: 400 },
      );
    }

    console.log("[Payment Process] Using Mercado Pago Plan ID:", {
      planType,
      planId,
    });

    // Create subscription in Mercado Pago using PreApproval
    const subscriptionRequest = {
      preapproval_plan_id: planId,
      reason: `GymRat Plus - Plan ${planType.toUpperCase()}`,
      payer_email: session.user.email || undefined,
      back_url: `${baseUrl}/dashboard/profile/billing?success=true&plan_type=${planType}`,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: planType === "pro" ? 37700 : 74500,
        currency_id: "COP",
        free_trial: {
          frequency: 14,
          frequency_type: "days",
        },
      },
      status: "pending",
    };

    console.log("[Payment Process] Creating subscription with request:", {
      planId: subscriptionRequest.preapproval_plan_id,
      reason: subscriptionRequest.reason,
      payerEmail: subscriptionRequest.payer_email,
    });

    let result;
    try {
      result = await preApproval.create({ body: subscriptionRequest });
    } catch (mpError: any) {
      console.error("[Payment Process] Mercado Pago SDK Error:", {
        error: mpError,
        message: mpError?.message,
        cause: mpError?.cause,
      });

      return NextResponse.json(
        {
          error: "Error al crear la suscripción en Mercado Pago",
          message: mpError?.message || "Error desconocido",
          ...(process.env.NODE_ENV === "development" && {
            debug: {
              error: String(mpError),
            },
          }),
        },
        { status: 500 },
      );
    }

    console.log("[Payment Process] Mercado Pago response:", {
      id: result.id,
      status: result.status,
      initPoint: result.init_point,
    });

    if (!result.init_point) {
      throw new Error("No se encontró el link de aprobación de Mercado Pago");
    }

    // Calculate dates
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    // Update user with subscription information (pending until approval)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        subscriptionStatus: "trialing",
        subscriptionTier: planType === "pro" ? "PRO" : "INSTRUCTOR",
        planType,
        trialEndsAt,
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
      },
    });

    // If there's instructor data, save it
    if (instructorData && Object.keys(instructorData).length > 0) {
      // This will be handled in the instructor registration endpoint
      // For now just return the approval URL
    }

    return NextResponse.json({
      success: true,
      message: "Redirigiendo a Mercado Pago para completar el pago",
      approvalUrl: result.init_point,
      subscriptionId: result.id,
      subscription: {
        status: "trialing",
        planType,
        trialEndsAt,
        currentPeriodEnd,
      },
    });
  } catch (error) {
    console.error("Error processing payment:", error);

    let errorMessage = "Error desconocido";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return new NextResponse(
      JSON.stringify({
        error: "Error al procesar la suscripción",
        message: errorMessage,
        ...(process.env.NODE_ENV === "development" && {
          stack: error instanceof Error ? error.stack : undefined,
        }),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
