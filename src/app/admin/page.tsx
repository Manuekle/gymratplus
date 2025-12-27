import { getAdminStats } from "./actions";
import { OverviewCharts } from "./_components/overview-charts";
import { StatCard } from "./_components/stat-card";
import {
  DumbbellIcon,
  UserGroupIcon,
  Activity01Icon,
  Money03Icon,
} from "@hugeicons/core-free-icons";

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
    <div className="space-y-8">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 backdrop-blur-xl border border-border/50">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="relative">
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Panel de Administración
          </h2>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Gestiona usuarios, contenido y analiza el rendimiento de GymRat+ desde un solo lugar.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Ingresos Totales"
          value={formatCurrency(totalRevenue || 0)}
          icon={Money03Icon}
          trend="+20.1%"
          trendDirection="up"
          description="desde el mes pasado"
        />
        <StatCard
          title="Usuarios Totales"
          value={usersCount}
          icon={UserGroupIcon}
          trend="+180"
          trendDirection="up"
          description="nuevos usuarios"
        />
        <StatCard
          title="Ejercicios en Biblioteca"
          value={exercisesCount}
          icon={DumbbellIcon}
          description="videos de alta calidad"
        />
        <StatCard
          title="Sesiones Activas"
          value={activeSessionsCount}
          icon={Activity01Icon}
          description="entrenando ahora mismo"
          trendDirection="neutral"
        />
      </div>

      {/* Analytics Charts */}
      <OverviewCharts data={analyticsData} />
    </div>
  );
}
