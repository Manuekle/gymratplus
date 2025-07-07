"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, XCircle, Users, MessageCircle, TrendingUp, Calendar, DollarSign, Star, User, Mail, Phone, MapPin, Award, Clock } from "lucide-react"
import { useInstructor } from "@/hooks/use-instructor"
import { Separator } from "@/components/ui/separator"
import { Session } from "next-auth"

interface InstructorDashboardProps {
  session: Session | null // La sesión se utilizará más adelante para llamadas a la API
}

export function InstructorDashboard({ session }: InstructorDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const { data: instructorData, isLoading } = useInstructor()

  if (!session || !session.user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No tienes acceso</h3>
          <p className="mt-1 text-sm text-gray-500">Necesitas ser un instructor para ver esta sección</p>
        </div>
      </div>
    )
  }

  const instructorProfile = {
    name: session.user.name || "Nombre no disponible",
    specialty: instructorData?.specialty || "Especialidad no disponible",
    bio: instructorData?.bio || "Biografía no disponible",
    location: instructorData?.location || "Ubicación no disponible",
    rating: instructorData?.rating || 0,
    reviews: instructorData?.reviews || 0,
    students: instructorData?.students || 0,
    requests: instructorData?.requests || 0,
    earnings: `$${instructorData?.earnings || 0}`,
    imageUrl: session.user.image || "/images/default-avatar.png",
    contact: {
      email: session.user.email || "",
      phone: instructorData?.phone || ""
    }
  }
    name: "Manuel De Jesus",
    specialty: "Entrenador Personal y Nutricionista",
    bio: "Apasionado por transformar vidas a través del fitness y la nutrición. Mi enfoque es personalizado, ayudando a mis estudiantes a alcanzar sus metas de forma sostenible y saludable.",
    location: "Santo Domingo, República Dominicana",
    rating: 4.8,
    reviews: 24,
    students: 8,
    requests: 3,
    earnings: "$1,240",
    imageUrl: "/images/manuel-de-jesus.jpg", // Asegúrate de tener esta imagen en public/images
    contact: {
      email: "manuel.dejesus@example.com",
      phone: "+1 (809) 123-4567"
    }
  }

  const stats = [
    {
      title: "Estudiantes Activos",
      value: instructorProfile.students,
      description: "+2 este mes",
      icon: Users,
      trend: "+25%",
      color: "text-primary",
      iconColor: "text-primary"
    },
    },
    {
      title: "Solicitudes Pendientes",
      value: instructorProfile.requests,
      description: "Requieren atención",
      icon: MessageCircle,
      trend: "2 nuevas",
      color: "text-orange-600",
      iconColor: "text-orange-600"
    },
    },
    {
      title: "Ingresos del Mes",
      value: instructorProfile.earnings,
      description: "+12% vs mes anterior",
      icon: DollarSign,
      trend: "+$132",
      color: "text-green-600",
      iconColor: "text-green-600"
    },
    },
    {
      title: "Calificación",
      value: instructorProfile.rating,
      description: `${instructorProfile.reviews} reseñas`,
      icon: Star,
      trend: "+0.2",
      color: "text-yellow-600",
      iconColor: "text-yellow-600"
    }
    },
  ]

  const pendingRequests = [
    {
      id: 1,
      student: "María López",
      goal: "Pérdida de peso",
      experience: "Principiante",
      date: "Hace 2 horas",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      student: "Juan Pérez",
      goal: "Ganancia muscular",
      experience: "Intermedio",
      date: "Hace 1 día",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const activeStudents = [
    {
      id: 1,
      name: "Ana García",
      plan: "Premium",
      progress: 85,
      nextSession: "Mañana 10:00 AM",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Carlos Ruiz",
      plan: "Básico",
      progress: 60,
      nextSession: "Viernes 3:00 PM",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Sofía Fernández",
      plan: "Intermedio",
      progress: 75,
      nextSession: "Lunes 9:00 AM",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Estadísticas del instructor */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg bg-muted/50 ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <p className="text-sm text-muted-foreground mb-2">{stat.description}</p>
              <Badge variant="secondary" className="text-xs">
                {stat.trend}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Panel de control mejorado */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="students">Estudiantes</TabsTrigger>
          <TabsTrigger value="requests">Solicitudes</TabsTrigger>
          <TabsTrigger value="earnings">Ganancias</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Perfil del Instructor */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Mi Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={instructorProfile.imageUrl} alt={instructorProfile.name} />
                  <AvatarFallback>
                    {instructorProfile.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold mb-1">{instructorProfile.name}</h3>
                <p className="text-sm text-primary mb-2 flex items-center gap-1">
                  <Award className="h-4 w-4" /> {instructorProfile.specialty}
                </p>
                <p className="text-sm text-muted-foreground mb-4">{instructorProfile.bio}</p>
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <MapPin className="h-4 w-4" /> {instructorProfile.location}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                  <Star className="h-4 w-4 text-yellow-500" fill="currentColor" /> {instructorProfile.rating} ({instructorProfile.reviews} reseñas)
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 w-full">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" /> {instructorProfile.contact.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" /> {instructorProfile.contact.phone}
                  </div>
                </div>
                <Button variant="outline" className="mt-6 w-full">Editar Perfil</Button>
              </CardContent>
            </Card>

            {/* Próximas sesiones */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Próximas Sesiones
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeStudents.length > 0 ? (
                  <div className="space-y-4">
                    {activeStudents.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={student.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.nextSession}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{student.plan}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay sesiones programadas</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actividad reciente */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Nueva reseña 5⭐</p>
                      <p className="text-sm text-muted-foreground">Ana García - Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Nuevo estudiante</p>
                      <p className="text-sm text-muted-foreground">Carlos Ruiz - Ayer</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <MessageCircle className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Nueva solicitud de estudiante</p>
                      <p className="text-sm text-muted-foreground">María Paz - Hace 1 día</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estudiantes Activos</CardTitle>
            </CardHeader>
            <CardContent>
              {activeStudents.length > 0 ? (
                <div className="space-y-4">
                  {activeStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={student.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{student.name}</h4>
                          <p className="text-sm text-muted-foreground">Plan {student.plan}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${student.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{student.progress}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex gap-2">
                        <Button variant="outline" size="sm">Ver Perfil</Button>
                        <Button size="sm">Enviar Mensaje</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">No tienes estudiantes activos</h3>
                  <p className="text-muted-foreground">Las solicitudes aceptadas aparecerán aquí</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{request.student.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{request.student}</h4>
                          <p className="text-sm text-muted-foreground">Objetivo: {request.goal}</p>
                          <p className="text-sm text-muted-foreground">Experiencia: {request.experience}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{request.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" /> Aceptar
                        </Button>
                        <Button variant="outline" size="sm">
                          <XCircle className="h-4 w-4 mr-1" /> Rechazar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">No hay solicitudes pendientes</h3>
                  <p className="text-muted-foreground">Las nuevas solicitudes de estudiantes aparecerán aquí</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Ganancias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <DollarSign className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">No hay ganancias registradas</h3>
                <p className="text-muted-foreground">Las ganancias aparecerán aquí cuando tengas estudiantes activos</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
