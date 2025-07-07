"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MapPin, Star, MessageCircle } from "lucide-react"
import type { Instructor } from "@/types/instructor-types"

interface InstructorSearchProps {
  onInstructorSelect: (instructor: Instructor) => void
}

export function InstructorSearch({ onInstructorSelect }: InstructorSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Mock data - en una app real vendría de una API
  const mockInstructors: Instructor[] = [
    {
      id: "1",
      name: "Carlos Mendoza",
      specialty: "Entrenamiento Funcional",
      rating: 4.9,
      reviews: 45,
      location: "Ciudad de México",
      price: 80,
      avatar: "/placeholder.svg?height=60&width=60",
      experience: "5 años",
      certifications: ["NASM", "CrossFit L1"],
    },
    {
      id: "2",
      name: "Ana García",
      specialty: "Yoga & Pilates",
      rating: 4.8,
      reviews: 32,
      location: "Guadalajara",
      price: 60,
      avatar: "/placeholder.svg?height=60&width=60",
      experience: "3 años",
      certifications: ["RYT-200", "Pilates Mat"],
    },
    {
      id: "3",
      name: "Miguel Torres",
      specialty: "Musculación",
      rating: 4.7,
      reviews: 28,
      location: "Monterrey",
      price: 90,
      avatar: "/placeholder.svg?height=60&width=60",
      experience: "7 años",
      certifications: ["NSCA", "ACSM"],
    },
  ]

  const handleSearch = () => {
    setIsLoading(true)
    // Simular búsqueda
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const filteredInstructors = mockInstructors.filter(
    (instructor) =>
      instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instructor.specialty.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o especialidad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? "Buscando..." : "Buscar"}
        </Button>
      </div>

      {/* Resultados */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredInstructors.map((instructor) => (
          <Card key={instructor.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={instructor.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {instructor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {instructor.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-2">{instructor.specialty}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{instructor.rating}</span>
                      <span className="text-muted-foreground">({instructor.reviews})</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {instructor.location}
                </div>

                <div className="flex flex-wrap gap-1">
                  {instructor.certifications.map((cert, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-2xl font-bold">${instructor.price}</span>
                    <span className="text-muted-foreground text-sm">/sesión</span>
                  </div>
                  <Button size="sm" onClick={() => onInstructorSelect(instructor)} className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Contactar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInstructors.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2">No se encontraron instructores</h3>
          <p className="text-muted-foreground">Intenta con otros términos de búsqueda o ajusta los filtros</p>
        </div>
      )}
    </div>
  )
}
