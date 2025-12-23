"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils/utils";

interface Invoice {
  id: string;
  invoiceNumber: string;
  planName: string;
  planType: string;
  amount: number;
  currency: string;
  status: string;
  billingDate: string;
  paidAt: string | null;
}

export function BillingHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch("/api/invoices");
        const data = await response.json();

        if (data.success) {
          setInvoices(data.invoices);
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <>
      {invoices.length === 0 ? (
        <div className="text-center py-12 border rounded-lg border-dashed">
          <p className="text-muted-foreground text-sm">
            Aún no tienes facturas generadas.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Tus facturas aparecerán aquí después de tu primer pago.
          </p>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[140px]">Factura</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(invoice.billingDate).toLocaleDateString("es-ES", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "capitalize font-normal",
                        invoice.status === "paid" &&
                          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30",
                        invoice.status === "pending" &&
                          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30",
                        invoice.status === "failed" &&
                          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30",
                      )}
                    >
                      {invoice.status === "paid"
                        ? "Pagado"
                        : invoice.status === "pending"
                          ? "Pendiente"
                          : "Fallido"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: invoice.currency,
                    }).format(invoice.amount)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {invoice.planName}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-black dark:hover:text-white"
                      title="Enviar Factura al Correo"
                      onClick={async () => {
                        toast.promise(
                          fetch(`/api/invoices/${invoice.id}/send`, {
                            method: "POST",
                          }).then(async (res) => {
                            if (!res.ok) throw new Error("Error al enviar");
                            return res.json();
                          }),
                          {
                            loading: "Enviando factura...",
                            success: "Factura enviada a tu correo",
                            error: "Error al enviar la factura",
                          },
                        );
                      }}
                    >
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">Enviar por correo</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
