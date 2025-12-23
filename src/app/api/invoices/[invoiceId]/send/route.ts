import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "@auth";
import {
    renderInvoiceEmail,
    InvoiceEmail,
} from "@/lib/email/templates/invoice-email";
import { render } from "@react-email/render";
import { sendEmail } from "@/lib/email/resend";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ invoiceId: string }> },
) {
    try {
        const session = await auth();

        if (!session?.user?.id || !session.user.email) {
            return NextResponse.json({ error: "No autorizado o email no disponible" }, { status: 401 });
        }

        const { invoiceId } = await params;

        const invoice = await prisma.invoice.findUnique({
            where: {
                id: invoiceId,
                userId: session.user.id,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Fallback search logic remains the same...
        let targetInvoice = invoice;
        if (!targetInvoice) {
            const invoiceByNumber = await prisma.invoice.findUnique({
                where: {
                    invoiceNumber: invoiceId,
                    userId: session.user.id,
                },
                include: {
                    user: { select: { name: true, email: true } },
                },
            });
            if (invoiceByNumber) targetInvoice = invoiceByNumber;
        }

        if (!targetInvoice) {
            return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
        }

        // Calculate Next Billing Date (Invoice Date + 1 Month)
        const invoiceDate = new Date(targetInvoice.billingDate);
        const nextBillingDate = new Date(invoiceDate);
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

        const html = await render(
            InvoiceEmail({
                userName: targetInvoice.user.name || "Usuario",
                userEmail: targetInvoice.user.email || "",
                invoiceNumber: targetInvoice.invoiceNumber,
                invoiceDate: invoiceDate.toLocaleDateString("es-ES"),
                planName: targetInvoice.planName,
                planType: targetInvoice.planType,
                amount: targetInvoice.amount,
                currency: targetInvoice.currency,
                nextBillingDate: nextBillingDate.toLocaleDateString("es-ES"),
                subscriptionId: targetInvoice.subscriptionId || "N/A",
            }),
        );

        const { success, error } = await sendEmail({
            to: session.user.email,
            subject: `Factura ${targetInvoice.invoiceNumber} - GymRat+`,
            html: html,
        });

        if (!success) {
            throw new Error(error || "Error al enviar el email");
        }

        return NextResponse.json({ success: true, message: "Factura enviada al correo" });

    } catch (error) {
        console.error("Error sending invoice:", error);
        return NextResponse.json({ error: "Error interno al enviar la factura" }, { status: 500 });
    }
}


