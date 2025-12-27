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
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Panel de Administración
        </h2>
        <p className="mt-2 text-muted-foreground">
          Gestiona usuarios, contenido y analiza el rendimiento de GymRat+.
        </p>
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
