"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, RulerIcon } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import {
  Activity03Icon,
  BirthdayCakeIcon,
  BodyPartMuscleIcon,
  BodyWeightIcon,
  Clock01Icon,
  PercentSquareIcon,
  SteakIcon,
  Target02Icon,
  WeightScaleIcon,
} from "hugeicons-react";

const heightOptions = Array.from({ length: 81 }, (_, i) =>
  (i + 140).toString()
); // 140cm to 220cm
const weightOptions = Array.from({ length: 141 }, (_, i) =>
  (i + 40).toString()
); // 40kg to 180kg

const daysOfWeek = [
  { id: "lunes", label: "L" },
  { id: "marte", label: "M" },
  { id: "miercoles", label: "M" },
  { id: "jueves", label: "J" },
  { id: "viernes", label: "V" },
  { id: "sabado", label: "S" },
  { id: "domindo", label: "D" },
];

type ProfileFormData = {
  gender: string;
  birthdate: Date | undefined;
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

export default function StepOnboarding1({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProfileFormData>(() => {
    const savedData = localStorage.getItem("profileFormData");
    return savedData ? JSON.parse(savedData) : initialFormData;
  });
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (updates: Partial<ProfileFormData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    localStorage.setItem("profileFormData", JSON.stringify(newData));
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
          toast.error("Please fill in all required fields", {
            description: "Gender and Date of Birth are required.",
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
          toast.error("Please enter valid measurements", {
            description:
              "Height, current weight, and target weight are required.",
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
          toast.error("Please complete all fields", {
            description:
              "Activity level, goal, body fat percentage, and muscle mass are required.",
          });
          return false;
        }
        break;
      case 3:
        if (formData.trainingFrequency === 0) {
          toast.error("Please select training frequency", {
            description: "Select at least one training day.",
          });
          return false;
        }
        if (!formData.preferredWorkoutTime) {
          toast.error("Please select preferred workout time", {
            description: "Choose your preferred time to work out.",
          });
          return false;
        }
        if (!formData.dietaryPreference) {
          toast.error("Please select dietary preference", {
            description: "Choose your dietary preference.",
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
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit profile data");
      }

      const updatedProfile = await response.json();
      console.log("Updated profile:", updatedProfile);

      toast.success("Profile saved successfully!", {
        description: "Your profile information has been updated.",
      });
      onComplete();
    } catch (error) {
      toast.error("Failed to save profile", {
        description:
          "Please try again. If the problem persists, contact support.",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Let us know about yourself so we can personalize your experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Step indicator */}
          <div className="flex justify-between mb-6">
            {[0, 1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step <= currentStep
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-black border"
                      : "bg-background dark:bg-background border text-gray-500 dark:text-gray-300"
                  }`}
                >
                  {step + 1}
                </div>
              </div>
            ))}
          </div>

          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.1 }}
              className="space-y-4"
            >
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        updateFormData({ gender: value })
                      }
                    >
                      <SelectTrigger>
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
                          <SelectValue placeholder="Seleccione su género" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthdate">Fecha de nacimiento</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.birthdate && "text-muted-foreground"
                          )}
                        >
                          <BirthdayCakeIcon className="mr-2 h-4 w-4" />
                          {formData.birthdate ? (
                            format(formData.birthdate, "PPP")
                          ) : (
                            <span>Seleccione su fecha de nacimiento</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.birthdate}
                          onSelect={(date) =>
                            updateFormData({ birthdate: date })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Select
                      value={formData.height}
                      onValueChange={(value) =>
                        updateFormData({ height: value })
                      }
                    >
                      <SelectTrigger>
                        <div className="flex flex-row items-center gap-4">
                          <RulerIcon size={18} />
                          <SelectValue placeholder="Seleccione su altura" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {heightOptions.map((height) => (
                          <SelectItem key={height} value={height}>
                            {height} cm
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentWeight">Peso Actual (kg)</Label>
                    <Select
                      value={formData.currentWeight}
                      onValueChange={(value) =>
                        updateFormData({ currentWeight: value })
                      }
                    >
                      <SelectTrigger>
                        {/* <SelectValue placeholder="Select your current weight" /> */}
                        <div className="flex flex-row items-center gap-4">
                          <WeightScaleIcon size={18} />
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
                    <Label htmlFor="targetWeight">Peso Objetivo (kg)</Label>
                    <Select
                      value={formData.targetWeight}
                      onValueChange={(value) =>
                        updateFormData({ targetWeight: value })
                      }
                    >
                      <SelectTrigger>
                        <div className="flex flex-row items-center gap-4">
                          <BodyWeightIcon size={18} />
                          <SelectValue placeholder="Seleccione su peso objetivo" />
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
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="activityLevel">Nivel de actividad</Label>
                    <Select
                      value={formData.activityLevel}
                      onValueChange={(value) =>
                        updateFormData({ activityLevel: value })
                      }
                    >
                      <SelectTrigger>
                        <div className="flex flex-row items-center gap-4">
                          <Activity03Icon size={18} />
                          <SelectValue placeholder="Seleccione su nivel de actividad" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">
                          Sedentary (little or no exercise)
                        </SelectItem>
                        <SelectItem value="light">
                          Lightly active (light exercise 1-3 days/week)
                        </SelectItem>
                        <SelectItem value="moderate">
                          Moderately active (moderate exercise 3-5 days/week)
                        </SelectItem>
                        <SelectItem value="active">
                          Active (hard exercise 6-7 days/week)
                        </SelectItem>
                        <SelectItem value="very-active">
                          Very active (very hard exercise & physical job)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bodyFatPercentage">
                      Porcentaje de Grasa Corporal
                    </Label>
                    <Select
                      value={formData.bodyFatPercentage}
                      onValueChange={(value) =>
                        updateFormData({ bodyFatPercentage: value })
                      }
                    >
                      <SelectTrigger>
                        <div className="flex flex-row items-center gap-4">
                          <PercentSquareIcon size={18} />
                          <SelectValue placeholder="Seleccione su porcentaje de grasa corporal" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {formData.gender === "male" ? (
                          <>
                            <SelectItem value="essential">
                              Essential Fat (5%)
                            </SelectItem>
                            <SelectItem value="athletes">
                              Athletes (6-13%)
                            </SelectItem>
                            <SelectItem value="fitness">
                              Fitness (14-17%)
                            </SelectItem>
                            <SelectItem value="average">
                              Average (18-24%)
                            </SelectItem>
                            <SelectItem value="above-average">
                              Above Average (25%+)
                            </SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="essential">
                              Essential Fat (8%)
                            </SelectItem>
                            <SelectItem value="athletes">
                              Athletes (14-20%)
                            </SelectItem>
                            <SelectItem value="fitness">
                              Fitness (21-24%)
                            </SelectItem>
                            <SelectItem value="average">
                              Average (25-31%)
                            </SelectItem>
                            <SelectItem value="above-average">
                              Above Average (32%+)
                            </SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="muscleMass">
                      Massa Muscular (porcentaje)
                    </Label>
                    <Select
                      value={formData.muscleMass}
                      onValueChange={(value) =>
                        updateFormData({ muscleMass: value })
                      }
                    >
                      <SelectTrigger>
                        <div className="flex flex-row items-center gap-4">
                          <BodyPartMuscleIcon size={18} />
                          <SelectValue placeholder="Seleccione su masa muscular" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {formData.gender === "male" ? (
                          <>
                            <SelectItem value="low">Low (Below 40%)</SelectItem>
                            <SelectItem value="healthy">
                              Healthy (40-45%)
                            </SelectItem>
                            <SelectItem value="athletic">
                              Athletic (45-50%)
                            </SelectItem>
                            <SelectItem value="high">
                              High (Above 50%)
                            </SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="low">Low (Below 30%)</SelectItem>
                            <SelectItem value="healthy">
                              Healthy (30-35%)
                            </SelectItem>
                            <SelectItem value="athletic">
                              Athletic (35-40%)
                            </SelectItem>
                            <SelectItem value="high">
                              High (Above 40%)
                            </SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal">Objetivo de Salud y Fitness</Label>
                    <Select
                      value={formData.goal}
                      onValueChange={(value) => updateFormData({ goal: value })}
                    >
                      <SelectTrigger>
                        <div className="flex flex-row items-center gap-4">
                          <Target02Icon size={18} />
                          <SelectValue placeholder="Seleccione su objetivo" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lose-weight">Lose weight</SelectItem>
                        <SelectItem value="maintain">
                          Maintain weight
                        </SelectItem>
                        <SelectItem value="gain-muscle">Gain muscle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Training Frequency (days per week)</Label>
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
                          className="w-10 h-10"
                        >
                          {day.label}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredWorkoutTime">
                      Hora de Entrenamiento Preferida
                    </Label>
                    <Select
                      value={formData.preferredWorkoutTime}
                      onValueChange={(value) =>
                        updateFormData({ preferredWorkoutTime: value })
                      }
                    >
                      <SelectTrigger>
                        {/* <SelectValue placeholder="Select your preferred time" /> */}
                        <div className="flex flex-row items-center gap-4">
                          <Clock01Icon size={18} />
                          <SelectValue placeholder="Seleccione su hora preferida" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="early-morning">
                          Early morning (5-8 AM)
                        </SelectItem>
                        <SelectItem value="morning">
                          Morning (8-11 AM)
                        </SelectItem>
                        <SelectItem value="noon">Noon (11 AM-2 PM)</SelectItem>
                        <SelectItem value="afternoon">
                          Afternoon (2-5 PM)
                        </SelectItem>
                        <SelectItem value="evening">
                          Evening (5-8 PM)
                        </SelectItem>
                        <SelectItem value="night">Night (8-11 PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dietaryPreference">
                      Preferencia Dietética
                    </Label>
                    <Select
                      value={formData.dietaryPreference}
                      onValueChange={(value) =>
                        updateFormData({ dietaryPreference: value })
                      }
                    >
                      <SelectTrigger>
                        {/* <SelectValue placeholder="Select your dietary preference" /> */}
                        <div className="flex flex-row items-center gap-4">
                          <SteakIcon size={18} />
                          <SelectValue placeholder="Seleccione su preferencia dietética" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-preference">
                          No specific preference
                        </SelectItem>
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="vegan">Vegan</SelectItem>
                        <SelectItem value="pescatarian">Pescatarian</SelectItem>
                        <SelectItem value="keto">Keto</SelectItem>
                        <SelectItem value="paleo">Paleo</SelectItem>
                        <SelectItem value="mediterranean">
                          Mediterranean
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
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Anterior
            </Button>

            {currentStep < 3 ? (
              <Button onClick={handleNext}>Siguiente</Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-background text-white dark:bg-white dark:text-black border"
              >
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
