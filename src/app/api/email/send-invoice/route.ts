import { NextResponse } from "next/server";
import { COMPANY_INFO } from "@/lib/email/client";
import { renderInvoiceEmail } from "@/lib/email/templates/invoice-email";
import { sendEmail } from "@/lib/email/resend";
import { auth } from "@auth";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      invoiceNumber,
      planName,
      planType,
      amount,
      subscriptionId,
      trialEndsAt,
      nextBillingDate,
    } = body;

    console.log("[Send Invoice Email] Sending invoice:", {
      to: session.user.email,
      invoiceNumber,
      planName,
    });

    // Generar HTML del email
    const emailHtml = await renderInvoiceEmail({
      userName: session.user.name || "Usuario",
      userEmail: session.user.email || "",
      invoiceNumber,
      invoiceDate: new Date().toLocaleDateString("es-ES"),
      planName,
      planType,
      amount,
      currency: "USD",
      trialEndsAt,
      nextBillingDate,
      subscriptionId,
    });

    // Send email using helper
    const emailResult = await sendEmail({
      to: session.user.email || "",
      subject: `Confirmación de suscripción a ${planName} - ${COMPANY_INFO.name}`,
      html: emailHtml,
      from: `${COMPANY_INFO.name} <${COMPANY_INFO.email}>`,
    });

    if (!emailResult.success) {
      console.error("[Send Invoice Email] Error:", emailResult.error);
      return NextResponse.json(
        { error: "Error al enviar el email", details: emailResult.error },
        { status: 500 },
      );
    }

    console.log(
      "[Send Invoice Email] Email sent successfully:",
      emailResult.data,
    );

    return NextResponse.json({
      success: true,
      message: "Email enviado exitosamente",
      emailId: emailResult.data?.id,
    });
  } catch (error) {
    console.error("[Send Invoice Email] Error:", error);

    return NextResponse.json(
      {
        error: "Error al enviar el email",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    );
  }
}
