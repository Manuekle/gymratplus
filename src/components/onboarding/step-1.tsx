"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
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
import { useRouter } from "next/navigation";

const heightOptions = Array.from({ length: 81 }, (_, i) =>
  (i + 140).toString()
); // 140cm to 220cm
const weightOptions = Array.from({ length: 141 }, (_, i) =>
  (i + 40).toString()
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
      })
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
      // Crear una copia del formData para enviar
      const dataToSend = { ...formData };

      // Eliminar completamente la propiedad birthdate si no es válida
      if (dataToSend.birthdate) {
        if (
          dataToSend.birthdate instanceof Date &&
          !isNaN(dataToSend.birthdate.getTime())
        ) {
          // Si es un objeto Date válido, convertirlo a string ISO
          dataToSend.birthdate = dataToSend.birthdate.toISOString();
        } else {
          // Si no es un objeto Date válido, intentar convertirlo
          try {
            const dateObj = new Date(dataToSend.birthdate);
            if (!isNaN(dateObj.getTime())) {
              dataToSend.birthdate = dateObj.toISOString();
            } else {
              // Si la conversión falla, enviar como string o eliminar
              console.warn(
                "Invalid date detected, sending as is:",
                dataToSend.birthdate
              );
            }
          } catch (e) {
            console.error("Error converting birthdate:", e);
            // Si hay un error en la conversión, eliminar la propiedad
            delete dataToSend.birthdate;
          }
        }
      }

      console.log("Sending data:", dataToSend);

      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit profile data");
      }

      const updatedProfile = await response.json();
      console.log("Updated profile:", updatedProfile);

      toast.success("Profile saved successfully!", {
        description: "Your profile information has been updated.",
      });

      // Redirigir a la página de recomendaciones después de guardar el perfil
      router.push("/recommendations");
    } catch (error) {
      console.error("Error submitting profile:", error);
      toast.error("Failed to save profile", {
        description:
          "Please try again. If the problem persists, contact support.",
      });
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
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        updateFormData({ gender: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthdate">Date of Birth</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.birthdate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.birthdate ? (
                            format(formData.birthdate, "PPP")
                          ) : (
                            <span>Pick a date</span>
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
                    <Label htmlFor="height">Height (cm)</Label>
                    <Select
                      value={formData.height}
                      onValueChange={(value) =>
                        updateFormData({ height: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your height" />
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
                    <Label htmlFor="currentWeight">Current Weight (kg)</Label>
                    <Select
                      value={formData.currentWeight}
                      onValueChange={(value) =>
                        updateFormData({ currentWeight: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your current weight" />
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
                    <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                    <Select
                      value={formData.targetWeight}
                      onValueChange={(value) =>
                        updateFormData({ targetWeight: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your target weight" />
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
                    <Label htmlFor="activityLevel">Activity Level</Label>
                    <Select
                      value={formData.activityLevel}
                      onValueChange={(value) =>
                        updateFormData({ activityLevel: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your activity level" />
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
                      Body Fat Percentage
                    </Label>
                    <Select
                      value={formData.bodyFatPercentage}
                      onValueChange={(value) =>
                        updateFormData({ bodyFatPercentage: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your body fat percentage" />
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
                    <Label htmlFor="muscleMass">Muscle Mass</Label>
                    <Select
                      value={formData.muscleMass}
                      onValueChange={(value) =>
                        updateFormData({ muscleMass: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your muscle mass" />
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
                    <Label htmlFor="goal">Goal</Label>
                    <Select
                      value={formData.goal}
                      onValueChange={(value) => updateFormData({ goal: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your goal" />
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
                    <Label htmlFor="dailyActivity">Daily Activity</Label>
                    <Select
                      value={formData.dailyActivity}
                      onValueChange={(value) =>
                        updateFormData({ dailyActivity: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your daily activity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="office-work">
                          Office work (sedentary)
                        </SelectItem>
                        <SelectItem value="light-physical">
                          Light physical work
                        </SelectItem>
                        <SelectItem value="moderate-physical">
                          Moderate physical work
                        </SelectItem>
                        <SelectItem value="heavy-physical">
                          Heavy physical work
                        </SelectItem>
                        <SelectItem value="very-heavy-physical">
                          Very heavy physical work
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Training Frequency (days per week)</Label>
                    <ToggleGroup
                      type="multiple"
                      variant="outline"
                      value={Array.from(
                        { length: formData.trainingFrequency },
                        (_, i) => i.toString()
                      )}
                      onValueChange={(value) =>
                        updateFormData({ trainingFrequency: value.length })
                      }
                      className="justify-start"
                    >
                      {daysOfWeek.map((day, index) => (
                        <ToggleGroupItem
                          key={day.id}
                          value={index.toString()}
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
                      Preferred Workout Time
                    </Label>
                    <Select
                      value={formData.preferredWorkoutTime}
                      onValueChange={(value) =>
                        updateFormData({ preferredWorkoutTime: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your preferred time" />
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
                      Dietary Preference
                    </Label>
                    <Select
                      value={formData.dietaryPreference}
                      onValueChange={(value) =>
                        updateFormData({ dietaryPreference: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your dietary preference" />
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
              Previous
            </Button>

            {currentStep < 3 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
