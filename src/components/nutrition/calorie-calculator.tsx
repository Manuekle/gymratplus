"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";

import { useSession } from "next-auth/react";

import { toast } from "sonner";
import { Icons } from "@/components/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Activity01Icon,
  Activity03Icon,
  BroccoliIcon,
  CheeseIcon,
  Dish01Icon,
  FrenchFries02Icon,
  PresentationBarChart02Icon,
  Pulse01Icon,
  RiceBowl01Icon,
  SmileIcon,
  SteakIcon,
  Target02Icon,
  Tick02Icon,
  WorkoutRunIcon,
  WorkoutGymnasticsIcon,
} from "@hugeicons/core-free-icons";

type FormData = {
  gender: "male" | "female";
  age: number;
  weight: number;
  height: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "lose-weight" | "maintain" | "gain-muscle";
  dietaryPreference: "no-preference" | "vegetarian" | "keto";
};

interface CalorieCalculatorProps {
  onGoalsUpdated?: () => void;
}

export function CalorieCalculator({ onGoalsUpdated }: CalorieCalculatorProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [calculatedValues, setCalculatedValues] = useState<{
    dailyCalorieTarget: number;
    dailyProteinTarget: number;
    dailyCarbTarget: number;
    dailyFatTarget: number;
  } | null>(null);

  const { data: session } = useSession();

  const profile = session?.user?.profile;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      gender: (profile?.gender as "male" | "female") || "male",
      age: profile?.birthdate
        ? new Date().getFullYear() -
          new Date(profile.birthdate as string).getFullYear()
        : 25,
      weight: (profile?.currentWeight as number) || 70,
      height: (profile?.height as number) || 170,
      activityLevel:
        (profile?.activityLevel as
          | "sedentary"
          | "light"
          | "moderate"
          | "active"
          | "very_active") || "moderate",
      goal:
        (profile?.goal as "lose-weight" | "maintain" | "gain-muscle") ||
        "maintain",
      dietaryPreference:
        (profile?.dietaryPreference as
          | "no-preference"
          | "vegetarian"
          | "keto") || "no-preference",
    },
  });

  const formValues = watch();

  const totalSteps = 4;

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const calculateMacros = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Validar que todos los campos requeridos estén presentes
      if (
        !data.gender ||
        !data.age ||
        !data.weight ||
        !data.height ||
        !data.activityLevel ||
        !data.goal ||
        !data.dietaryPreference
      ) {
        toast.error("Por favor completa todos los campos requeridos");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/calories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMessage = "Error al calcular objetivos calóricos";
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage =
              typeof errorData.error === "string"
                ? errorData.error
                : String(errorData.error);
          } else if (typeof errorData === "string") {
            errorMessage = errorData;
          }
        } catch {
          // Si no se puede parsear el JSON, usar el mensaje por defecto
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setCalculatedValues(result);
      nextStep();
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudieron calcular los objetivos calóricos";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveGoals = async () => {
    if (!calculatedValues) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/calories/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(calculatedValues),
      });

      if (!response.ok) {
        throw new Error("Error al guardar objetivos calóricos");
      }

      setIsSaved(true);
      toast.success("Tus objetivos calóricos han sido actualizados");

      // Call the onGoalsUpdated callback if provided
      if (onGoalsUpdated) {
        onGoalsUpdated();
      }

      setTimeout(() => {
        setIsSaved(false);
        setOpen(false);
        setStep(1);
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      toast.error("No se pudieron guardar los objetivos calóricos");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetear el paso cuando se cierra el diálogo
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(1);
        setCalculatedValues(null);
        setIsSaved(false);
      }, 300);
    }
  }, [open]);

  const stepIcons = [
    <HugeiconsIcon icon={SmileIcon} key="user" className="h-6 w-6" />,
    <HugeiconsIcon icon={Pulse01Icon} key="activity" className="h-6 w-6" />,
    <HugeiconsIcon icon={Target02Icon} key="target" className="h-6 w-6" />,
    <HugeiconsIcon
      icon={PresentationBarChart02Icon}
      key="results"
      className="h-6 w-6"
    />,
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-xs" size="default" variant="outline">
          Actualizar Objetivos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] overflow-y-auto pt-4 sm:pt-8 px-4 sm:px-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader className="pb-3 sm:pb-4">
          <DialogTitle className="text-2xl font-semibold tracking-heading">
            Calculadora de Objetivos Calóricos
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Actualiza tus objetivos de calorías y macronutrientes basados en tu
            información personal.
          </DialogDescription>
        </DialogHeader>

        {/* Indicador de pasos mejorado */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 px-0 sm:px-2 w-full">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`flex items-center ${i < totalSteps - 1 ? "flex-1" : ""}`}
            >
              <div
                className={`flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-full transition-all duration-300 flex-shrink-0 ${
                  step > i + 1 || (step === totalSteps && i === totalSteps - 1)
                    ? "bg-green-500 text-white border border-green-500 shadow-sm"
                    : step === i + 1
                      ? "bg-primary text-primary-foreground border border-primary shadow-md scale-110"
                      : "bg-muted text-muted-foreground border border-muted"
                }`}
              >
                {step > i + 1 ||
                (step === totalSteps && i === totalSteps - 1) ? (
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="h-3.5 w-3.5 sm:h-5 sm:w-5"
                  />
                ) : (
                  <div className="scale-75 sm:scale-100">{stepIcons[i]}</div>
                )}
              </div>
              {i < totalSteps - 1 && (
                <div className="flex-1 mx-2 sm:mx-4 h-0.5 bg-muted overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ease-out ${
                      step > i + 1
                        ? "bg-green-500 w-full"
                        : "bg-transparent w-0"
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(calculateMacros)}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 sm:space-y-5"
              >
                <div className="space-y-2 sm:space-y-2.5">
                  <Label className="text-xs font-medium" htmlFor="gender">
                    Género
                  </Label>
                  <RadioGroup
                    defaultValue={formValues.gender}
                    onValueChange={(value) =>
                      setValue("gender", value as "male" | "female")
                    }
                    className="flex gap-3 sm:gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label
                        htmlFor="male"
                        className="font-normal text-xs cursor-pointer"
                      >
                        Masculino
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label
                        htmlFor="female"
                        className="font-normal text-xs cursor-pointer"
                      >
                        Femenino
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-medium" htmlFor="age">
                    Edad
                  </Label>
                  <Input
                    className="h-10 text-xs"
                    id="age"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Ej: 25"
                    {...register("age", {
                      required: true,
                      min: 15,
                      max: 100,
                      valueAsNumber: true,
                    })}
                  />
                  {errors.age && (
                    <p className="text-xs text-destructive">
                      La edad debe estar entre 15 y 100 años
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2 sm:space-y-2.5">
                    <Label className="text-xs font-medium" htmlFor="weight">
                      Peso (kg)
                    </Label>
                    <Input
                      className="h-9 sm:h-10 text-xs"
                      id="weight"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Ej: 70"
                      {...register("weight", {
                        required: true,
                        min: 30,
                        max: 300,
                        valueAsNumber: true,
                      })}
                    />
                    {errors.weight && (
                      <p className="text-xs text-destructive">
                        El peso debe estar entre 30 y 300 kg
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 sm:space-y-2.5">
                    <Label className="text-xs font-medium" htmlFor="height">
                      Altura (cm)
                    </Label>
                    <Input
                      className="h-9 sm:h-10 text-xs"
                      id="height"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Ej: 170"
                      {...register("height", {
                        required: true,
                        min: 100,
                        max: 250,
                        valueAsNumber: true,
                      })}
                    />
                    {errors.height && (
                      <p className="text-xs text-destructive">
                        La altura debe estar entre 100 y 250 cm
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 sm:space-y-5"
              >
                <div className="space-y-2 sm:space-y-2.5">
                  <Label
                    className="text-xs font-medium"
                    htmlFor="activityLevel"
                  >
                    Nivel de Actividad
                  </Label>
                  <div className="grid grid-cols-3 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div
                      className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-all ${
                        formValues.activityLevel === "sedentary"
                          ? "bg-primary text-primary-foreground"
                          : "border-border hover:border-zinc-300 hover:bg-accent/50 dark:hover:border-zinc-800 shadow-sm"
                      }`}
                      onClick={() => setValue("activityLevel", "sedentary")}
                    >
                      <div className="flex flex-col items-center gap-2 sm:gap-2.5">
                        <div
                          className={`p-2 sm:p-2.5 rounded-full flex-shrink-0 ${
                            formValues.activityLevel === "sedentary"
                              ? "bg-primary-foreground/20"
                              : "bg-muted"
                          }`}
                        >
                          <HugeiconsIcon
                            icon={SmileIcon}
                            className={`h-4 w-4 sm:h-6 sm:w-6 ${
                              formValues.activityLevel === "sedentary"
                                ? "text-primary-foreground"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="text-center space-y-0.5 sm:space-y-1">
                          <span className="text-xs font-semibold block">
                            Sedentario
                          </span>
                          <span
                            className={`text-xs sm:text-xs block leading-tight ${
                              formValues.activityLevel === "sedentary"
                                ? "text-primary-foreground/80"
                                : "text-muted-foreground"
                            }`}
                          >
                            Poco o ningún ejercicio
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-all ${
                        formValues.activityLevel === "light"
                          ? "bg-primary text-primary-foreground"
                          : "border-border hover:border-zinc-300 hover:bg-accent/50 dark:hover:border-zinc-800 shadow-sm"
                      }`}
                      onClick={() => setValue("activityLevel", "light")}
                    >
                      <div className="flex flex-col items-center gap-2 sm:gap-2.5">
                        <div
                          className={`p-2 sm:p-2.5 rounded-full flex-shrink-0 ${
                            formValues.activityLevel === "light"
                              ? "bg-primary-foreground/20"
                              : "bg-muted"
                          }`}
                        >
                          <HugeiconsIcon
                            icon={Activity01Icon}
                            className={`h-4 w-4 sm:h-6 sm:w-6 ${
                              formValues.activityLevel === "light"
                                ? "text-primary-foreground"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="text-center space-y-0.5 sm:space-y-1">
                          <span className="text-xs font-semibold block">
                            Ligero
                          </span>
                          <span
                            className={`text-xs sm:text-xs block leading-tight ${
                              formValues.activityLevel === "light"
                                ? "text-primary-foreground/80"
                                : "text-muted-foreground"
                            }`}
                          >
                            Ejercicio 1-3 días/semana
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-all ${
                        formValues.activityLevel === "moderate"
                          ? "bg-primary text-primary-foreground"
                          : "border-border hover:border-zinc-300 hover:bg-accent/50 dark:hover:border-zinc-800 shadow-sm"
                      }`}
                      onClick={() => setValue("activityLevel", "moderate")}
                    >
                      <div className="flex flex-col items-center gap-2 sm:gap-2.5">
                        <div
                          className={`p-2 sm:p-2.5 rounded-full flex-shrink-0 ${
                            formValues.activityLevel === "moderate"
                              ? "bg-primary-foreground/20"
                              : "bg-muted"
                          }`}
                        >
                          <HugeiconsIcon
                            icon={Activity03Icon}
                            className={`h-4 w-4 sm:h-6 sm:w-6 ${
                              formValues.activityLevel === "moderate"
                                ? "text-primary-foreground"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="text-center space-y-0.5 sm:space-y-1">
                          <span className="text-xs font-semibold block">
                            Moderado
                          </span>
                          <span
                            className={`text-xs sm:text-xs block leading-tight ${
                              formValues.activityLevel === "moderate"
                                ? "text-primary-foreground/80"
                                : "text-muted-foreground"
                            }`}
                          >
                            Ejercicio 3-5 días/semana
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-all ${
                        formValues.activityLevel === "active"
                          ? "bg-primary text-primary-foreground"
                          : "border-border hover:border-zinc-300 hover:bg-accent/50 dark:hover:border-zinc-800 shadow-sm"
                      }`}
                      onClick={() => setValue("activityLevel", "active")}
                    >
                      <div className="flex flex-col items-center gap-2 sm:gap-2.5">
                        <div
                          className={`p-2 sm:p-2.5 rounded-full flex-shrink-0 ${
                            formValues.activityLevel === "active"
                              ? "bg-primary-foreground/20"
                              : "bg-muted"
                          }`}
                        >
                          <HugeiconsIcon
                            icon={WorkoutRunIcon}
                            className={`h-4 w-4 sm:h-6 sm:w-6 ${
                              formValues.activityLevel === "active"
                                ? "text-primary-foreground"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="text-center space-y-0.5 sm:space-y-1">
                          <span className="text-xs font-semibold block">
                            Activo
                          </span>
                          <span
                            className={`text-xs sm:text-xs block leading-tight ${
                              formValues.activityLevel === "active"
                                ? "text-primary-foreground/80"
                                : "text-muted-foreground"
                            }`}
                          >
                            Ejercicio intenso 6-7 días/semana
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-all sm:col-span-2 ${
                        formValues.activityLevel === "very_active"
                          ? "bg-primary text-primary-foreground"
                          : "border-border hover:border-zinc-300 hover:bg-accent/50 dark:hover:border-zinc-800 shadow-sm"
                      }`}
                      onClick={() => setValue("activityLevel", "very_active")}
                    >
                      <div className="flex flex-col items-center gap-2 sm:gap-2.5">
                        <div
                          className={`p-2 sm:p-2.5 rounded-full flex-shrink-0 ${
                            formValues.activityLevel === "very_active"
                              ? "bg-primary-foreground/20"
                              : "bg-muted"
                          }`}
                        >
                          <HugeiconsIcon
                            icon={WorkoutGymnasticsIcon}
                            className={`h-4 w-4 sm:h-6 sm:w-6 ${
                              formValues.activityLevel === "very_active"
                                ? "text-primary-foreground"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="text-center space-y-0.5 sm:space-y-1">
                          <span className="text-xs font-semibold block">
                            Muy activo
                          </span>
                          <span
                            className={`text-xs sm:text-xs block leading-tight ${
                              formValues.activityLevel === "very_active"
                                ? "text-primary-foreground/80"
                                : "text-muted-foreground"
                            }`}
                          >
                            Ejercicio muy intenso, trabajo físico
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 sm:space-y-5"
              >
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2 sm:space-y-2.5">
                    <Label className="text-xs font-medium" htmlFor="goal">
                      Objetivo
                    </Label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <div
                        className={`border rounded-lg p-3 sm:p-4 text-center cursor-pointer transition-all ${
                          formValues.goal === "lose-weight"
                            ? "bg-primary text-primary-foreground"
                            : "border-border hover:border-zinc-300 hover:bg-accent/50 dark:hover:border-zinc-800 shadow-sm"
                        }`}
                        onClick={() => setValue("goal", "lose-weight")}
                      >
                        <div className="flex flex-col items-center gap-2 sm:gap-2.5">
                          <div
                            className={`p-2 sm:p-2.5 rounded-full flex-shrink-0 ${
                              formValues.goal === "lose-weight"
                                ? "bg-primary-foreground/20"
                                : "bg-muted"
                            }`}
                          >
                            <HugeiconsIcon
                              icon={Target02Icon}
                              className={`h-4 w-4 sm:h-6 sm:w-6 ${
                                formValues.goal === "lose-weight"
                                  ? "text-primary-foreground"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <div className="text-center space-y-0.5 sm:space-y-1">
                            <span className="text-xs font-semibold block">
                              Perder peso
                            </span>
                            <span
                              className={`text-xs sm:text-xs block leading-tight ${
                                formValues.goal === "lose-weight"
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground"
                              }`}
                            >
                              Reducir grasa corporal
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`border rounded-lg p-3 sm:p-4 text-center cursor-pointer transition-all ${
                          formValues.goal === "maintain"
                            ? "bg-primary text-primary-foreground"
                            : "border-border hover:border-zinc-300 hover:bg-accent/50 dark:hover:border-zinc-800 shadow-sm"
                        }`}
                        onClick={() => setValue("goal", "maintain")}
                      >
                        <div className="flex flex-col items-center gap-2 sm:gap-2.5">
                          <div
                            className={`p-2 sm:p-2.5 rounded-full flex-shrink-0 ${
                              formValues.goal === "maintain"
                                ? "bg-primary-foreground/20"
                                : "bg-muted"
                            }`}
                          >
                            <HugeiconsIcon
                              icon={Pulse01Icon}
                              className={`h-4 w-4 sm:h-6 sm:w-6 ${
                                formValues.goal === "maintain"
                                  ? "text-primary-foreground"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <div className="text-center space-y-0.5 sm:space-y-1">
                            <span className="text-xs font-semibold block">
                              Mantener
                            </span>
                            <span
                              className={`text-xs sm:text-xs block leading-tight ${
                                formValues.goal === "maintain"
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground"
                              }`}
                            >
                              Mantener peso actual
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`border rounded-lg p-3 sm:p-4 text-center cursor-pointer transition-all ${
                          formValues.goal === "gain-muscle"
                            ? "bg-primary text-primary-foreground"
                            : "border-border hover:border-zinc-300 hover:bg-accent/50 dark:hover:border-zinc-800 shadow-sm"
                        }`}
                        onClick={() => setValue("goal", "gain-muscle")}
                      >
                        <div className="flex flex-col items-center gap-2 sm:gap-2.5">
                          <div
                            className={`p-2 sm:p-2.5 rounded-full flex-shrink-0 ${
                              formValues.goal === "gain-muscle"
                                ? "bg-primary-foreground/20"
                                : "bg-muted"
                            }`}
                          >
                            <HugeiconsIcon
                              icon={PresentationBarChart02Icon}
                              className={`h-4 w-4 sm:h-6 sm:w-6 ${
                                formValues.goal === "gain-muscle"
                                  ? "text-primary-foreground"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <div className="text-center space-y-0.5 sm:space-y-1">
                            <span className="text-xs font-semibold block">
                              Ganar músculo
                            </span>
                            <span
                              className={`text-xs sm:text-xs block leading-tight ${
                                formValues.goal === "gain-muscle"
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground"
                              }`}
                            >
                              Aumentar masa muscular
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-2.5">
                    <Label
                      className="text-xs font-medium"
                      htmlFor="dietaryPreference"
                    >
                      Preferencia Dietética
                    </Label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <div
                        className={`border rounded-lg p-3 sm:p-4 text-center cursor-pointer transition-all ${
                          formValues.dietaryPreference === "no-preference"
                            ? "bg-primary text-primary-foreground"
                            : "border-border hover:border-zinc-300 hover:bg-accent/50 dark:hover:border-zinc-800 shadow-sm"
                        }`}
                        onClick={() =>
                          setValue("dietaryPreference", "no-preference")
                        }
                      >
                        <div className="flex flex-col items-center gap-2 sm:gap-2.5">
                          <div
                            className={`p-2 sm:p-2.5 rounded-full flex-shrink-0 ${
                              formValues.dietaryPreference === "no-preference"
                                ? "bg-primary-foreground/20"
                                : "bg-muted"
                            }`}
                          >
                            <HugeiconsIcon
                              icon={Dish01Icon}
                              className={`h-4 w-4 sm:h-6 sm:w-6 ${
                                formValues.dietaryPreference === "no-preference"
                                  ? "text-primary-foreground"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <div className="text-center space-y-0.5 sm:space-y-1">
                            <span className="text-xs font-semibold block">
                              Sin preferencia
                            </span>
                            <span
                              className={`text-xs sm:text-xs block leading-tight ${
                                formValues.dietaryPreference === "no-preference"
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground"
                              }`}
                            >
                              Dieta equilibrada
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`border rounded-lg p-3 sm:p-4 text-center cursor-pointer transition-all ${
                          formValues.dietaryPreference === "vegetarian"
                            ? "bg-primary text-primary-foreground"
                            : "border-border hover:border-zinc-300 hover:bg-accent/50 dark:hover:border-zinc-800 shadow-sm"
                        }`}
                        onClick={() =>
                          setValue("dietaryPreference", "vegetarian")
                        }
                      >
                        <div className="flex flex-col items-center gap-2 sm:gap-2.5">
                          <div
                            className={`p-2 sm:p-2.5 rounded-full flex-shrink-0 ${
                              formValues.dietaryPreference === "vegetarian"
                                ? "bg-primary-foreground/20"
                                : "bg-muted"
                            }`}
                          >
                            <HugeiconsIcon
                              icon={BroccoliIcon}
                              className={`h-4 w-4 sm:h-6 sm:w-6 ${
                                formValues.dietaryPreference === "vegetarian"
                                  ? "text-primary-foreground"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <div className="text-center space-y-0.5 sm:space-y-1">
                            <span className="text-xs font-semibold block">
                              Vegetariano
                            </span>
                            <span
                              className={`text-xs sm:text-xs block leading-tight ${
                                formValues.dietaryPreference === "vegetarian"
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground"
                              }`}
                            >
                              Sin carne animal
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`border rounded-lg p-3 sm:p-4 text-center cursor-pointer transition-all ${
                          formValues.dietaryPreference === "keto"
                            ? "bg-primary text-primary-foreground"
                            : "border-border hover:border-zinc-300 hover:bg-accent/50 dark:hover:border-zinc-800 shadow-sm"
                        }`}
                        onClick={() => setValue("dietaryPreference", "keto")}
                      >
                        <div className="flex flex-col items-center gap-2 sm:gap-2.5">
                          <div
                            className={`p-2 sm:p-2.5 rounded-full flex-shrink-0 ${
                              formValues.dietaryPreference === "keto"
                                ? "bg-primary-foreground/20"
                                : "bg-muted"
                            }`}
                          >
                            <HugeiconsIcon
                              icon={CheeseIcon}
                              className={`h-4 w-4 sm:h-6 sm:w-6 ${
                                formValues.dietaryPreference === "keto"
                                  ? "text-primary-foreground"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <div className="text-center space-y-0.5 sm:space-y-1">
                            <span className="text-xs font-semibold block">
                              Keto
                            </span>
                            <span
                              className={`text-xs sm:text-xs block leading-tight ${
                                formValues.dietaryPreference === "keto"
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground"
                              }`}
                            >
                              Bajo en carbohidratos
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && calculatedValues && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 sm:space-y-5"
              >
                <div className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-700 dark:to-zinc-800 border border-border p-4 sm:p-6 rounded-lg text-center">
                  <h3 className="text-xs font-medium text-muted-foreground dark:text-white mb-2">
                    Calorías Diarias Recomendadas
                  </h3>
                  <div className="text-4xl font-bold tracking-heading text-foreground dark:text-white">
                    {calculatedValues.dailyCalorieTarget}
                  </div>
                  <div className="text-xs text-muted-foreground dark:text-white/80 mt-1">
                    kcal
                  </div>
                </div>

                <div className="md:hidden max-h-[50vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-lg font-semibold tracking-heading">
                      Macronutrientes Diarios
                    </h3>

                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      {/* Proteínas */}
                      <Card className="bg-gradient-to-br from-pink-50 to-white dark:from-pink-900 dark:to-zinc-800">
                        <CardContent className="px-2 sm:px-4 py-2 sm:py-3">
                          <div className="flex flex-col items-center text-center gap-1.5 sm:flex-row sm:items-center sm:gap-3 sm:text-left">
                            <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-pink-100 dark:bg-pink-800 flex items-center justify-center flex-shrink-0">
                              <HugeiconsIcon
                                icon={SteakIcon}
                                className="h-4 w-4 sm:h-6 sm:w-6 text-pink-600 dark:text-pink-300"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h1 className="text-xs sm:text-xs text-muted-foreground truncate">
                                Proteínas
                              </h1>
                              <h2 className="text-xs sm:text-md font-medium">
                                {calculatedValues.dailyProteinTarget}g
                              </h2>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Carbohidratos */}
                      <Card className="bg-gradient-to-br from-sky-50 to-white dark:from-sky-900 dark:to-zinc-800">
                        <CardContent className="px-2 sm:px-4 py-2 sm:py-3">
                          <div className="flex flex-col items-center text-center gap-1.5 sm:flex-row sm:items-center sm:gap-3 sm:text-left">
                            <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-sky-100 dark:bg-sky-800 flex items-center justify-center flex-shrink-0">
                              <HugeiconsIcon
                                icon={RiceBowl01Icon}
                                className="h-4 w-4 sm:h-6 sm:w-6 text-sky-600 dark:text-sky-300"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h1 className="text-xs sm:text-xs text-muted-foreground truncate">
                                Carbohidratos
                              </h1>
                              <h2 className="text-xs sm:text-md font-medium">
                                {calculatedValues.dailyCarbTarget}g
                              </h2>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Grasas */}
                      <Card className="bg-gradient-to-br from-amber-100 to-white dark:from-amber-900 dark:to-zinc-800">
                        <CardContent className="px-2 sm:px-4 py-2 sm:py-3">
                          <div className="flex flex-col items-center text-center gap-1.5 sm:flex-row sm:items-center sm:gap-3 sm:text-left">
                            <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center flex-shrink-0">
                              <HugeiconsIcon
                                icon={FrenchFries02Icon}
                                className="h-4 w-4 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-300"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h1 className="text-xs sm:text-xs text-muted-foreground truncate">
                                Grasas
                              </h1>
                              <h2 className="text-xs sm:text-md font-medium">
                                {calculatedValues.dailyFatTarget}g
                              </h2>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="pt-3 sm:pt-4 border-t mt-3">
                    <h3 className="text-lg font-semibold mb-3 tracking-heading">
                      Recomendaciones
                    </h3>
                    <motion.ul
                      className="space-y-2 text-xs sm:text-xs text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5 flex-shrink-0">
                          •
                        </span>
                        <span>
                          Consume proteínas en cada comida para mantener la
                          saciedad.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5 flex-shrink-0">
                          •
                        </span>
                        <span>
                          Distribuye tus calorías a lo largo del día en 3-5
                          comidas.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5 flex-shrink-0">
                          •
                        </span>
                        <span>
                          Prioriza alimentos integrales y no procesados.
                        </span>
                      </li>
                      {formValues.dietaryPreference === "keto" && (
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5 flex-shrink-0">
                            •
                          </span>
                          <span>
                            Mantén tu consumo de carbohidratos bajo para
                            mantener la cetosis.
                          </span>
                        </li>
                      )}
                    </motion.ul>
                  </div>
                </div>

                {/* Desktop version - no scroll */}
                <div className="hidden md:block">
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-lg font-semibold tracking-heading">
                      Macronutrientes Diarios
                    </h3>

                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      {/* Proteínas */}
                      <Card className="bg-gradient-to-br from-pink-50 to-white dark:from-pink-900 dark:to-zinc-800">
                        <CardContent className="px-2 sm:px-4 py-2 sm:py-3">
                          <div className="flex flex-col items-center text-center gap-1.5 sm:flex-row sm:items-center sm:gap-3 sm:text-left">
                            <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-pink-100 dark:bg-pink-800 flex items-center justify-center flex-shrink-0">
                              <HugeiconsIcon
                                icon={SteakIcon}
                                className="h-4 w-4 sm:h-6 sm:w-6 text-pink-600 dark:text-pink-300"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h1 className="text-xs sm:text-xs text-muted-foreground truncate">
                                Proteínas
                              </h1>
                              <h2 className="text-xs sm:text-md font-medium">
                                {calculatedValues.dailyProteinTarget}g
                              </h2>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Carbohidratos */}
                      <Card className="bg-gradient-to-br from-sky-50 to-white dark:from-sky-900 dark:to-zinc-800">
                        <CardContent className="px-2 sm:px-4 py-2 sm:py-3">
                          <div className="flex flex-col items-center text-center gap-1.5 sm:flex-row sm:items-center sm:gap-3 sm:text-left">
                            <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-sky-100 dark:bg-sky-800 flex items-center justify-center flex-shrink-0">
                              <HugeiconsIcon
                                icon={RiceBowl01Icon}
                                className="h-4 w-4 sm:h-6 sm:w-6 text-sky-600 dark:text-sky-300"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h1 className="text-xs sm:text-xs text-muted-foreground truncate">
                                Carbohidratos
                              </h1>
                              <h2 className="text-xs sm:text-md font-medium">
                                {calculatedValues.dailyCarbTarget}g
                              </h2>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Grasas */}
                      <Card className="bg-gradient-to-br from-amber-100 to-white dark:from-amber-900 dark:to-zinc-800">
                        <CardContent className="px-2 sm:px-4 py-2 sm:py-3">
                          <div className="flex flex-col items-center text-center gap-1.5 sm:flex-row sm:items-center sm:gap-3 sm:text-left">
                            <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center flex-shrink-0">
                              <HugeiconsIcon
                                icon={FrenchFries02Icon}
                                className="h-4 w-4 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-300"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h1 className="text-xs sm:text-xs text-muted-foreground truncate">
                                Grasas
                              </h1>
                              <h2 className="text-xs sm:text-md font-medium">
                                {calculatedValues.dailyFatTarget}g
                              </h2>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="pt-3 sm:pt-4 border-t">
                    <h3 className="text-lg font-semibold mb-3 tracking-heading">
                      Recomendaciones
                    </h3>
                    <motion.ul
                      className="space-y-2 text-xs sm:text-xs text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5 flex-shrink-0">
                          •
                        </span>
                        <span>
                          Consume proteínas en cada comida para mantener la
                          saciedad.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5 flex-shrink-0">
                          •
                        </span>
                        <span>
                          Distribuye tus calorías a lo largo del día en 3-5
                          comidas.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5 flex-shrink-0">
                          •
                        </span>
                        <span>
                          Prioriza alimentos integrales y no procesados.
                        </span>
                      </li>
                      {formValues.dietaryPreference === "keto" && (
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5 flex-shrink-0">
                            •
                          </span>
                          <span>
                            Mantén tu consumo de carbohidratos bajo para
                            mantener la cetosis.
                          </span>
                        </li>
                      )}
                    </motion.ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t mt-4 sm:mt-6">
            {step > 1 && (
              <Button
                type="button"
                className="text-xs w-full sm:w-auto order-2 sm:order-1"
                size="default"
                variant="outline"
                onClick={prevStep}
                disabled={isSubmitting}
              >
                Anterior
              </Button>
            )}
            <div className="flex-1 hidden sm:block" />
            {step < 3 && (
              <Button
                size="default"
                type="button"
                className="text-xs w-full sm:w-auto order-1 sm:order-2"
                onClick={nextStep}
              >
                Siguiente
              </Button>
            )}
            {step === 3 && (
              <Button
                size="default"
                type="submit"
                className="text-xs w-full sm:w-auto order-1 sm:order-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  "Calcular"
                )}
              </Button>
            )}
            {step === 4 && (
              <Button
                type="button"
                size="default"
                className="text-xs w-full sm:w-auto order-1 sm:order-2"
                onClick={saveGoals}
                disabled={isSubmitting || isSaved}
              >
                {isSaved ? (
                  <>
                    <HugeiconsIcon icon={Tick02Icon} className="mr-2 h-4 w-4" />
                    Guardado
                  </>
                ) : (
                  <>
                    {isSubmitting ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Guardando
                      </>
                    ) : (
                      "Guardar Objetivos"
                    )}
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
