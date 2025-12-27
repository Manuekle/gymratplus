import { NextResponse } from "next/server";
import {
  getMercadoPagoClient,
  getPreApprovalController,
  getBaseUrl,
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
    const { planType } = body;

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

    // Create subscription in Mercado Pago WITHOUT associated plan
    // Using status "pending" to get init_point for user payment
    const subscriptionRequest = {
      reason: `GymRat+ - Plan ${planType.toUpperCase()}`,
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

    console.log("[Payment Process] Creating subscription:", {
      planType,
      amount: planType === "pro" ? 37700 : 74500,
      currency: "COP",
      fullRequest: subscriptionRequest,
    });

    let result;
    try {
      result = await preApproval.create({ body: subscriptionRequest });
    } catch (mpError: any) {
      console.error("[Payment Process] Mercado Pago SDK Error:", {
        error: mpError,
        message: mpError?.message,
        cause: mpError?.cause,
        apiResponse: mpError?.apiResponse,
        status: mpError?.status,
        statusCode: mpError?.statusCode,
      });

      return NextResponse.json(
        {
          error: "Error al crear la suscripción en Mercado Pago",
          message: mpError?.message || "Error desconocido",
          details: mpError?.cause?.message || mpError?.apiResponse?.message,
          ...(process.env.NODE_ENV === "development" && {
            debug: {
              error: String(mpError),
              apiResponse: mpError?.apiResponse,
              cause: mpError?.cause,
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

    console.log(
      "[Payment Process] Subscription created, redirecting to payment:",
      {
        subscriptionId: result.id,
        initPoint: result.init_point,
      },
    );

    return NextResponse.json({
      success: true,
      message: "Redirigiendo a Mercado Pago para completar el pago",
      approvalUrl: result.init_point,
      subscriptionId: result.id,
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
