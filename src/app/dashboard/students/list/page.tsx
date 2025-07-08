"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  ArrowLeft,
  Users,
  Search,
  MoreHorizontal,
  Target,
  Activity,
  Eye,
  TrendingUp,
  Filter,
  Flame,
  Clock,
  DollarSign,
} from "lucide-react"
import Link from "next/link"
import { format, isToday, isYesterday, isThisWeek } from "date-fns"
import { es } from "date-fns/locale"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WorkoutAssignmentDialog } from "@/components/instructor/workout-assignment-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StudentData {
  id: string
  studentId: string
  name: string | null
  email: string | null
  image: string | null
  agreedPrice: number | null
  status: string
  lastWorkoutAt: Date | null
  currentWorkoutStreak: number
  completedWorkoutsLast7Days: number
  totalWorkouts: number
  averageWorkoutsPerWeek: number
  lastNutritionLog?: Date | null
  hasActiveMealPlan: boolean
  hasActiveWorkoutPlan: boolean
}

export default function StudentsListPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [students, setStudents] = useState<StudentData[]>([])
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [activityFilter, setActivityFilter] = useState<string>("all")
  const [selectedStudent, setSelectedStudent] = useState<{id: string, studentId: string, name: string} | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [stats, setStats] = useState<{
    totalStudents: number
    activeToday: number
    activeThisWeek: number
    avgStreak: number
    totalRevenue: number
  } | null>(null)

  const fetchStudents = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/instructors/students")
      if (!response.ok) {
        throw new Error("Error al cargar estudiantes")
      }
      const data = await response.json()
      setStudents(data)
    } catch (error: unknown) {
      let errorMessage = "Hubo un error al cargar los estudiantes."
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }
      toast.error(errorMessage)
      console.error("Error fetching students:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/instructors/students/stats")
      if (!response.ok) {
        throw new Error("Error al cargar estadísticas")
      }
      const data = await response.json()
      setStats(data)
    } catch (error: unknown) {
      console.error("Error fetching stats:", error)
    }
  }

  useEffect(() => {
    if (status === "loading") return
    if (!session || !session.user) {
      router.push("/auth/signin")
      return
    }
    if (!session.user.isInstructor) {
      toast.error("Acceso denegado", {
        description: "Debes ser un instructor para acceder a esta página.",
      })
      router.push("/dashboard/profile")
      return
    }

    fetchStudents()
    fetchStats()
  }, [session, status, router])

  useEffect(() => {
    let filtered = students

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((student) => student.status === statusFilter)
    }

    // Filtrar por actividad
    if (activityFilter !== "all") {
      switch (activityFilter) {
        case "active_today":
          filtered = filtered.filter((student) => student.lastWorkoutAt && isToday(new Date(student.lastWorkoutAt)))
          break
        case "active_week":
          filtered = filtered.filter((student) => student.lastWorkoutAt && isThisWeek(new Date(student.lastWorkoutAt)))
          break
        case "inactive":
          filtered = filtered.filter(
            (student) => !student.lastWorkoutAt || !isThisWeek(new Date(student.lastWorkoutAt)),
          )
          break
        case "high_streak":
          filtered = filtered.filter((student) => student.currentWorkoutStreak >= 7)
          break
      }
    }

    setFilteredStudents(filtered)
  }, [students, searchTerm, statusFilter, activityFilter])

  const getActivityStatus = (lastWorkoutAt: Date | null) => {
    if (!lastWorkoutAt) return { status: "inactive", text: "Inactivo", variant: "secondary" as const }
    if (isToday(new Date(lastWorkoutAt))) return { status: "active", text: "Activo hoy", variant: "default" as const }
    if (isYesterday(new Date(lastWorkoutAt))) return { status: "recent", text: "Ayer", variant: "outline" as const }
    if (isThisWeek(new Date(lastWorkoutAt))) return { status: "week", text: "Esta semana", variant: "outline" as const }
    return { status: "old", text: "Inactivo", variant: "destructive" as const }
  }

  const getStreakVariant = (streak: number) => {
    if (streak >= 7) return "default"
    if (streak >= 3) return "secondary"
    return "outline"
  }

  // Calcular estadísticas
  const totalStudents = students.length
  const activeToday = students.filter((s) => s.lastWorkoutAt && isToday(new Date(s.lastWorkoutAt))).length
  const activeThisWeek = students.filter((s) => s.lastWorkoutAt && isThisWeek(new Date(s.lastWorkoutAt))).length
  const avgStreak =
    totalStudents > 0 ? Math.round(students.reduce((acc, s) => acc + s.currentWorkoutStreak, 0) / totalStudents) : 0
  const totalRevenue = students.reduce((acc, s) => acc + (s.agreedPrice || 0), 0)

  if (isLoading) {
    return (
      <div>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-20" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters Skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Skeleton className="h-10 flex-1 max-w-sm" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-40" />
              </div>
            </CardContent>
          </Card>

          {/* Students List Skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/students">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alumnos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sont-semibold">{stats?.totalStudents || totalStudents}</div>
              <p className="text-xs text-muted-foreground">alumnos activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos Hoy</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sont-semibold">{stats?.activeToday || activeToday}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalStudents ? Math.round((stats.activeToday / stats.totalStudents) * 100) : totalStudents > 0 ? Math.round((activeToday / totalStudents) * 100) : 0}% del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Racha Promedio</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sont-semibold">{stats?.avgStreak || avgStreak}</div>
              <p className="text-xs text-muted-foreground">días consecutivos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sont-semibold">${stats?.totalRevenue || totalRevenue}</div>
              <p className="text-xs text-muted-foreground">total estimado</p>
            </CardContent>
        </Card>
      </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg tracking-heading font-semibold">Filtros</CardTitle>
            </div>
            <CardDescription className="text-xs">Filtra y busca entre tus alumnos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
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
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Actividad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toda actividad</SelectItem>
                  <SelectItem value="active_today">Activos hoy</SelectItem>
                  <SelectItem value="active_week">Activos esta semana</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                  <SelectItem value="high_streak">Racha alta (7+ días)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <div className="space-y-4">
          {filteredStudents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                
                <h3 className="text-xs font-medium mb-2">No se encontraron alumnos</h3>
                <p className="text-muted-foreground text-xs max-w-md">
                  {searchTerm || statusFilter !== "all" || activityFilter !== "all"
                    ? "Intenta ajustar los filtros de búsqueda para encontrar a tus alumnos."
                    : "No tienes alumnos activos en este momento. Cuando aceptes solicitudes, aparecerán aquí."}
                </p>
                {(searchTerm || statusFilter !== "all" || activityFilter !== "all") && (
                  <Button
                    variant="outline"
                    className="mt-4 bg-transparent"
                    onClick={() => {
                      setSearchTerm("")
                      setStatusFilter("all")
                      setActivityFilter("all")
                    }}
                  >
                    Limpiar filtros
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredStudents.map((student) => {
              const activityStatus = getActivityStatus(student.lastWorkoutAt)
              const streakVariant = getStreakVariant(student.currentWorkoutStreak)

              return (
                <Card key={student.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                          <AvatarImage
                            src={student.image || "/placeholder-avatar.jpg"}
                            alt={student.name || "Alumno"}
                          />
                          <AvatarFallback className="font-semibold">
                            {student.name?.charAt(0).toUpperCase() || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{student.name || "Sin nombre"}</p>
                            <Badge variant={activityStatus.variant}>{activityStatus.text}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                          {student.agreedPrice && (
                            <p className="text-xs text-muted-foreground font-medium">${student.agreedPrice}/mes</p>
                          )}
                          <div className="flex gap-2 mt-1">
                            {student.hasActiveWorkoutPlan && (
                              <Badge variant="secondary" className="text-xs justify-center">
                                <Target className="h-3 w-3 mr-1" />
                                Entrenamiento
                              </Badge>
                            )}
                            {student.hasActiveMealPlan && (
                              <Badge variant="secondary" className="text-xs justify-center">
                                <Activity className="h-3 w-3 mr-1" />
                                Nutrición
                              </Badge>
                            )}
                            {!student.hasActiveWorkoutPlan && !student.hasActiveMealPlan && (
                              <span className="text-xs text-muted-foreground">Sin planes</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        {/* Stats */}
                        <div className="text-right space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={streakVariant} className="gap-1">
                              <Flame className="h-3 w-3" />
                              {student.currentWorkoutStreak}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {student.completedWorkoutsLast7Days}/sem
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {student.lastWorkoutAt ? (
                              isToday(new Date(student.lastWorkoutAt)) ? (
                                <span className="text-green-600 font-medium flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Entrenó hoy
                                </span>
                              ) : (
                                `Último: ${format(new Date(student.lastWorkoutAt), "d MMM", { locale: es })}`
                              )
                            ) : (
                              "Sin entrenamientos"
                            )}
                          </p>
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menú</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedStudent({ id: student.id, studentId: student.studentId, name: student.name || 'Estudiante' });
                                setIsDialogOpen(true);
                              }}
                              className="cursor-pointer"
                            >
                              <Target className="h-4 w-4 mr-2" />
                              Asignar Rutina
                            </DropdownMenuItem>
                            {/* Elimino el render del modal aquí */}
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/students/list/${student.id}`} className="w-full flex items-center">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver perfil completo
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                // TODO: Implementar lógica para remover alumno
                                toast.info("Funcionalidad en desarrollo")
                              }}
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Remover alumno
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Summary */}
        {filteredStudents.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Mostrando {filteredStudents.length} de {totalStudents} alumnos
                </span>
                <div className="flex items-center gap-4">
                  <span>Activos esta semana: {activeThisWeek}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>Racha promedio: {avgStreak} días</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Diálogo para asignar rutina */}
        {selectedStudent && (
          <WorkoutAssignmentDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            studentId={selectedStudent.studentId}
            studentName={selectedStudent.name}
          />
        )}
    </div>
  );
}
