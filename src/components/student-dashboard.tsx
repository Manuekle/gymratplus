"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, MessageCircle, Crown, Search, Filter, Clock, ArrowRight } from "lucide-react"
import { InstructorSearch } from "@/components/instructor-search"
import type { Instructor } from "@/types/instructor-types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Session } from "next-auth"

interface StudentDashboardProps {
  onInstructorSelect: (instructor: Instructor) => void
  session: Session | null // La sesión se utilizará más adelante para llamadas a la API
}

export function StudentDashboard({ onInstructorSelect, session }: StudentDashboardProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [selectedInstructorForRequest, setSelectedInstructorForRequest] = useState<Instructor | null>(null)
  const [requestMessage, setRequestMessage] = useState("")

  const stats = [
    {
      title: "Instructores Disponibles",
      value: "24",
      description: "En tu área",
      icon: Users,
      trend: "+3 esta semana",
      color: "text-blue-600",
    },
    {
      title: "Solicitudes Enviadas",
      value: "3",
      description: "Pendientes de respuesta",
      icon: MessageCircle,
      trend: "2 respondidas",
      color: "text-orange-600",
    },
    {
      title: "Instructor Actual",
      value: "1",
      description: "Activo",
      icon: Crown,
      trend: "Desde hace 2 meses",
      color: "text-green-600",
    },
  ]

  const recentRequests = [
    {
      id: 1,
      instructor: "Carlos Mendoza",
      specialty: "Entrenamiento Funcional",
      status: "pending",
      date: "Hace 2 días",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      instructor: "Ana García",
      specialty: "Yoga & Pilates",
      status: "accepted",
      date: "Hace 1 semana",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const handleSendRequest = () => {
    // Lógica para enviar la solicitud
    console.log(`Enviando solicitud a ${selectedInstructorForRequest?.user?.name} con mensaje: ${requestMessage}`)
    setIsRequestModalOpen(false)
    setSelectedInstructorForRequest(null)
    setRequestMessage("")
  }

  const openRequestModal = (instructor: Instructor) => {
    setSelectedInstructorForRequest(instructor)
    setIsRequestModalOpen(true)
  }

  return (
    <div className="space-y-8">
      {/* Estadísticas mejoradas */}
      <div className="grid gap-6 md:grid-cols-3">
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

      {/* Búsqueda mejorada */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Instructores
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showFilters && (
            <div className="grid gap-4 md:grid-cols-3 p-4 bg-muted/30 rounded-lg">
              <div>
                <Label htmlFor="specialty">Especialidad</Label>
                <Input id="specialty" placeholder="Ej: Yoga, Crossfit..." />
              </div>
              <div>
                <Label htmlFor="location">Ubicación</Label>
                <Input id="location" placeholder="Ciudad o código postal" />
              </div>
              <div>
                <Label htmlFor="price">Precio máximo</Label>
                <Input id="price" placeholder="$0 - $100" type="number" />
              </div>
            </div>
          )}
          <InstructorSearch onInstructorSelect={openRequestModal} />
        </CardContent>
      </Card>

      {/* Solicitudes recientes */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Mis Solicitudes Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentRequests.length > 0 ? (
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={request.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{request.instructor.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{request.instructor}</h4>
                      <p className="text-sm text-muted-foreground">{request.specialty}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{request.date}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={request.status === "accepted" ? "default" : request.status === "pending" ? "secondary" : "destructive"} className="capitalize">
                    {request.status === "pending" ? "Pendiente" : request.status === "accepted" ? "Aceptada" : "Rechazada"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No tienes solicitudes</h3>
              <p className="text-muted-foreground mb-4">
                Busca instructores y envía solicitudes para comenzar tu entrenamiento
              </p>
              <Button className="gap-2" onClick={() => setShowFilters(true)}>
                <Search className="h-4 w-4" />
                Buscar Instructores
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para enviar solicitud */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enviar Solicitud a {selectedInstructorForRequest?.user?.name}</DialogTitle>
            <DialogDescription>
              Escribe un mensaje para tu posible instructor. Sé claro sobre tus objetivos y por qué quieres entrenar con él/ella.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="message">Tu Mensaje</Label>
              <Textarea
                id="message"
                placeholder="Hola [Nombre Instructor], me gustaría entrenar contigo para..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSendRequest}>Enviar Solicitud <ArrowRight className="ml-2 h-4 w-4"/></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
