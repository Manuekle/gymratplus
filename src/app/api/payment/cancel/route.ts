import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "@auth";
import { getPreApprovalController } from "@/lib/mercadopago/client";
import { sendEmail } from "@/lib/email/resend";
import { renderCancellationEmail } from "@/lib/email/templates/cancellation-email";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { currentPeriodEnd: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    // Find the latest invoice with subscription ID
    const latestInvoice = await prisma.invoice.findFirst({
      where: {
        userId: session.user.id,
        subscriptionId: { not: null },
      },
      orderBy: { createdAt: "desc" },
    });

    const subscriptionId = latestInvoice?.subscriptionId;

    if (subscriptionId) {
      try {
        // Cancel at Mercado Pago
        const preApproval = getPreApprovalController();

        await preApproval.update({
          id: subscriptionId,
          body: {
            status: "cancelled",
          },
        });

        console.log(
          `[Cancel Plan] Mercado Pago subscription ${subscriptionId} cancelled.`,
        );
      } catch (mpError) {
        console.error(
          "[Cancel Plan] Error cancelling at Mercado Pago (proceeding to local cancel):",
          mpError,
        );
        // We proceed to cancel locally so the user isn't stuck
      }
    } else {
      console.warn(
        "[Cancel Plan] No subscriptionId found for user. Cancelling locally only.",
      );
    }

    // Send Cancellation Email
    const endDate = user.currentPeriodEnd
      ? new Date(user.currentPeriodEnd).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
          "es-ES",
        );

    try {
      await sendEmail({
        to: session.user.email!,
        subject: "Confirmación de cancelación - GymRat+",
        html: await renderCancellationEmail({
          userName: session.user.name || "Usuario",
          planName: latestInvoice?.planName || "Suscripción",
          endDate: endDate,
        }),
      });
    } catch (emailError) {
      console.error("Error sending cancellation email:", emailError);
    }

    // Update User in DB
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        subscriptionStatus: "canceled",
        cancelAtPeriodEnd: true,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Suscripción cancelada. Tendrás acceso hasta el final del periodo.",
    });
  } catch (error) {
    console.error("[Cancel Plan] Error:", error);
    return NextResponse.json(
      { error: "Error al cancelar la suscripción" },
      { status: 500 },
    );
  }
}
