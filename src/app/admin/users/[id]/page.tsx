import { getUserById } from "@/app/admin/actions";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">Usuario no encontrado</h2>
        <p className="text-muted-foreground">
          No se pudo encontrar un usuario con el ID proporcionado.
        </p>
        <Link href="/admin/users">
          <Button>Volver a la lista</Button>
        </Link>
      </div>
    );
  }

  const stats = user.stats || { workoutCount: 0, invoiceCount: 0 };
  const invoices = user.invoices || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{user.name}</h2>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles de Perfil</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.image || ""} alt={user.name || "Usuario"} />
              <AvatarFallback className="text-lg">
                {user.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Rol:</span>
                {user.isInstructor ? (
                  <Badge variant="secondary">Instructor</Badge>
                ) : (
                  <Badge variant="outline">Usuario</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Plan:</span>
                <Badge
                  variant={
                    user.subscriptionTier === "PRO" ? "default" : "secondary"
                  }
                >
                  {user.subscriptionTier || "FREE"}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Registrado: {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de Actividad</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-accent/10">
              <span className="text-3xl font-bold">{stats.workoutCount}</span>
              <span className="text-xs text-muted-foreground">
                Entrenamientos Completados
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-accent/10">
              <span className="text-3xl font-bold">{stats.invoiceCount}</span>
              <span className="text-xs text-muted-foreground">
                Facturas Pagadas
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices History */}
      <Card>
        <CardHeader>
          <CardTitle>Facturas Recientes</CardTitle>
          <CardDescription>Historial de los últimos 10 pagos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead># Factura</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center h-24 text-muted-foreground"
                  >
                    No se encontraron facturas.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono">
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(inv.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={inv.status === "paid" ? "default" : "outline"}
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {new Date(inv.billingDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
