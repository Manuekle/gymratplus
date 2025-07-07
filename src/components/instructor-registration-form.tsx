"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  UserIcon
} from "hugeicons-react";
import { toast } from "sonner";
import { InstructorFormData } from "@/types/instructor-types";

interface InstructorRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function InstructorRegistrationForm({ onSuccess, onCancel }: InstructorRegistrationFormProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<InstructorFormData>({
    country: "",
    city: "",
    neighborhood: "",
    bio: "",
    specialties: [],
    experience: "",
    certifications: [],
    hourlyRate: 0,
    isRemoteAvailable: false,
    contactInfo: {},
    availability: {},
  });

  const specialties = [
    "Peso corporal",
    "Fuerza",
    "Cardio",
    "Yoga",
    "Pilates",
    "CrossFit",
    "Funcional",
    "Rehabilitación",
  ];

  const experienceLevels = [
    "1-3 años",
    "3-5 años",
    "5+ años",
  ];

  const certifications = [
    "Certificación Personal Trainer",
    "Certificación Nutrición",
    "Certificación Yoga",
    "Certificación Pilates",
    "Certificación CrossFit",
    "Licenciatura en Ciencias del Deporte",
    "Máster en Ciencias del Deporte",
  ];

  const days = [
    { key: "monday", label: "Lunes" },
    { key: "tuesday", label: "Martes" },
    { key: "wednesday", label: "Miércoles" },
    { key: "thursday", label: "Jueves" },
    { key: "friday", label: "Viernes" },
    { key: "saturday", label: "Sábado" },
    { key: "sunday", label: "Domingo" },
  ];

  const timeSlots = [
    { key: "morning", label: "Mañana" },
    { key: "afternoon", label: "Tarde" },
    { key: "evening", label: "Noche" },
  ];

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleCertificationToggle = (certification: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(certification)
        ? prev.certifications.filter(c => c !== certification)
        : [...prev.certifications, certification]
    }));
  };

  const handleAvailabilityChange = (day: string, time: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [time]: checked,
        },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast.error("Debes iniciar sesión para registrarte como instructor");
      return;
    }

    if (formData.specialties.length === 0) {
      toast.error("Debes seleccionar al menos una especialidad");
      return;
    }

    if (!formData.experience) {
      toast.error("Debes seleccionar tu experiencia");
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch("/api/instructors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("¡Registro exitoso! Ya eres instructor");
        onSuccess?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al registrarse como instructor");
      }
    } catch (error) {
      console.error("Error al registrarse:", error);
      toast.error("Error al registrarse como instructor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Registro de Instructor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Básica</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="country">País *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="city">Ciudad *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="neighborhood">Barrio/Sector</Label>
              <Input
                id="neighborhood"
                value={formData.neighborhood}
                onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="bio">Biografía *</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Cuéntanos sobre tu experiencia, metodología y enfoque..."
                rows={4}
                required
              />
            </div>
          </div>

          {/* Especialidades */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Especialidades *</h3>
            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty) => (
                <Badge
                  key={specialty}
                  variant={formData.specialties.includes(specialty) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleSpecialtyToggle(specialty)}
                >
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          {/* Experiencia */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Experiencia *</h3>
            <div className="grid gap-2">
              {experienceLevels.map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={level}
                    name="experience"
                    value={level}
                    checked={formData.experience === level}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                    className="rounded"
                  />
                  <Label htmlFor={level}>{level}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Certificaciones */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Certificaciones</h3>
            <div className="grid gap-2 md:grid-cols-2">
              {certifications.map((certification) => (
                <div key={certification} className="flex items-center space-x-2">
                  <Checkbox
                    id={certification}
                    checked={formData.certifications.includes(certification)}
                    onCheckedChange={(checked) => 
                      handleCertificationToggle(certification)
                    }
                  />
                  <Label htmlFor={certification} className="text-sm">
                    {certification}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Precio y disponibilidad */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Precio y Disponibilidad</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="hourlyRate">Precio por hora (USD) *</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remote"
                  checked={formData.isRemoteAvailable}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isRemoteAvailable: checked as boolean }))
                  }
                />
                <Label htmlFor="remote">Disponible para sesiones remotas</Label>
              </div>
            </div>
          </div>

          {/* Disponibilidad */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Disponibilidad</h3>
            <div className="space-y-4">
              {days.map((day) => (
                <div key={day.key} className="space-y-2">
                  <Label className="font-medium">{day.label}</Label>
                  <div className="flex gap-4">
                    {timeSlots.map((time) => (
                      <div key={time.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${day.key}-${time.key}`}
                          checked={formData.availability[day.key]?.[time.key] || false}
                          onCheckedChange={(checked) => 
                            handleAvailabilityChange(day.key, time.key, checked as boolean)
                          }
                        />
                        <Label htmlFor={`${day.key}-${time.key}`} className="text-sm">
                          {time.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Registrando..." : "Registrarse como Instructor"}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 