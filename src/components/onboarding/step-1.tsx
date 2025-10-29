"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
// import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  Clock01Icon,
  PercentSquareIcon,
  RulerIcon,
  SteakIcon,
  Target02Icon,
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
  preferredWorkoutTime: "",
  dietaryPreference: "",
};

export default function StepOnboarding1() {
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
        return parsed;
      } catch (e) {
        console.error("Error parsing saved form data:", e);
        return initialFormData;
      }
    }
    return initialFormData;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [selectedDays, setSelectedDays] = useState<string[]>([]);

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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold  tracking-heading">
          Información de Perfil
        </CardTitle>
        <CardDescription className="text-xs">
          Háganos saber sobre usted para que podamos personalizar su experiencia
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Step indicator */}
          <div className="flex justify-between mb-6">
            {[0, 1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center text-xs md:text-xs justify-center ${
                    step <= currentStep
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-black border"
                      : "bg-background dark:bg-background border text-muted-foreground dark:text-gray-300"
                  }`}
                >
                  {step + 1}
                </div>
              </div>
            ))}
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs md:text-xs" htmlFor="gender">
                      Genero
                    </Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        updateFormData({ gender: value })
                      }
                    >
                      <SelectTrigger className="text-xs md:text-xs">
                        <div className="flex flex-row items-center gap-4 text-black dark:text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width={18}
                            height={18}
                            className="text-current"
                            fill="none"
                          >
                            <path
                              d="M19.4995 20V16.5C20.5856 16.5 21.1991 16.5 21.4186 16.0257C21.6381 15.5515 21.3953 14.9028 20.9095 13.6056L19.6676 10.2889C19.2571 9.19253 18.4179 8.5 17.5 8.5C16.5821 8.5 15.7429 9.19253 15.3324 10.2889L14.0905 13.6056C13.6047 14.9028 13.3619 15.5515 13.5814 16.0257C13.8009 16.5 14.4133 16.5 15.4995 16.5V20C15.4995 20.9428 15.4995 21.4142 15.7924 21.7071C16.0853 22 16.5567 22 17.4995 22C18.4423 22 18.9137 22 19.2066 21.7071C19.4995 21.4142 19.4995 20.9428 19.4995 20Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M8.5 4C8.5 5.10457 7.60457 6 6.5 6C5.39543 6 4.5 5.10457 4.5 4C4.5 2.89543 5.39543 2 6.5 2C7.60457 2 8.5 2.89543 8.5 4Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M19.5 4C19.5 5.10457 18.6046 6 17.5 6C16.3954 6 15.5 5.10457 15.5 4C15.5 2.89543 16.3954 2 17.5 2C18.6046 2 19.5 2.89543 19.5 4Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M10.5 12.5C10.5 10.6144 10.5 9.67157 9.91421 9.08579C9.32843 8.5 8.38562 8.5 6.5 8.5C4.61438 8.5 3.67157 8.5 3.08579 9.08579C2.5 9.67157 2.5 10.6144 2.5 12.5V14.5C2.5 15.4428 2.5 15.9142 2.79289 16.2071C3.08579 16.5 3.55719 16.5 4.5 16.5V20C4.5 20.9428 4.5 21.4142 4.79289 21.7071C5.08579 22 5.55719 22 6.5 22C7.44281 22 7.91421 22 8.20711 21.7071C8.5 21.4142 8.5 20.9428 8.5 20V16.5C9.44281 16.5 9.91421 16.5 10.2071 16.2071C10.5 15.9142 10.5 15.4428 10.5 14.5V12.5Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <SelectValue
                            className="text-xs md:text-xs"
                            placeholder="Seleccione su género"
                          />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem className="text-xs md:text-xs" value="male">
                          Masculino
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-xs"
                          value="female"
                        >
                          Femenino
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-xs"
                          value="other"
                        >
                          Otro
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs md:text-xs" htmlFor="height">
                      Altura (cm)
                    </Label>
                    <Select
                      value={formData.height}
                      onValueChange={(value) =>
                        updateFormData({ height: value })
                      }
                    >
                      <SelectTrigger className="text-xs md:text-xs">
                        <div className="flex flex-row items-center gap-4">
                          <HugeiconsIcon
                            icon={RulerIcon}
                            size={18}
                            className="text-foreground"
                          />
                          <SelectValue placeholder="Seleccione su altura" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {heightOptions.map((height) => (
                          <SelectItem
                            className="text-xs md:text-xs"
                            key={height}
                            value={height}
                          >
                            {height} cm
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      className="text-xs md:text-xs"
                      htmlFor="currentWeight"
                    >
                      Peso Actual (kg)
                    </Label>
                    <Select
                      value={formData.currentWeight}
                      onValueChange={(value) =>
                        updateFormData({ currentWeight: value })
                      }
                    >
                      <SelectTrigger className="text-xs md:text-xs">
                        <div className="flex flex-row items-center gap-4">
                          <HugeiconsIcon
                            icon={WeightScaleIcon}
                            size={18}
                            className="text-foreground"
                          />
                          <SelectValue placeholder="Seleccione su peso actual" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
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
                      className="text-xs md:text-xs"
                      htmlFor="targetWeight"
                    >
                      Peso Objetivo (kg)
                    </Label>
                    <Select
                      value={formData.targetWeight}
                      onValueChange={(value) =>
                        updateFormData({ targetWeight: value })
                      }
                    >
                      <SelectTrigger className="text-xs md:text-xs">
                        <div className="flex flex-row items-center gap-4">
                          <HugeiconsIcon
                            icon={BodyWeightIcon}
                            size={18}
                            className="text-foreground"
                          />
                          <SelectValue
                            className="text-xs md:text-xs"
                            placeholder="Seleccione su peso objetivo"
                          />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {weightOptions.map((weight) => (
                          <SelectItem
                            className="text-xs md:text-xs"
                            key={weight}
                            value={weight}
                          >
                            {weight} kg
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      className="text-xs md:text-xs"
                      htmlFor="activityLevel"
                    >
                      Nivel de actividad
                    </Label>
                    <Select
                      value={formData.activityLevel}
                      onValueChange={(value) =>
                        updateFormData({ activityLevel: value })
                      }
                    >
                      <SelectTrigger className="text-xs md:text-xs">
                        <div className="flex flex-row items-center gap-4">
                          <HugeiconsIcon
                            icon={Activity03Icon}
                            size={18}
                            className="text-foreground"
                          />
                          <SelectValue
                            className="text-xs md:text-xs"
                            placeholder="Seleccione su nivel de actividad"
                          />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          className="text-xs md:text-xs"
                          value="sedentary"
                        >
                          Sedentario (poco o ningún ejercicio)
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-xs"
                          value="light"
                        >
                          Ligeramente activo (ejercicio ligero 1-3 días/semana)
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-xs"
                          value="moderate"
                        >
                          Moderadamente activo (ejercicio moderado 3-5
                          días/semana)
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-xs"
                          value="active"
                        >
                          Activo (ejercicio intenso 6-7 días/semana)
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-xs"
                          value="very-active"
                        >
                          Muy activo (ejercicio muy intenso y trabajo físico)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      className="text-xs md:text-xs"
                      htmlFor="bodyFatPercentage"
                    >
                      Procentaje de grasa corporal
                    </Label>
                    <Select
                      value={formData.bodyFatPercentage}
                      onValueChange={(value) =>
                        updateFormData({ bodyFatPercentage: value })
                      }
                    >
                      <SelectTrigger className="text-xs md:text-xs">
                        <div className="flex flex-row items-center gap-4">
                          <HugeiconsIcon
                            icon={PercentSquareIcon}
                            size={18}
                            className="text-foreground"
                          />
                          <SelectValue
                            className="text-xs md:text-xs"
                            placeholder="Seleccione su porcentaje de grasa corporal"
                          />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {formData.gender === "male" ? (
                          <>
                            <SelectItem
                              className="text-xs md:text-xs"
                              value="essential"
                            >
                              Grasa esencial (5%)
                            </SelectItem>
                            <SelectItem
                              className="text-xs md:text-xs"
                              value="athletes"
                            >
                              Atletas (6-13%)
                            </SelectItem>
                            <SelectItem
                              className="text-xs md:text-xs"
                              value="fitness"
                            >
                              Forma física (14-17%)
                            </SelectItem>
                            <SelectItem
                              className="text-xs md:text-xs"
                              value="average"
                            >
                              Promedio (18-24%)
                            </SelectItem>
                            <SelectItem
                              className="text-xs md:text-xs"
                              value="above-average"
                            >
                              Por encima del promedio (25%+)
                            </SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem
                              className="text-xs md:text-xs"
                              value="essential"
                            >
                              Grasa esencial (8%)
                            </SelectItem>
                            <SelectItem
                              className="text-xs md:text-xs"
                              value="athletes"
                            >
                              Atletas (14-20%)
                            </SelectItem>
                            <SelectItem
                              className="text-xs md:text-xs"
                              value="fitness"
                            >
                              Forma física (21-24%)
                            </SelectItem>
                            <SelectItem
                              className="text-xs md:text-xs"
                              value="average"
                            >
                              Promedio (25-31%)
                            </SelectItem>
                            <SelectItem
                              className="text-xs md:text-xs"
                              value="above-average"
                            >
                              Por encima del promedio (32%+)
                            </SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs md:text-xs" htmlFor="muscleMass">
                      Masa muscular
                    </Label>
                    <Select
                      value={formData.muscleMass}
                      onValueChange={(value) =>
                        updateFormData({ muscleMass: value })
                      }
                    >
                      <SelectTrigger className="text-xs md:text-xs">
                        <div className="flex flex-row items-center gap-4">
                          <HugeiconsIcon
                            icon={BodyPartMuscleIcon}
                            size={18}
                            className="text-foreground"
                          />
                          <SelectValue
                            className="text-xs md:text-xs"
                            placeholder="Seleccione su masa muscular"
                          />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {formData.gender === "male" ? (
                          <>
                            <SelectItem
                              className="text-xs md:text-xs"
                              value="low"
                            >
                              Bajo (menos del 40%)
                            </SelectItem>
                            <SelectItem
                              className="text-xs md:text-xs"
                              value="healthy"
                            >
                              Saludable (40-45%)
                            </SelectItem>
                            <SelectItem
                              className="text-xs md:text-xs"
                              value="athletic"
                            >
                              Atlético (45-50%)
                            </SelectItem>
                            <SelectItem
                              className="text-xs md:text-xs"
                              value="high"
                            >
                              Alto (más del 50%)
                            </SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem
                              className="text-xs md:text-xs"
                              value="low"
                            >
                              Bajo (menos del 30%)
                            </SelectItem>
                            <SelectItem
                              className="text-xs md:text-xs"
                              value="healthy"
                            >
                              Saludable (30-35%)
                            </SelectItem>
                            <SelectItem
                              className="text-xs md:text-xs"
                              value="athletic"
                            >
                              Atlético (35-40%)
                            </SelectItem>
                            <SelectItem
                              className="text-xs md:text-xs"
                              value="high"
                            >
                              Alto (más del 40%)
                            </SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs md:text-xs" htmlFor="goal">
                      Objetivo
                    </Label>
                    <Select
                      value={formData.goal}
                      onValueChange={(value) => updateFormData({ goal: value })}
                    >
                      <SelectTrigger className="text-xs md:text-xs">
                        <div className="flex flex-row items-center gap-4">
                          <HugeiconsIcon
                            icon={Target02Icon}
                            size={18}
                            className="text-foreground"
                          />
                          <SelectValue
                            className="text-xs md:text-xs"
                            placeholder="Seleccione su objetivo"
                          />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          className="text-xs md:text-xs"
                          value="lose-weight"
                        >
                          Perder peso
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-xs"
                          value="maintain"
                        >
                          Mantener peso
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-xs"
                          value="gain-muscle"
                        >
                          Ganar músculo
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      className="text-xs md:text-xs"
                      htmlFor="dailyActivity"
                    >
                      Actividad diaria
                    </Label>
                    <Select
                      value={formData.dailyActivity}
                      onValueChange={(value) =>
                        updateFormData({ dailyActivity: value })
                      }
                    >
                      <SelectTrigger className="text-xs md:text-xs">
                        {/* <SelectValue placeholder="Select your daily activity" /> */}
                        <div className="flex flex-row items-center gap-4">
                          <HugeiconsIcon
                            icon={WorkoutGymnasticsIcon}
                            size={18}
                            className="text-foreground"
                          />
                          <SelectValue placeholder="Seleccione su actividad diaria" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="office-work">
                          Trabajo de oficina (sedentario)
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
                      className="text-xs md:text-xs"
                      htmlFor="trainingFrequency"
                    >
                      Frecuencia de entrenamiento (dias por semana)
                    </Label>
                    <ToggleGroup
                      type="multiple"
                      variant="outline"
                      value={selectedDays}
                      onValueChange={(value) => {
                        setSelectedDays(value);
                        updateFormData({ trainingFrequency: value.length });
                      }}
                      className="justify-start"
                    >
                      {daysOfWeek.map((day) => (
                        <ToggleGroupItem
                          key={day.id}
                          value={day.id}
                          aria-label={day.label}
                          className="w-10 h-10 text-xs md:text-xs"
                        >
                          {day.label}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>

                  <div className="space-y-2">
                    <Label
                      className="text-xs md:text-xs"
                      htmlFor="preferredWorkoutTime"
                    >
                      Tiempo de entrenamiento
                    </Label>
                    <Select
                      value={formData.preferredWorkoutTime}
                      onValueChange={(value) =>
                        updateFormData({ preferredWorkoutTime: value })
                      }
                    >
                      <SelectTrigger className="text-xs md:text-xs">
                        <div className="flex flex-row items-center gap-4">
                          <HugeiconsIcon
                            icon={Clock01Icon}
                            size={18}
                            className="text-foreground"
                          />
                          <SelectValue placeholder="Seleccione su hora preferida" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          className="text-xs md:text-xs"
                          value="early-morning"
                        >
                          Temprano en la mañana (5-8 AM)
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-xs"
                          value="morning"
                        >
                          Mañana (8-11 AM)
                        </SelectItem>
                        <SelectItem className="text-xs md:text-xs" value="noon">
                          Mediodía (11 AM-2 PM)
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-xs"
                          value="afternoon"
                        >
                          Tarde (2-5 PM)
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-xs"
                          value="evening"
                        >
                          Atardecer (5-8 PM)
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-xs"
                          value="night"
                        >
                          Noche (8-11 PM)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      className="text-xs md:text-xs"
                      htmlFor="dietaryPreference"
                    >
                      Preferencia dietetica
                    </Label>
                    <Select
                      value={formData.dietaryPreference}
                      onValueChange={(value) =>
                        updateFormData({ dietaryPreference: value })
                      }
                    >
                      <SelectTrigger className="text-xs md:text-xs">
                        <div className="flex flex-row items-center gap-4">
                          <HugeiconsIcon
                            icon={SteakIcon}
                            size={18}
                            className="text-foreground"
                          />
                          <SelectValue placeholder="Seleccione su preferencia dietética" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          className="text-xs md:text-xs"
                          value="no-preference"
                        >
                          Sin preferencia específica
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-xs"
                          value="vegetarian"
                        >
                          Vegetariano
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-xs"
                          value="vegan"
                        >
                          Vegano
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-xs"
                          value="pescatarian"
                        >
                          Pescetariano
                        </SelectItem>
                        <SelectItem className="text-xs md:text-xs" value="keto">
                          Keto
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-xs"
                          value="paleo"
                        >
                          Paleo
                        </SelectItem>
                        <SelectItem
                          className="text-xs md:text-xs"
                          value="mediterranean"
                        >
                          Mediterránea
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between pt-4">
            <Button
              size="sm"
              className="text-xs px-4"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Anterior
            </Button>

            {currentStep < 3 ? (
              <Button className="text-xs px-4" size="sm" onClick={handleNext}>
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                size="sm"
                disabled={isSubmitting}
                className="bg-foreground text-white dark:bg-white dark:text-black border text-xs px-4"
              >
                {isSubmitting ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Guardando
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
