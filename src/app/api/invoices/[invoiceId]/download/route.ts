import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "@auth";
import {
    InvoiceEmail,
} from "@/lib/email/templates/invoice-email";
import { render } from "@react-email/render";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ invoiceId: string }> },
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { invoiceId } = await params;

        const invoice = await prisma.invoice.findUnique({
            where: {
                id: invoiceId,
                userId: session.user.id, // Security: Ensure invoice belongs to user
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

        if (!invoice) {
            // Try searching by invoiceNumber if UUID fails (fallback)
            const invoiceByNumber = await prisma.invoice.findUnique({
                where: {
                    invoiceNumber: invoiceId,
                    userId: session.user.id,
                },
                include: {
                    user: { select: { name: true, email: true } },
                },
            });

            if (!invoiceByNumber) {
                return NextResponse.json(
                    { error: "Factura no encontrada" },
                    { status: 404 },
                );
            }
            // If found by number, use it
            return generateInvoiceResponse(invoiceByNumber);
        }

        return generateInvoiceResponse(invoice);
    } catch (error) {
        console.error("Error downloading invoice:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

async function generateInvoiceResponse(invoice: any) {
    // Generate HTML using the email template
    const html = await render(
        InvoiceEmail({
            userName: invoice.user.name || "Usuario",
            userEmail: invoice.user.email || "",
            invoiceNumber: invoice.invoiceNumber,
            invoiceDate: new Date(invoice.billingDate).toLocaleDateString("es-ES"),
            planName: invoice.planName,
            planType: invoice.planType,
            amount: invoice.amount,
            currency: invoice.currency,
            nextBillingDate: "Consulte su perfil", // Static for historical record
            subscriptionId: invoice.subscriptionId || "N/A",
        }),
    );

    // Return as HTML file download
    return new NextResponse(html, {
        headers: {
            "Content-Type": "text/html",
            "Content-Disposition": `attachment; filename="Factura-${invoice.invoiceNumber}.html"`,
        },
    });
}
