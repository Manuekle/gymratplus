import { NextResponse } from "next/server";
import { getPayPalClient } from "@/lib/paypal/client";
import { auth } from "../../../../../../auth.ts";
import {
  SubscriptionsController,
  PlanRequestStatus,
  IntervalUnit,
  TenureType,
  SetupFeeFailureAction,
} from "@paypal/paypal-server-sdk";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { planType } = body; // 'monthly' o 'annual'

    if (!planType || !["monthly", "annual"].includes(planType)) {
      return NextResponse.json(
        { error: "Tipo de plan inválido" },
        { status: 400 },
      );
    }

    const paypalClient = getPayPalClient();
    const subscriptionsController = new SubscriptionsController(paypalClient);

    // Precios según el plan
    const prices = {
      monthly: "5.99",
      annual: "50.00",
    };

    const planName = planType === "monthly" ? "Plan Mensual" : "Plan Anual";
    const price = prices[planType as keyof typeof prices];
    const billingCycle = planType === "monthly" ? "MONTH" : "YEAR";

    // Crear el plan de suscripción en PayPal
    const planRequest = {
      productId: process.env.PAYPAL_PRODUCT_ID || "PROD_DEFAULT",
      name: planName,
      description: `Suscripción ${planType === "monthly" ? "mensual" : "anual"} para instructores`,
      status: PlanRequestStatus.Active,
      billingCycles: [
        {
          frequency: {
            intervalUnit:
              billingCycle === "MONTH" ? IntervalUnit.Month : IntervalUnit.Year,
            intervalCount: 1,
          },
          tenureType: TenureType.Regular,
          sequence: 1,
          totalCycles: 0, // 0 = sin límite de ciclos
          pricingScheme: {
            fixedPrice: {
              value: price,
              currencyCode: "USD",
            },
          },
        },
      ],
      paymentPreferences: {
        autoBillOutstanding: true,
        setupFee: {
          value: "0.00",
          currencyCode: "USD",
        },
        setupFeeFailureAction: SetupFeeFailureAction.Continue,
        paymentFailureThreshold: 3,
      },
      taxes: {
        percentage: "0",
        inclusive: false,
      },
    };

    const result = await subscriptionsController.createBillingPlan({
      body: planRequest,
    });

    if (result.statusCode !== 201 || !result.result) {
      throw new Error("Error al crear el plan en PayPal");
    }

    return NextResponse.json({
      success: true,
      planId: result.result.id,
      plan: result.result,
    });
  } catch (error) {
    console.error("Error creating PayPal plan:", error);
    return NextResponse.json(
      {
        error: "Error al crear el plan de suscripción",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    );
  }
}
