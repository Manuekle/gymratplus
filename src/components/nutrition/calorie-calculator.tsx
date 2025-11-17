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
  PresentationBarChart02Icon,
  Pulse01Icon,
  SmileIcon,
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
        ? new Date().getFullYear() - new Date(profile.birthdate).getFullYear()
        : 25,
      weight: profile?.currentWeight || 70,
      height: profile?.height || 170,
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
      const response = await fetch("/api/calories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al calcular objetivos calóricos");
      }

      const result = await response.json();
      setCalculatedValues(result);
      nextStep();
    } catch (error) {
      console.error("Error:", error);
      toast.error("No se pudieron calcular los objetivos calóricos");
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
        <Button className="text-xs" size="sm" variant="outline">
          Actualizar Objetivos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] overflow-y-auto pt-4 sm:pt-8 px-4 sm:px-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader className="pb-3 sm:pb-4">
          <DialogTitle className="text-lg sm:text-2xl font-semibold tracking-heading">
            Calculadora de Objetivos Calóricos
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Actualiza tus objetivos de calorías y macronutrientes basados en tu
            información personal.
          </DialogDescription>
        </DialogHeader>

        {/* Indicador de pasos mejorado */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 px-1 sm:px-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex items-center justify-center flex-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-300 ${
                    step > i + 1
                      ? "bg-green-500 text-white border border-green-500 shadow-sm"
                      : step === i + 1
                        ? "bg-primary text-primary-foreground border border-primary shadow-md scale-110"
                        : "bg-muted text-muted-foreground border border-muted"
                  }`}
                >
                  {step > i + 1 ? (
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                  ) : (
                    <div className="scale-75 sm:scale-100">{stepIcons[i]}</div>
                  )}
                </div>
              </div>
              {i < totalSteps - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 sm:mx-2 transition-colors duration-300 ${
                    step > i + 1 ? "bg-green-500" : "bg-muted"
                  }`}
                />
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div
                      className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-all ${
                        formValues.activityLevel === "sedentary"
                          ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                          : "border-border hover:border-primary/50 hover:bg-accent/50"
                      }`}
                      onClick={() => setValue("activityLevel", "sedentary")}
                    >
                      <div className="flex flex-col items-center gap-2 sm:gap-2.5">
                        <div
                          className={`p-2 sm:p-2.5 rounded-full ${
                            formValues.activityLevel === "sedentary"
                              ? "bg-primary-foreground/20"
                              : "bg-muted"
                          }`}
                        >
                          <HugeiconsIcon
                            icon={SmileIcon}
                            className={`h-5 w-5 sm:h-6 sm:w-6 ${
                              formValues.activityLevel === "sedentary"
                                ? "text-primary-foreground"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="text-center space-y-1">
                          <span className="text-xs font-semibold block">
                            Sedentario
                          </span>
                          <span
                            className={`text-[10px] block ${
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
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        formValues.activityLevel === "light"
                          ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                          : "border-border hover:border-primary/50 hover:bg-accent/50"
                      }`}
                      onClick={() => setValue("activityLevel", "light")}
                    >
                      <div className="flex flex-col items-center gap-2.5">
                        <div
                          className={`p-2 sm:p-2.5 rounded-full ${
                            formValues.activityLevel === "light"
                              ? "bg-primary-foreground/20"
                              : "bg-muted"
                          }`}
                        >
                          <HugeiconsIcon
                            icon={Activity01Icon}
                            className={`h-5 w-5 sm:h-6 sm:w-6 ${
                              formValues.activityLevel === "light"
                                ? "text-primary-foreground"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="text-center space-y-1">
                          <span className="text-xs font-semibold block">
                            Ligero
                          </span>
                          <span
                            className={`text-[10px] block ${
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
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        formValues.activityLevel === "moderate"
                          ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                          : "border-border hover:border-primary/50 hover:bg-accent/50"
                      }`}
                      onClick={() => setValue("activityLevel", "moderate")}
                    >
                      <div className="flex flex-col items-center gap-2.5">
                        <div
                          className={`p-2 sm:p-2.5 rounded-full ${
                            formValues.activityLevel === "moderate"
                              ? "bg-primary-foreground/20"
                              : "bg-muted"
                          }`}
                        >
                          <HugeiconsIcon
                            icon={Activity03Icon}
                            className={`h-5 w-5 sm:h-6 sm:w-6 ${
                              formValues.activityLevel === "moderate"
                                ? "text-primary-foreground"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="text-center space-y-1">
                          <span className="text-xs font-semibold block">
                            Moderado
                          </span>
                          <span
                            className={`text-[10px] block ${
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
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        formValues.activityLevel === "active"
                          ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                          : "border-border hover:border-primary/50 hover:bg-accent/50"
                      }`}
                      onClick={() => setValue("activityLevel", "active")}
                    >
                      <div className="flex flex-col items-center gap-2.5">
                        <div
                          className={`p-2 sm:p-2.5 rounded-full ${
                            formValues.activityLevel === "active"
                              ? "bg-primary-foreground/20"
                              : "bg-muted"
                          }`}
                        >
                          <HugeiconsIcon
                            icon={WorkoutRunIcon}
                            className={`h-5 w-5 sm:h-6 sm:w-6 ${
                              formValues.activityLevel === "active"
                                ? "text-primary-foreground"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="text-center space-y-1">
                          <span className="text-xs font-semibold block">
                            Activo
                          </span>
                          <span
                            className={`text-[10px] block ${
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
                          ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                          : "border-border hover:border-primary/50 hover:bg-accent/50"
                      }`}
                      onClick={() => setValue("activityLevel", "very_active")}
                    >
                      <div className="flex flex-col items-center gap-2.5">
                        <div
                          className={`p-2 sm:p-2.5 rounded-full ${
                            formValues.activityLevel === "very_active"
                              ? "bg-primary-foreground/20"
                              : "bg-muted"
                          }`}
                        >
                          <HugeiconsIcon
                            icon={WorkoutGymnasticsIcon}
                            className={`h-5 w-5 sm:h-6 sm:w-6 ${
                              formValues.activityLevel === "very_active"
                                ? "text-primary-foreground"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="text-center space-y-1">
                          <span className="text-xs font-semibold block">
                            Muy activo
                          </span>
                          <span
                            className={`text-[10px] block ${
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                      <div
                        className={`border rounded-lg p-3 sm:p-4 text-center cursor-pointer transition-all ${
                          formValues.goal === "lose-weight"
                            ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                            : "border-border hover:border-primary/50 hover:bg-accent/50"
                        }`}
                        onClick={() => setValue("goal", "lose-weight")}
                      >
                        <div className="flex flex-col items-center gap-2.5">
                          <div
                            className={`p-2 sm:p-2.5 rounded-full ${
                              formValues.goal === "lose-weight"
                                ? "bg-primary-foreground/20"
                                : "bg-muted"
                            }`}
                          >
                            <HugeiconsIcon
                              icon={Target02Icon}
                              className={`h-5 w-5 sm:h-6 sm:w-6 ${
                                formValues.goal === "lose-weight"
                                  ? "text-primary-foreground"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <div className="text-center space-y-1">
                            <span className="text-xs font-semibold block">
                              Perder peso
                            </span>
                            <span
                              className={`text-[10px] block ${
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
                        className={`border rounded-lg p-4 text-center cursor-pointer transition-all ${
                          formValues.goal === "maintain"
                            ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                            : "border-border hover:border-primary/50 hover:bg-accent/50"
                        }`}
                        onClick={() => setValue("goal", "maintain")}
                      >
                        <div className="flex flex-col items-center gap-2.5">
                          <div
                            className={`p-2 sm:p-2.5 rounded-full ${
                              formValues.goal === "maintain"
                                ? "bg-primary-foreground/20"
                                : "bg-muted"
                            }`}
                          >
                            <HugeiconsIcon
                              icon={Pulse01Icon}
                              className={`h-5 w-5 sm:h-6 sm:w-6 ${
                                formValues.goal === "maintain"
                                  ? "text-primary-foreground"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <div className="text-center space-y-1">
                            <span className="text-xs font-semibold block">
                              Mantener
                            </span>
                            <span
                              className={`text-[10px] block ${
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
                        className={`border rounded-lg p-4 text-center cursor-pointer transition-all ${
                          formValues.goal === "gain-muscle"
                            ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                            : "border-border hover:border-primary/50 hover:bg-accent/50"
                        }`}
                        onClick={() => setValue("goal", "gain-muscle")}
                      >
                        <div className="flex flex-col items-center gap-2.5">
                          <div
                            className={`p-2 sm:p-2.5 rounded-full ${
                              formValues.goal === "gain-muscle"
                                ? "bg-primary-foreground/20"
                                : "bg-muted"
                            }`}
                          >
                            <HugeiconsIcon
                              icon={PresentationBarChart02Icon}
                              className={`h-5 w-5 sm:h-6 sm:w-6 ${
                                formValues.goal === "gain-muscle"
                                  ? "text-primary-foreground"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <div className="text-center space-y-1">
                            <span className="text-xs font-semibold block">
                              Ganar músculo
                            </span>
                            <span
                              className={`text-[10px] block ${
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                      <div
                        className={`border rounded-lg p-3 sm:p-4 text-center cursor-pointer transition-all ${
                          formValues.dietaryPreference === "no-preference"
                            ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                            : "border-border hover:border-primary/50 hover:bg-accent/50"
                        }`}
                        onClick={() =>
                          setValue("dietaryPreference", "no-preference")
                        }
                      >
                        <div className="flex flex-col items-center gap-2.5">
                          <div
                            className={`p-2 sm:p-2.5 rounded-full ${
                              formValues.dietaryPreference === "no-preference"
                                ? "bg-primary-foreground/20"
                                : "bg-muted"
                            }`}
                          >
                            <HugeiconsIcon
                              icon={Dish01Icon}
                              className={`h-5 w-5 sm:h-6 sm:w-6 ${
                                formValues.dietaryPreference === "no-preference"
                                  ? "text-primary-foreground"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <div className="text-center space-y-1">
                            <span className="text-xs font-semibold block">
                              Sin preferencia
                            </span>
                            <span
                              className={`text-[10px] block ${
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
                        className={`border rounded-lg p-4 text-center cursor-pointer transition-all ${
                          formValues.dietaryPreference === "vegetarian"
                            ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                            : "border-border hover:border-primary/50 hover:bg-accent/50"
                        }`}
                        onClick={() =>
                          setValue("dietaryPreference", "vegetarian")
                        }
                      >
                        <div className="flex flex-col items-center gap-2.5">
                          <div
                            className={`p-2 sm:p-2.5 rounded-full ${
                              formValues.dietaryPreference === "vegetarian"
                                ? "bg-primary-foreground/20"
                                : "bg-muted"
                            }`}
                          >
                            <HugeiconsIcon
                              icon={BroccoliIcon}
                              className={`h-5 w-5 sm:h-6 sm:w-6 ${
                                formValues.dietaryPreference === "vegetarian"
                                  ? "text-primary-foreground"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <div className="text-center space-y-1">
                            <span className="text-xs font-semibold block">
                              Vegetariano
                            </span>
                            <span
                              className={`text-[10px] block ${
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
                        className={`border rounded-lg p-4 text-center cursor-pointer transition-all ${
                          formValues.dietaryPreference === "keto"
                            ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                            : "border-border hover:border-primary/50 hover:bg-accent/50"
                        }`}
                        onClick={() => setValue("dietaryPreference", "keto")}
                      >
                        <div className="flex flex-col items-center gap-2.5">
                          <div
                            className={`p-2 sm:p-2.5 rounded-full ${
                              formValues.dietaryPreference === "keto"
                                ? "bg-primary-foreground/20"
                                : "bg-muted"
                            }`}
                          >
                            <HugeiconsIcon
                              icon={CheeseIcon}
                              className={`h-5 w-5 sm:h-6 sm:w-6 ${
                                formValues.dietaryPreference === "keto"
                                  ? "text-primary-foreground"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <div className="text-center space-y-1">
                            <span className="text-xs font-semibold block">
                              Keto
                            </span>
                            <span
                              className={`text-[10px] block ${
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
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 sm:p-6 rounded-lg text-center">
                  <h3 className="text-xs font-medium text-muted-foreground mb-2">
                    Calorías Diarias Recomendadas
                  </h3>
                  <div className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">
                    {calculatedValues.dailyCalorieTarget}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">kcal</div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-semibold tracking-heading">
                    Macronutrientes Diarios
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="text-xs font-medium">Proteínas</span>
                        </div>
                        <span className="text-xs font-semibold">
                          {calculatedValues.dailyProteinTarget}g
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="bg-red-500 h-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.round(
                              ((calculatedValues.dailyProteinTarget * 4) /
                                calculatedValues.dailyCalorieTarget) *
                                100,
                            )}%`,
                          }}
                          transition={{ duration: 1, delay: 0.1 }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(
                          ((calculatedValues.dailyProteinTarget * 4) /
                            calculatedValues.dailyCalorieTarget) *
                            100,
                        )}
                        % de tus calorías diarias
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-xs font-medium">
                            Carbohidratos
                          </span>
                        </div>
                        <span className="text-xs font-semibold">
                          {calculatedValues.dailyCarbTarget}g
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="bg-blue-500 h-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.round(
                              ((calculatedValues.dailyCarbTarget * 4) /
                                calculatedValues.dailyCalorieTarget) *
                                100,
                            )}%`,
                          }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(
                          ((calculatedValues.dailyCarbTarget * 4) /
                            calculatedValues.dailyCalorieTarget) *
                            100,
                        )}
                        % de tus calorías diarias
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          <span className="text-xs font-medium">Grasas</span>
                        </div>
                        <span className="text-xs font-semibold">
                          {calculatedValues.dailyFatTarget}g
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="bg-yellow-500 h-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.round(
                              ((calculatedValues.dailyFatTarget * 9) /
                                calculatedValues.dailyCalorieTarget) *
                                100,
                            )}%`,
                          }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(
                          ((calculatedValues.dailyFatTarget * 9) /
                            calculatedValues.dailyCalorieTarget) *
                            100,
                        )}
                        % de tus calorías diarias
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <h3 className="text-xs font-semibold mb-3">
                    Recomendaciones
                  </h3>
                  <motion.ul
                    className="space-y-2 text-xs text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>
                        Consume proteínas en cada comida para mantener la
                        saciedad.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>
                        Distribuye tus calorías a lo largo del día en 3-5
                        comidas.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>
                        Prioriza alimentos integrales y no procesados.
                      </span>
                    </li>
                    {formValues.dietaryPreference === "keto" && (
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>
                          Mantén tu consumo de carbohidratos bajo para mantener
                          la cetosis.
                        </span>
                      </li>
                    )}
                  </motion.ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t mt-4 sm:mt-6">
            {step > 1 && (
              <Button
                type="button"
                className="text-xs"
                size="sm"
                variant="outline"
                onClick={prevStep}
                disabled={isSubmitting}
              >
                Anterior
              </Button>
            )}
            <div className="flex-1" />
            {step < 3 && (
              <Button
                size="sm"
                type="button"
                className="text-xs"
                onClick={nextStep}
              >
                Siguiente
              </Button>
            )}
            {step === 3 && (
              <Button
                size="sm"
                type="submit"
                className="text-xs"
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
                size="sm"
                className="text-xs"
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
