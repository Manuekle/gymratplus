"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Search,
  MoreHorizontal,
  Calendar,
  Utensils,
  Users,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NutritionPlan {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentImage: string | null;
  planName: string;
  status: "active" | "completed" | "paused";
  startDate: Date;
  endDate?: Date;
  progress: number;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  adherenceRate: number;
  lastLogDate?: Date;
  totalLogs: number;
}

export default function NutritionPlansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<NutritionPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

    fetchNutritionPlans();
  }, [session, status, router]);

  useEffect(() => {
    let filtered = nutritionPlans;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (plan) =>
          plan.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.planName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((plan) => plan.status === statusFilter);
    }

    setFilteredPlans(filtered);
  }, [nutritionPlans, searchTerm, statusFilter]);

  const fetchNutritionPlans = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/instructors/nutrition-plans")
      if (!response.ok) {
        throw new Error("Error al cargar los planes de nutrición")
      }
      const data = await response.json()
      setNutritionPlans(data)
    } catch (error: unknown) {
      let errorMessage = "Hubo un error al cargar los planes de nutrición."
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }
      toast.error(errorMessage)
      console.error("Error fetching nutrition plans:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "paused":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activo";
      case "completed":
        return "Completado";
      case "paused":
        return "Pausado";
      default:
        return "Desconocido";
    }
  };

  const getAdherenceColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
        <Button asChild>
          <Link href="/dashboard/students/nutrition-plans/create">
            <Plus className="h-4 w-4 mr-2" />
            Crear Plan
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Planes</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sont-semibold">
              {nutritionPlans.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {nutritionPlans.filter((p) => p.status === "active").length}{" "}
              activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Adherencia Promedio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sont-semibold">
              {nutritionPlans.length > 0
                ? Math.round(
                    nutritionPlans.reduce(
                      (acc, p) => acc + p.adherenceRate,
                      0
                    ) / nutritionPlans.length
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">cumplimiento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logs Totales</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sont-semibold">
              {nutritionPlans.reduce((acc, p) => acc + p.totalLogs, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              registros esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alumnos Activos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sont-semibold">
              {nutritionPlans.filter((p) => p.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">siguiendo dietas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por alumno o plan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="completed">Completados</SelectItem>
                  <SelectItem value="paused">Pausados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans List */}
      <div className="space-y-4">
        {filteredPlans.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Utensils className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No hay planes de nutrición
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Intenta ajustar los filtros de búsqueda."
                  : "Crea planes nutricionales personalizados para tus alumnos."}
              </p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/students/nutrition-plans/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Plan
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredPlans.map((plan) => (
            <Card key={plan.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={plan.studentImage || "/placeholder-avatar.jpg"}
                        alt={plan.studentName}
                      />
                      <AvatarFallback>
                        {plan.studentName?.charAt(0).toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{plan.studentName}</p>
                        <Badge
                          variant="outline"
                          className={getStatusColor(plan.status)}
                        >
                          {getStatusText(plan.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {plan.studentEmail}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {plan.planName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Macros */}
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium">
                        {plan.dailyCalories} kcal
                      </p>
                      <p className="text-xs text-muted-foreground">
                        P: {plan.dailyProtein}g | C: {plan.dailyCarbs}g | G:{" "}
                        {plan.dailyFat}g
                      </p>
                    </div>

                    {/* Adherence */}
                    <div className="text-right space-y-1">
                      <p
                        className={`text-sm font-medium ${getAdherenceColor(
                          plan.adherenceRate
                        )}`}
                      >
                        {plan.adherenceRate}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Adherencia
                      </p>
                    </div>

                    {/* Progress */}
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${plan.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {plan.progress}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {plan.totalLogs} logs registrados
                      </p>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Ver analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="h-4 w-4 mr-2" />
                          Ver logs
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Utensils className="h-4 w-4 mr-2" />
                          Editar plan
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Marcar como completado
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <XCircle className="h-4 w-4 mr-2" />
                          Pausar plan
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
