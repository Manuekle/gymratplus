"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Activity,
  Utensils,
  Zap,
  Award,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface NutritionAnalytics {
  totalStudents: number;
  activePlans: number;
  averageAdherence: number;
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  topPerformers: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    adherenceRate: number;
    caloriesConsumed: number;
    targetCalories: number;
    progress: number;
  }[];
  recentActivity: {
    id: string;
    studentName: string;
    studentEmail: string;
    studentImage: string | null;
    action: string;
    date: Date;
    calories: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
    };
  }[];
  weeklyTrends: {
    date: string;
    averageCalories: number;
    averageAdherence: number;
    activeStudents: number;
    targetCalories: number;
  }[];
  macroDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
  adherenceByStudent: {
    name: string;
    adherence: number;
    target: number;
  }[];
}

const COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  accent: "hsl(var(--accent))",
  muted: "hsl(var(--muted))",
  protein: "#ef4444",
  carbs: "#3b82f6",
  fat: "#f59e0b",
  adherence: "#10b981",
  calories: "#8b5cf6",
};

export default function NutritionAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<NutritionAnalytics | null>(null);
  const [timeRange, setTimeRange] = useState<string>("7d");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user) {
      router.push("/auth/signin");
      return;
    }
    if (!session.user.isInstructor) {
      toast.error("Acceso denegado", {
        description: "Debes ser un instructor para acceder a esta página.",
      });
      router.push("/dashboard/profile");
      return;
    }
    fetchAnalytics();
  }, [session, status, router, timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/instructors/nutrition-analytics?timeRange=${timeRange}`)
      if (!response.ok) {
        throw new Error("Error al cargar los analytics de nutrición")
      }
      const data = await response.json()
      setAnalytics(data)
    } catch (error: unknown) {
      let errorMessage = "Hubo un error al cargar los analytics de nutrición."
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }
      toast.error(errorMessage)
      console.error("Error fetching nutrition analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name.includes("Calorías")
                ? " kcal"
                : entry.name.includes("Adherencia")
                ? "%"
                : ""}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-20" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Validar que analytics existe y tiene datos válidos
  if (!analytics || !analytics.adherenceByStudent || analytics.adherenceByStudent.length === 0) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/students">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Analytics de Nutrición</h1>
              <p className="text-muted-foreground">
                Análisis del progreso nutricional de tus alumnos
              </p>
            </div>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              No hay datos disponibles
            </h3>
            <p className="text-muted-foreground">
              Los analytics aparecerán cuando tengas alumnos con planes nutricionales activos.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtrar datos válidos para los gráficos
  const validAdherenceData = analytics.adherenceByStudent.filter(item => 
    !isNaN(item.adherence) && item.adherence >= 0 && item.adherence <= 100
  );

  const validWeeklyTrends = analytics.weeklyTrends.filter(item => 
    !isNaN(item.averageAdherence) && item.averageAdherence >= 0 && item.averageAdherence <= 100
  );

  const validMacroDistribution = analytics.macroDistribution.filter(item => 
    !isNaN(item.value) && item.value >= 0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/students">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 días</SelectItem>
            <SelectItem value="30d">30 días</SelectItem>
            <SelectItem value="90d">90 días</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alumnos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.activePlans} con planes activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Adherencia Promedio
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.averageAdherence}%
            </div>
            <Progress value={analytics.averageAdherence} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Calorías Promedio
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.averageCalories}
            </div>
            <p className="text-xs text-muted-foreground">kcal por día</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Macros Promedio
            </CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              P: {analytics.averageProtein}g
            </div>
            <p className="text-xs text-muted-foreground">
              C: {analytics.averageCarbs}g | G: {analytics.averageFat}g
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekly Trends Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendencias Semanales
            </CardTitle>
            <CardDescription>
              Evolución de calorías y adherencia por día
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={validWeeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  className="text-xs"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="averageCalories"
                  fill={COLORS.calories}
                  name="Calorías Promedio"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="averageAdherence"
                  stroke={COLORS.adherence}
                  strokeWidth={3}
                  name="Adherencia %"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="targetCalories"
                  stroke={COLORS.muted}
                  strokeDasharray="5 5"
                  name="Objetivo Calorías"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Macro Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Distribución de Macros
            </CardTitle>
            <CardDescription>
              Promedio de macronutrientes por día
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={validMacroDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {validMacroDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value}g`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Adherence by Student */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Adherencia por Alumno
            </CardTitle>
            <CardDescription>
              Comparación de adherencia individual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={validAdherenceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" domain={[0, 100]} className="text-xs" />
                <YAxis
                  dataKey="name"
                  type="category"
                  className="text-xs"
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="adherence"
                  fill={COLORS.adherence}
                  name="Adherencia %"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Mejores Rendimientos
          </CardTitle>
          <CardDescription>
            Alumnos con mayor adherencia a sus planes nutricionales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topPerformers.map((performer, index) => (
              <div
                key={performer.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={index < 3 ? "default" : "secondary"}
                      className="w-8 h-8 rounded-full p-0 flex items-center justify-center"
                    >
                      #{index + 1}
                    </Badge>
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={performer.image || "/placeholder-avatar.jpg"}
                        alt={performer.name}
                      />
                      <AvatarFallback>
                        {performer.name?.charAt(0).toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{performer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {performer.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm font-bold text-green-600">
                      {performer.adherenceRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">Adherencia</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {performer.caloriesConsumed}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      / {performer.targetCalories} kcal
                    </p>
                  </div>
                  <div className="w-24">
                    <Progress value={performer.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      {performer.progress}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>
            Últimos registros nutricionales de tus alumnos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentActivity.map((activity, index) => (
              <div key={activity.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={activity.studentImage || "/placeholder-avatar.jpg"}
                        alt={activity.studentName}
                      />
                      <AvatarFallback>
                        {activity.studentName?.charAt(0).toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="font-medium">{activity.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.action}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(activity.date, "d MMM 'a las' HH:mm", {
                          locale: es,
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-bold text-lg">
                      {activity.calories} kcal
                    </p>
                    <div className="flex gap-2 text-xs">
                      <span className="text-red-600">
                        P: {activity.macros.protein}g
                      </span>
                      <span className="text-blue-600">
                        C: {activity.macros.carbs}g
                      </span>
                      <span className="text-yellow-600">
                        G: {activity.macros.fat}g
                      </span>
                    </div>
                  </div>
                </div>
                {index < analytics.recentActivity.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
