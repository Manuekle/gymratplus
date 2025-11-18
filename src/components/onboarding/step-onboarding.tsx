"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
// import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
// import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/icons";

import { BirthDatePicker } from "../ui/birth-date-picker";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Activity03Icon,
  BodyPartMuscleIcon,
  BodyWeightIcon,
  Calendar01Icon,
  Clock01Icon,
  PercentSquareIcon,
  RulerIcon,
  SteakIcon,
  Target02Icon,
  UserGroupIcon,
  WeightScaleIcon,
  WorkoutGymnasticsIcon,
} from "@hugeicons/core-free-icons";

const heightOptions = Array.from({ length: 81 }, (_, i) =>
  (i + 140).toString(),
); // 140cm to 220cm
const weightOptions = Array.from({ length: 141 }, (_, i) =>
  (i + 40).toString(),
); // 40kg to 180kg

const daysOfWeek = [
  { id: "mon", label: "M" },
  { id: "tue", label: "T" },
  { id: "wed", label: "W" },
  { id: "thu", label: "T" },
  { id: "fri", label: "F" },
  { id: "sat", label: "S" },
  { id: "sun", label: "S" },
];

type ProfileFormData = {
  gender: string;
  birthdate: string | Date | undefined;
  height: string;
  currentWeight: string;
  targetWeight: string;
  activityLevel: string;
  goal: string;
  bodyFatPercentage: string;
  muscleMass: string;
  dailyActivity: string;
  trainingFrequency: number;
  trainingDays: string[];
  monthsTraining: number;
  experienceLevel: string;
  preferredWorkoutTime: string;
  dietaryPreference: string;
};

const initialFormData: ProfileFormData = {
  gender: "",
  birthdate: undefined,
  height: "",
  currentWeight: "",
  targetWeight: "",
  activityLevel: "",
  goal: "",
  bodyFatPercentage: "",
  muscleMass: "",
  dailyActivity: "",
  trainingFrequency: 0,
  trainingDays: [],
  monthsTraining: 0,
  experienceLevel: "",
  preferredWorkoutTime: "",
  dietaryPreference: "",
};

export default function StepOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProfileFormData>(() => {
    const savedData =
      typeof window !== "undefined"
        ? localStorage.getItem("profileFormData")
        : null;
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Convertir la fecha de string a objeto Date si existe
        if (parsed.birthdate) {
          parsed.birthdate = new Date(parsed.birthdate);
        }
        // Asegurar que trainingDays sea un array
        if (!parsed.trainingDays || !Array.isArray(parsed.trainingDays)) {
          parsed.trainingDays = [];
        }
        return { ...initialFormData, ...parsed };
      } catch (e) {
        console.error("Error parsing saved form data:", e);
        return initialFormData;
      }
    }
    return initialFormData;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Inicializar selectedDays desde formData.trainingDays si existe
  const [selectedDays, setSelectedDays] = useState<string[]>(() => {
    return formData.trainingDays || [];
  });

  // Sincronizar selectedDays cuando formData cambia
  useEffect(() => {
    if (formData.trainingDays && formData.trainingDays.length > 0) {
      setSelectedDays(formData.trainingDays);
    }
  }, [formData.trainingDays]);

  const updateFormData = (updates: Partial<ProfileFormData>) => {
    // Asegurarse de que si updates contiene birthdate, sea un objeto Date válido
    if (updates.birthdate && !(updates.birthdate instanceof Date)) {
      try {
        updates.birthdate = new Date(updates.birthdate);
      } catch (e) {
        console.error("Error converting birthdate to Date object:", e);
      }
    }

    const newData = { ...formData, ...updates };
    setFormData(newData);
    localStorage.setItem(
      "profileFormData",
      JSON.stringify(newData, (key, value) => {
        // Convertir objetos Date a strings ISO para almacenamiento en localStorage
        if (key === "birthdate" && value instanceof Date) {
          return value.toISOString();
        }
        return value;
      }),
    );
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0:
        if (!formData.gender || !formData.birthdate) {
          toast.error("Rellene todos los campos obligatorios", {
            description: "El sexo y la fecha de nacimiento son obligatorios.",
          });
          return false;
        }
        break;
      case 1:
        if (
          !formData.height ||
          !formData.currentWeight ||
          !formData.targetWeight
        ) {
          toast.error("Por favor, introduzca medidas válidas", {
            description:
              "Se requiere la altura, el peso actual y el peso objetivo.",
          });
          return false;
        }
        break;
      case 2:
        if (
          !formData.activityLevel ||
          !formData.goal ||
          !formData.bodyFatPercentage ||
          !formData.muscleMass
        ) {
          toast.error("Rellene todos los campos", {
            description:
              "Se requiere nivel de actividad, objetivo, porcentaje de grasa corporal y masa muscular.",
          });
          return false;
        }
        break;
      case 3:
        if (!formData.experienceLevel) {
          toast.error("Seleccione su nivel de experiencia", {
            description: "Seleccione su nivel de experiencia en entrenamiento.",
          });
          return false;
        }
        if (
          formData.monthsTraining === 0 &&
          formData.experienceLevel !== "beginner"
        ) {
          toast.error("Seleccione los meses entrenando", {
            description: "Seleccione cuántos meses lleva entrenando.",
          });
          return false;
        }
        if (formData.trainingFrequency === 0) {
          toast.error("Seleccione la frecuencia de formación", {
            description: "Seleccione al menos un día de formación.",
          });
          return false;
        }
        if (!formData.preferredWorkoutTime) {
          toast.error("Seleccione la hora de entrenamiento que prefiera", {
            description: "Elige la hora que prefieras para entrenar.",
          });
          return false;
        }
        if (!formData.dietaryPreference) {
          toast.error("Seleccione su preferencia dietética", {
            description: "Elija su preferencia dietética.",
          });
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    try {
      const dataToSend = { ...formData };
      // Create a formatted payload to convert birthdate to ISO string if needed
      const payload: Partial<ProfileFormData> = { ...dataToSend };
      if (payload.birthdate) {
        if (
          payload.birthdate instanceof Date &&
          !isNaN(payload.birthdate.getTime())
        ) {
          payload.birthdate = payload.birthdate.toISOString();
        } else {
          try {
            const dateObj = new Date(payload.birthdate);
            if (!isNaN(dateObj.getTime())) {
              payload.birthdate = dateObj.toISOString();
            } else {
              console.warn(
                "Fecha no válida detectada, enviando tal cual:",
                payload.birthdate,
              );
            }
          } catch (e) {
            console.error("Error converting birthdate:", e);
            delete payload.birthdate;
          }
        }
      }

      console.log("Sending data:", payload);

      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit profile data");
      }

      const updatedProfile = await response.json();
      console.log("Updated profile:", updatedProfile);

      toast.success("¡Perfil guardado correctamente!", {
        description: "La información de tu perfil ha sido actualizada.",
      });

      // Redirigir a la página de recomendaciones después de guardar el perfil
      router.push("/onboarding/recommendations");
    } catch (error) {
      console.error("Error submitting profile:", error);
      toast.error("No se ha podido guardar el perfil", {
        description:
          "Por favor, inténtelo de nuevo. Si el problema persiste, póngase en contacto con el servicio de asistencia.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Crea tu perfil
        </h1>
        <p className="text-xs text-muted-foreground">
          Paso {currentStep + 1} de 4
        </p>
      </div>

      {/* Progress bar simple */}
      <div className="mb-8">
        <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-black dark:bg-white transition-all duration-300"
            style={{ width: `${((currentStep + 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label
                  className="text-xs font-medium flex items-center gap-2"
                  htmlFor="gender"
                >
                  <HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4" />
                  Género
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => updateFormData({ gender: value })}
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Selecciona tu género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Femenino</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <BirthDatePicker
                  value={formData.birthdate}
                  onValueChange={(value) =>
                    updateFormData({ birthdate: value })
                  }
                />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label
                  className="text-xs font-medium flex items-center gap-2"
                  htmlFor="height"
                >
                  <HugeiconsIcon icon={RulerIcon} className="w-4 h-4" />
                  Altura (cm)
                </Label>
                <Select
                  value={formData.height}
                  onValueChange={(value) => updateFormData({ height: value })}
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Selecciona tu altura" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {heightOptions.map((height) => (
                      <SelectItem key={height} value={height}>
                        {height} cm
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  className="text-xs font-medium flex items-center gap-2"
                  htmlFor="currentWeight"
                >
                  <HugeiconsIcon icon={WeightScaleIcon} className="w-4 h-4" />
                  Peso actual (kg)
                </Label>
                <Select
                  value={formData.currentWeight}
                  onValueChange={(value) =>
                    updateFormData({ currentWeight: value })
                  }
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Selecciona tu peso actual" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {weightOptions.map((weight) => (
                      <SelectItem key={weight} value={weight}>
                        {weight} kg
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  className="text-xs font-medium flex items-center gap-2"
                  htmlFor="targetWeight"
                >
                  <HugeiconsIcon icon={BodyWeightIcon} className="w-4 h-4" />
                  Peso objetivo (kg)
                </Label>
                <Select
                  value={formData.targetWeight}
                  onValueChange={(value) =>
                    updateFormData({ targetWeight: value })
                  }
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Selecciona tu peso objetivo" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {weightOptions.map((weight) => (
                      <SelectItem key={weight} value={weight}>
                        {weight} kg
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label
                  className="text-xs font-medium flex items-center gap-2"
                  htmlFor="activityLevel"
                >
                  <HugeiconsIcon icon={Activity03Icon} className="w-4 h-4" />
                  Nivel de actividad
                </Label>
                <Select
                  value={formData.activityLevel}
                  onValueChange={(value) =>
                    updateFormData({ activityLevel: value })
                  }
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Selecciona tu nivel de actividad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentario</SelectItem>
                    <SelectItem value="light">Ligeramente activo</SelectItem>
                    <SelectItem value="moderate">
                      Moderadamente activo
                    </SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="very-active">Muy activo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  className="text-xs font-medium flex items-center gap-2"
                  htmlFor="bodyFatPercentage"
                >
                  <HugeiconsIcon icon={PercentSquareIcon} className="w-4 h-4" />
                  Porcentaje de grasa corporal
                </Label>
                <Select
                  value={formData.bodyFatPercentage}
                  onValueChange={(value) =>
                    updateFormData({ bodyFatPercentage: value })
                  }
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Selecciona tu porcentaje de grasa corporal" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.gender === "male" ? (
                      <>
                        <SelectItem value="essential">
                          Grasa esencial (5%)
                        </SelectItem>
                        <SelectItem value="athletes">
                          Atletas (6-13%)
                        </SelectItem>
                        <SelectItem value="fitness">
                          Forma física (14-17%)
                        </SelectItem>
                        <SelectItem value="average">
                          Promedio (18-24%)
                        </SelectItem>
                        <SelectItem value="above-average">
                          Por encima del promedio (25%+)
                        </SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="essential">
                          Grasa esencial (8%)
                        </SelectItem>
                        <SelectItem value="athletes">
                          Atletas (14-20%)
                        </SelectItem>
                        <SelectItem value="fitness">
                          Forma física (21-24%)
                        </SelectItem>
                        <SelectItem value="average">
                          Promedio (25-31%)
                        </SelectItem>
                        <SelectItem value="above-average">
                          Por encima del promedio (32%+)
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  className="text-xs font-medium flex items-center gap-2"
                  htmlFor="muscleMass"
                >
                  <HugeiconsIcon
                    icon={BodyPartMuscleIcon}
                    className="w-4 h-4"
                  />
                  Masa muscular
                </Label>
                <Select
                  value={formData.muscleMass}
                  onValueChange={(value) =>
                    updateFormData({ muscleMass: value })
                  }
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Selecciona tu masa muscular" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.gender === "male" ? (
                      <>
                        <SelectItem value="low">
                          Bajo (menos del 40%)
                        </SelectItem>
                        <SelectItem value="healthy">
                          Saludable (40-45%)
                        </SelectItem>
                        <SelectItem value="athletic">
                          Atlético (45-50%)
                        </SelectItem>
                        <SelectItem value="high">Alto (más del 50%)</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="low">
                          Bajo (menos del 30%)
                        </SelectItem>
                        <SelectItem value="healthy">
                          Saludable (30-35%)
                        </SelectItem>
                        <SelectItem value="athletic">
                          Atlético (35-40%)
                        </SelectItem>
                        <SelectItem value="high">Alto (más del 40%)</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  className="text-xs font-medium flex items-center gap-2"
                  htmlFor="goal"
                >
                  <HugeiconsIcon icon={Target02Icon} className="w-4 h-4" />
                  Objetivo
                </Label>
                <Select
                  value={formData.goal}
                  onValueChange={(value) => updateFormData({ goal: value })}
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Selecciona tu objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose-weight">Perder peso</SelectItem>
                    <SelectItem value="maintain">Mantener peso</SelectItem>
                    <SelectItem value="gain-muscle">Ganar músculo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label
                  className="text-xs font-medium flex items-center gap-2"
                  htmlFor="dailyActivity"
                >
                  <HugeiconsIcon
                    icon={WorkoutGymnasticsIcon}
                    className="w-4 h-4"
                  />
                  Actividad diaria
                </Label>
                <Select
                  value={formData.dailyActivity}
                  onValueChange={(value) =>
                    updateFormData({ dailyActivity: value })
                  }
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Selecciona tu actividad diaria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office-work">
                      Trabajo de oficina
                    </SelectItem>
                    <SelectItem value="light-physical">
                      Trabajo físico ligero
                    </SelectItem>
                    <SelectItem value="moderate-physical">
                      Trabajo físico moderado
                    </SelectItem>
                    <SelectItem value="heavy-physical">
                      Trabajo físico pesado
                    </SelectItem>
                    <SelectItem value="very-heavy-physical">
                      Trabajo físico muy pesado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  className="text-xs font-medium flex items-center gap-2"
                  htmlFor="experienceLevel"
                >
                  <HugeiconsIcon
                    icon={WorkoutGymnasticsIcon}
                    className="w-4 h-4"
                  />
                  Nivel de experiencia
                </Label>
                <Select
                  value={formData.experienceLevel}
                  onValueChange={(value) =>
                    updateFormData({ experienceLevel: value })
                  }
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Selecciona tu nivel de experiencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Principiante</SelectItem>
                    <SelectItem value="intermediate">Intermedio</SelectItem>
                    <SelectItem value="advanced">Avanzado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  className="text-xs font-medium flex items-center gap-2"
                  htmlFor="monthsTraining"
                >
                  <HugeiconsIcon icon={Calendar01Icon} className="w-4 h-4" />
                  Meses entrenando
                </Label>
                <Select
                  value={formData.monthsTraining.toString()}
                  onValueChange={(value) =>
                    updateFormData({ monthsTraining: parseInt(value) || 0 })
                  }
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Selecciona cuántos meses llevas entrenando" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {Array.from({ length: 61 }, (_, i) => i).map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {month === 0
                          ? "Menos de 1 mes"
                          : month === 1
                            ? "1 mes"
                            : `${month} meses`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  className="text-xs font-medium flex items-center gap-2"
                  htmlFor="trainingFrequency"
                >
                  <HugeiconsIcon icon={Calendar01Icon} className="w-4 h-4" />
                  Días de entrenamiento por semana
                </Label>
                <ToggleGroup
                  type="multiple"
                  variant="outline"
                  value={selectedDays}
                  onValueChange={(value) => {
                    setSelectedDays(value);
                    updateFormData({
                      trainingFrequency: value.length,
                      trainingDays: value,
                    });
                  }}
                  className="justify-start"
                >
                  {daysOfWeek.map((day) => (
                    <ToggleGroupItem
                      key={day.id}
                      value={day.id}
                      aria-label={day.label}
                      className="w-10 h-10"
                    >
                      {day.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <div className="space-y-2">
                <Label
                  className="text-xs font-medium flex items-center gap-2"
                  htmlFor="preferredWorkoutTime"
                >
                  <HugeiconsIcon icon={Clock01Icon} className="w-4 h-4" />
                  Horario preferido
                </Label>
                <Select
                  value={formData.preferredWorkoutTime}
                  onValueChange={(value) =>
                    updateFormData({ preferredWorkoutTime: value })
                  }
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Selecciona tu horario preferido" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="early-morning">
                      Temprano en la mañana (5-8 AM)
                    </SelectItem>
                    <SelectItem value="morning">Mañana (8-11 AM)</SelectItem>
                    <SelectItem value="noon">Mediodía (11 AM-2 PM)</SelectItem>
                    <SelectItem value="afternoon">Tarde (2-5 PM)</SelectItem>
                    <SelectItem value="evening">Atardecer (5-8 PM)</SelectItem>
                    <SelectItem value="night">Noche (8-11 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  className="text-xs font-medium flex items-center gap-2"
                  htmlFor="dietaryPreference"
                >
                  <HugeiconsIcon icon={SteakIcon} className="w-4 h-4" />
                  Preferencia dietética
                </Label>
                <Select
                  value={formData.dietaryPreference}
                  onValueChange={(value) =>
                    updateFormData({ dietaryPreference: value })
                  }
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Selecciona tu preferencia dietética" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-preference">
                      Sin preferencia específica
                    </SelectItem>
                    <SelectItem value="vegetarian">Vegetariano</SelectItem>
                    <SelectItem value="vegan">Vegano</SelectItem>
                    <SelectItem value="pescatarian">Pescetariano</SelectItem>
                    <SelectItem value="keto">Keto</SelectItem>
                    <SelectItem value="paleo">Paleo</SelectItem>
                    <SelectItem value="mediterranean">Mediterránea</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between pt-8 mt-8 border-t">
        <Button
          variant="ghost"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="px-4"
        >
          Anterior
        </Button>

        {currentStep < 3 ? (
          <Button className="px-6" onClick={handleNext}>
            Siguiente
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6"
          >
            {isSubmitting ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Finalizar"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
