"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { ArrowRight, Users, Utensils, Dumbbell, CheckCircle, XCircle, TrendingUp } from "lucide-react"
import Link from "next/link"
import { format, isToday } from "date-fns"
import { es } from "date-fns/locale"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { InstructorProfileForm } from "@/components/instructor/instructor-profile-form"

interface StudentData {
  id: string
  name: string | null
  email: string | null
  image: string | null
  agreedPrice: number | null
  status: string
  lastWorkoutAt: Date | null
  currentWorkoutStreak: number
  completedWorkoutsLast7Days: number
}

interface PendingRequestData {
  id: string
  name: string | null
  email: string | null
  image: string | null
  agreedPrice: number | null
  status: string
  lastWorkoutAt?: Date | null
  currentWorkoutStreak?: number
  completedWorkoutsLast7Days?: number
}

export default function InstructorDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isInstructor, setIsInstructor] = useState(false)
  const [students, setStudents] = useState<StudentData[]>([])
  const [pendingRequests, setPendingRequests] = useState<PendingRequestData[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (!session || !session.user) {
      router.push("/auth/signin")
      return
    }

    const checkInstructorStatus = async () => {
      setIsLoadingProfile(true)
      try {
        if (session.user.isInstructor) {
          setIsInstructor(true)
          fetchStudentsAndRequests()
        } else {
          toast.error("Acceso denegado", {
            description: "Debes ser un instructor para acceder a esta página.",
          })
          router.push("/dashboard/profile")
        }
      } catch (error) {
        console.error("Error checking instructor status:", error)
        toast.error("Error", {
          description: "No se pudo verificar tu rol de instructor.",
        })
        router.push("/dashboard")
      } finally {
        setIsLoadingProfile(false)
      }
    }

    checkInstructorStatus()
  }, [session, status, router])

  const fetchStudentsAndRequests = async () => {
    setIsLoadingStudents(true)
    try {
      const response = await fetch("/api/instructors/students")
      if (!response.ok) {
        throw new Error("Error al cargar los alumnos.")
      }
      const data: (StudentData | PendingRequestData)[] = await response.json()

      const activeStudents = data.filter((item): item is StudentData => item.status === "active")
      const pRequests = data.filter((item): item is PendingRequestData => item.status === "pending")

      setStudents(activeStudents)
      setPendingRequests(pRequests)
    } catch (error: unknown) {
      let errorMessage = "Hubo un error al cargar tus alumnos."
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }
      toast.error(errorMessage)
      console.error("Error fetching students:", error)
    } finally {
      setIsLoadingStudents(false)
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/student-instructor-requests/${requestId}/accept`, {
        method: "PUT",
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al aceptar la solicitud.")
      }
      toast.success("Solicitud aceptada", {
        description: "El alumno ha sido añadido a tu lista.",
      })
      fetchStudentsAndRequests()
    } catch (error: unknown) {
      let errorMessage = "Hubo un error al aceptar la solicitud."
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }
      toast.error(errorMessage)
      console.error("Error accepting request:", error)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/student-instructor-requests/${requestId}/reject`, {
        method: "PUT",
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al rechazar la solicitud.")
      }
      toast.success("Solicitud rechazada", {
        description: "La solicitud ha sido marcada como rechazada.",
      })
      fetchStudentsAndRequests()
    } catch (error: unknown) {
      let errorMessage = "Hubo un error al rechazar la solicitud."
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }
      toast.error(errorMessage)
      console.error("Error rejecting request:", error)
    }
  }

  if (isLoadingProfile || status === "loading") {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isInstructor) {
    return null
  }

  const totalStudents = students.length
  const activeToday = students.filter((s) => s.lastWorkoutAt && isToday(new Date(s.lastWorkoutAt))).length
  const avgStreak =
    totalStudents > 0 ? Math.round(students.reduce((acc, s) => acc + s.currentWorkoutStreak, 0) / totalStudents) : 0

  return (
      <div className="space-y-8">       
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alumnos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">{pendingRequests.length} solicitudes pendientes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos Hoy</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeToday}</div>
              <p className="text-xs text-muted-foreground">
                {totalStudents > 0 ? Math.round((activeToday / totalStudents) * 100) : 0}% del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Racha Promedio</CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgStreak}</div>
              <p className="text-xs text-muted-foreground">días consecutivos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solicitudes</CardTitle>
              <Badge variant={pendingRequests.length > 0 ? "default" : "secondary"}>{pendingRequests.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground">pendientes de revisión</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    Solicitudes Pendientes
                    <Badge variant="secondary">{pendingRequests.length}</Badge>
                  </CardTitle>
                  <CardDescription>Revisa y gestiona las solicitudes de nuevos alumnos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRequests.map((request, index) => (
                  <div key={request.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={request.image || "/placeholder-avatar.jpg"}
                            alt={request.name || "Alumno"}
                          />
                          <AvatarFallback>{request.name?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{request.name || "Sin nombre"}</p>
                          <p className="text-sm text-muted-foreground">{request.email}</p>
                          {request.agreedPrice && (
                            <p className="text-xs text-muted-foreground">Precio sugerido: ${request.agreedPrice}/mes</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" onClick={() => handleAcceptRequest(request.id)} className="h-8">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aceptar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectRequest(request.id)}
                          className="h-8"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    </div>
                    {index < pendingRequests.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Students */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Alumnos Activos</CardTitle>
                <CardDescription>Supervisa el progreso de tus alumnos</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/students/list">
                  Ver todos
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingStudents ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-medium mb-2">No tienes alumnos activos</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Cuando aceptes solicitudes de alumnos, aparecerán aquí para que puedas supervisar su progreso.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {students.slice(0, 5).map((student, index) => (
                  <div key={student.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={student.image || "/placeholder-avatar.jpg"}
                            alt={student.name || "Alumno"}
                          />
                          <AvatarFallback>{student.name?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{student.name || "Sin nombre"}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                          {student.agreedPrice && (
                            <p className="text-xs text-muted-foreground">${student.agreedPrice}/mes</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {student.currentWorkoutStreak} días
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {student.completedWorkoutsLast7Days} entrenos/sem
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {student.lastWorkoutAt ? (
                            isToday(new Date(student.lastWorkoutAt)) ? (
                              <span className="text-green-600 font-medium">Entrenó hoy</span>
                            ) : (
                              `Último: ${format(new Date(student.lastWorkoutAt), "d MMM", { locale: es })}`
                            )
                          ) : (
                            "Sin entrenamientos"
                          )}
                        </p>
                      </div>
                    </div>
                    {index < Math.min(students.length, 5) - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
                {students.length > 5 && (
                  <div className="pt-4 border-t">
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link href="/dashboard/instructors/students">
                        Ver todos los alumnos ({students.length})
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                Planes de Entrenamiento
              </CardTitle>
              <CardDescription>Crea y gestiona rutinas personalizadas para tus alumnos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Funcionalidad en desarrollo</p>
                <Button variant="outline" size="sm" disabled>
                  Próximamente
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Planes de Nutrición
              </CardTitle>
              <CardDescription>Diseña dietas y planes nutricionales personalizados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Funcionalidad en desarrollo</p>
                <Button variant="outline" size="sm" disabled>
                  Próximamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructor Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Mi Perfil de Instructor</CardTitle>
            <CardDescription>Actualiza tu información profesional y currículum</CardDescription>
          </CardHeader>
          <CardContent>
            <InstructorProfileForm />
          </CardContent>
        </Card>
      </div>  
  )
}
