import { getAdminStats } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  DumbbellIcon,
  UserGroupIcon,
  Activity01Icon,
  Money03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { OverviewCharts } from "./_components/overview-charts";

export default async function AdminDashboardPage() {
  const {
    usersCount,
    exercisesCount,
    activeSessionsCount,
    totalRevenue,
    analyticsData,
  } = await getAdminStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Panel de Administración</h2>
        <p className="text-muted-foreground">
          Gestiona el contenido de tu aplicación y usuarios.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Ingresos Totales</CardTitle>
            <HugeiconsIcon
              icon={Money03Icon}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Ganancias totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Usuarios Totales</CardTitle>
            <HugeiconsIcon
              icon={UserGroupIcon}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersCount}</div>
            <p className="text-xs text-muted-foreground">Cuentas registradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Ejercicios</CardTitle>
            <HugeiconsIcon
              icon={DumbbellIcon}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exercisesCount}</div>
            <p className="text-xs text-muted-foreground">Videos en biblioteca</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">
              Sesiones Activas
            </CardTitle>
            <HugeiconsIcon
              icon={Activity01Icon}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessionsCount}</div>
            <p className="text-xs text-muted-foreground">
              Entrenamientos en curso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <OverviewCharts data={analyticsData} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/exercises">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">
                Ejercicios (Videos)
              </CardTitle>
              <HugeiconsIcon
                icon={DumbbellIcon}
                className="h-4 w-4 text-muted-foreground"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gestionar</div>
              <p className="text-xs text-muted-foreground">
                Añadir, editar o eliminar ejercicios y videos
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Usuarios</CardTitle>
              <HugeiconsIcon
                icon={UserGroupIcon}
                className="h-4 w-4 text-muted-foreground"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ver</div>
              <p className="text-xs text-muted-foreground">
                Ver usuarios registrados y detalles
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/foods">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Alimentos</CardTitle>
              <HugeiconsIcon
                icon={DumbbellIcon}
                className="h-4 w-4 text-muted-foreground"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Nutrición</div>
              <p className="text-xs text-muted-foreground">
                Gestionar base de datos de alimentos y macros
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/emails">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Correos</CardTitle>
              <HugeiconsIcon
                icon={Activity01Icon}
                className="h-4 w-4 text-muted-foreground"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Redactar</div>
              <p className="text-xs text-muted-foreground">
                Enviar notificaciones a usuarios
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/invoices">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Facturas</CardTitle>
              <HugeiconsIcon
                icon={Money03Icon}
                className="h-4 w-4 text-muted-foreground"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ingresos</div>
              <p className="text-xs text-muted-foreground">
                Rastrear pagos y suscripciones
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/workouts">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Rutinas</CardTitle>
              <HugeiconsIcon
                icon={DumbbellIcon}
                className="h-4 w-4 text-muted-foreground"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Plantillas</div>
              <p className="text-xs text-muted-foreground">
                Gestionar rutinas del sistema
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/instructors">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Instructors</CardTitle>
              <HugeiconsIcon
                icon={UserGroupIcon}
                className="h-4 w-4 text-muted-foreground"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Verificar</div>
              <p className="text-xs text-muted-foreground">
                Aprobar solicitudes de instructores
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
