import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { getPayPalClient, getBaseUrl } from "@/lib/paypal/client";
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
    const session = await getServerSession(authOptions);

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
        { status: 400 }
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

    // Crear o verificar el plan de suscripción en PayPal
    let planId = process.env[`PAYPAL_PLAN_ID_${planType.toUpperCase()}`];

    // Si no existe un plan pre-configurado, crear uno nuevo
    if (!planId) {
      // Obtener o crear el Product ID
      let productId = process.env.PAYPAL_PRODUCT_ID;

      // Si no existe PAYPAL_PRODUCT_ID, intentar crear un Product usando la API REST de PayPal
      if (!productId) {
        try {
          const environment = process.env.PAYPAL_ENVIRONMENT || "sandbox";
          const baseUrl = environment === "live" 
            ? "https://api.paypal.com" 
            : "https://api.sandbox.paypal.com";
          
          const clientId = process.env.PAYPAL_CLIENT_ID;
          const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

          if (!clientId || !clientSecret) {
            throw new Error(
              "PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET deben estar configurados. Por favor, verifica tus variables de entorno."
            );
          }
          
          // Obtener access token
          const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "Authorization": `Basic ${Buffer.from(
                `${clientId}:${clientSecret}`
              ).toString("base64")}`,
            },
            body: "grant_type=client_credentials",
          });

          if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error("Error obteniendo token de PayPal:", errorText);
            throw new Error(
              `Error de autenticación con PayPal (${tokenResponse.status}). Verifica que PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET sean correctos y correspondan al entorno ${environment}.`
            );
          }

          const tokenData = await tokenResponse.json();
          const accessToken = tokenData.access_token;

          if (!accessToken) {
            throw new Error("No se recibió el access token de PayPal");
          }

          // Crear Product
          const productResponse = await fetch(`${baseUrl}/v1/catalogs/products`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              name: "GymRat Plus - Suscripción Instructor",
              description: "Suscripción para instructores de GymRat Plus",
              type: "SERVICE",
              category: "SOFTWARE",
            }),
          });

          if (productResponse.ok) {
            const productData = await productResponse.json();
            productId = productData.id;
            console.log(`Product creado en PayPal: ${productId}`);
          } else {
            const errorText = await productResponse.text();
            console.error("Error creando Product en PayPal:", errorText);
            throw new Error(
              `No se pudo crear el Product en PayPal (${productResponse.status}). Por favor, crea un Product manualmente en PayPal Dashboard (https://developer.paypal.com/dashboard) y configura PAYPAL_PRODUCT_ID en las variables de entorno.`
            );
          }
        } catch (error) {
          console.error("Error creando Product:", error);
          const errorMessage = error instanceof Error 
            ? error.message 
            : "Error desconocido al crear Product";
          throw new Error(
            `PAYPAL_PRODUCT_ID no está configurado y no se pudo crear automáticamente: ${errorMessage}. Por favor, crea un Product en PayPal Dashboard (https://developer.paypal.com/dashboard) y configura PAYPAL_PRODUCT_ID en las variables de entorno.`
          );
        }
      }

      const planRequest = {
        productId: productId,
        name: planName,
        description: `Suscripción ${planType === "monthly" ? "mensual" : "anual"} para instructores`,
        status: PlanRequestStatus.Active,
        billingCycles: [
          {
            frequency: {
              intervalUnit: billingCycle === "MONTH" ? IntervalUnit.Month : IntervalUnit.Year,
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
        const errorDetails = result.body ? JSON.stringify(result.body) : "Sin detalles";
        console.error("Error creando plan:", {
          statusCode: result.statusCode,
          body: result.body,
          result: result.result,
        });
        throw new Error(
          `Error al crear el plan en PayPal (${result.statusCode}): ${errorDetails}`
        );
      }

      planId = result.result.id;
      console.log(`Plan creado en PayPal: ${planId} (${planType})`);
    }

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
      const errorDetails = result.body ? JSON.stringify(result.body) : "Sin detalles";
      console.error("Error creando suscripción:", {
        statusCode: result.statusCode,
        body: result.body,
        result: result.result,
        request: subscriptionRequest,
      });
      throw new Error(
        `Error al crear la suscripción en PayPal (${result.statusCode}): ${errorDetails}`
      );
    }

    const subscription = result.result;

    // Buscar el link de aprobación en la respuesta
    const approvalLink = subscription.links?.find(
      (link) => link.rel === "approve"
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
        details: errorDetails || (error instanceof Error ? error.message : "Error desconocido"),
        // Incluir información adicional para debugging
        ...(process.env.NODE_ENV === "development" && {
          stack: error instanceof Error ? error.stack : undefined,
        }),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
