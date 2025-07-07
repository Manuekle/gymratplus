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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";
import { Icons } from "./icons";
import {
  BroccoliIcon,
  CheeseIcon,
  Dish01Icon,
  PresentationBarChart02Icon,
  Pulse01Icon,
  SmileIcon,
  Target02Icon,
  Tick02Icon,
} from "hugeicons-react";

type FormData = {
  gender: "male" | "female";
  age: number;
  weight: number;
  height: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "lose-weight" | "maintain" | "gain-muscle";
  dietaryPreference: "no-preference" | "vegetarian" | "keto";
};

export function CalorieCalculator() {
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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      gender: "male" as "male" | "female",
      age: 0,
      weight: 0,
      height: 0,
      activityLevel: "moderate" as
        | "sedentary"
        | "light"
        | "moderate"
        | "active"
        | "very_active",
      goal: "maintain" as "lose-weight" | "maintain" | "gain-muscle",
      dietaryPreference: "no-preference" as
        | "no-preference"
        | "vegetarian"
        | "keto",
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
    <SmileIcon key="user" className="h-6 w-6" />,
    <Pulse01Icon key="activity" className="h-6 w-6" />,
    <Target02Icon key="target" className="h-6 w-6" />,
    <PresentationBarChart02Icon key="results" className="h-6 w-6" />,
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-xs" size="sm" variant="outline">
          Actualizar Objetivos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold  tracking-heading">
            Calculadora de Objetivos Calóricos
          </DialogTitle>
          <DialogDescription className="text-xs">
            Actualiza tus objetivos de calorías y macronutrientes basados en tu
            información personal.
          </DialogDescription>
        </DialogHeader>

        {/* Indicador de pasos */}
        <div className="flex justify-between mb-6 px-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 ${
                  step > i + 1
                    ? "bg-green-100 text-green-600 border-2 border-green-500"
                    : step === i + 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > i + 1 ? (
                  <Tick02Icon className="h-5 w-5" />
                ) : (
                  stepIcons[i]
                )}
              </div>
              {i < totalSteps - 1 && (
                <div
                  className={`h-0.5 w-10 mt-5 ${
                    step > i + 1 ? "bg-primary" : "bg-muted"
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
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label className="text-xs md:text-sm" htmlFor="gender">
                    Género
                  </Label>
                  <RadioGroup
                    defaultValue={formValues.gender}
                    onValueChange={(value) =>
                      setValue("gender", value as "male" | "female")
                    }
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label
                        htmlFor="male"
                        className="font-normal text-xs md:text-sm"
                      >
                        Masculino
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label
                        htmlFor="female"
                        className="font-normal text-xs md:text-sm"
                      >
                        Femenino
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs md:text-sm" htmlFor="age">
                    Edad
                  </Label>
                  <Input
                    className="text-xs md:text-sm"
                    id="age"
                    type="number"
                    {...register("age", {
                      required: true,
                      min: 15,
                      max: 100,
                      valueAsNumber: true,
                    })}
                  />
                  {errors.age && (
                    <p className="text-xs text-red-500">
                      La edad debe estar entre 15 y 100 años
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs md:text-sm" htmlFor="weight">
                      Peso (kg)
                    </Label>
                    <Input
                      className="text-xs md:text-sm"
                      id="weight"
                      type="number"
                      step="0.1"
                      {...register("weight", {
                        required: true,
                        min: 30,
                        max: 300,
                        valueAsNumber: true,
                      })}
                    />
                    {errors.weight && (
                      <p className="text-xs text-red-500">
                        El peso debe estar entre 30 y 300 kg
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs md:text-sm" htmlFor="height">
                      Altura (cm)
                    </Label>
                    <Input
                      className="text-xs md:text-sm"
                      id="height"
                      type="number"
                      {...register("height", {
                        required: true,
                        min: 100,
                        max: 250,
                        valueAsNumber: true,
                      })}
                    />
                    {errors.height && (
                      <p className="text-xs text-red-500">
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
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label className="text-xs md:text-sm" htmlFor="activityLevel">
                    Nivel de Actividad
                  </Label>
                  <Select
                    defaultValue={formValues.activityLevel}
                    onValueChange={(value) =>
                      setValue(
                        "activityLevel",
                        value as
                          | "sedentary"
                          | "light"
                          | "moderate"
                          | "active"
                          | "very_active"
                      )
                    }
                  >
                    <SelectTrigger className="text-xs md:text-sm">
                      <SelectValue placeholder="Selecciona tu nivel de actividad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        className="text-xs md:text-sm"
                        value="sedentary"
                      >
                        <div className="flex flex-col">
                          <span>Sedentario</span>
                          <span className="text-xs text-muted-foreground">
                            Poco o ningún ejercicio
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem className="text-xs md:text-sm" value="light">
                        <div className="flex flex-col">
                          <span>Ligero</span>
                          <span className="text-xs text-muted-foreground">
                            Ejercicio 1-3 días/semana
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        className="text-xs md:text-sm"
                        value="moderate"
                      >
                        <div className="flex flex-col">
                          <span>Moderado</span>
                          <span className="text-xs text-muted-foreground">
                            Ejercicio 3-5 días/semana
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem className="text-xs md:text-sm" value="active">
                        <div className="flex flex-col">
                          <span>Activo</span>
                          <span className="text-xs text-muted-foreground">
                            Ejercicio intenso 6-7 días/semana
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        className="text-xs md:text-sm"
                        value="very_active"
                      >
                        <div className="flex flex-col">
                          <span>Muy activo</span>
                          <span className="text-xs text-muted-foreground">
                            Ejercicio muy intenso, trabajo físico
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs md:text-sm" htmlFor="goal">
                      Objetivo
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div
                        className={`border rounded-lg p-3 text-center cursor-pointer transition-all transform ${
                          formValues.goal === "lose-weight"
                            ? "border-zinc-200 shadow-sm dark:border-zinc-500"
                            : "border hover:border-zinc-200 dark:hover:border-zinc-500"
                        }`}
                        onClick={() => setValue("goal", "lose-weight")}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-medium">
                            Perder peso
                          </span>
                        </div>
                      </div>
                      <div
                        className={`border rounded-lg p-3 text-center cursor-pointer transition-all transform ${
                          formValues.goal === "maintain"
                            ? "border-zinc-200 shadow-sm dark:border-zinc-500"
                            : "border hover:border-zinc-200 dark:hover:border-zinc-500"
                        }`}
                        onClick={() => setValue("goal", "maintain")}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-medium">Mantener</span>
                        </div>
                      </div>
                      <div
                        className={`border rounded-lg p-3 text-center cursor-pointer transition-all transform ${
                          formValues.goal === "gain-muscle"
                            ? "border-zinc-200 shadow-sm dark:border-zinc-500"
                            : "border hover:border-zinc-200 dark:hover:border-zinc-500"
                        }`}
                        onClick={() => setValue("goal", "gain-muscle")}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-medium">
                            Ganar músculo
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      className="text-xs md:text-sm"
                      htmlFor="dietaryPreference"
                    >
                      Preferencia Dietética
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div
                        className={`border rounded-lg p-3 text-center cursor-pointer transition-all transform ${
                          formValues.dietaryPreference === "no-preference"
                            ? "border-zinc-200 shadow-sm dark:border-zinc-500"
                            : "border hover:border-zinc-200 dark:hover:border-zinc-500"
                        }`}
                        onClick={() =>
                          setValue("dietaryPreference", "no-preference")
                        }
                      >
                        <div className="flex flex-col items-center">
                          <Dish01Icon className="h-5 w-5 mb-1" />
                          <span className="text-xs font-medium">
                            Sin preferencia
                          </span>
                        </div>
                      </div>
                      <div
                        className={`border rounded-lg p-3 text-center cursor-pointer transition-all transform ${
                          formValues.dietaryPreference === "vegetarian"
                            ? "border-zinc-200 shadow-sm dark:border-zinc-500"
                            : "border hover:border-zinc-200 dark:hover:border-zinc-500"
                        }`}
                        onClick={() =>
                          setValue("dietaryPreference", "vegetarian")
                        }
                      >
                        <div className="flex flex-col items-center">
                          <BroccoliIcon className="h-5 w-5 mb-1" />
                          <span className="text-xs font-medium">
                            Vegetariano
                          </span>
                        </div>
                      </div>
                      <div
                        className={`border rounded-lg p-3 text-center cursor-pointer transition-all transform ${
                          formValues.dietaryPreference === "keto"
                            ? "border-zinc-200 shadow-sm dark:border-zinc-500"
                            : "border hover:border-zinc-200 dark:hover:border-zinc-500"
                        }`}
                        onClick={() => setValue("dietaryPreference", "keto")}
                      >
                        <div className="flex flex-col items-center">
                          <CheeseIcon className="h-5 w-5 mb-1" />
                          <span className="text-xs font-medium">Keto</span>
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
                className="space-y-4"
              >
                <div className="bg-muted p-4 rounded-lg mb-4 text-center">
                  <h3 className="text-xs font-medium tracking-heading mb-1">
                    Calorías Diarias
                  </h3>
                  <div className="text-3xl font-semibold  tracking-heading">
                    {calculatedValues.dailyCalorieTarget} kcal
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold  tracking-heading">
                    Macronutrientes
                  </h3>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium">Proteínas</span>
                      <span className="text-xs font-medium">
                        {calculatedValues.dailyProteinTarget}g
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        className="bg-black dark:bg-white w-1/2 h-2.5"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.round(
                            ((calculatedValues.dailyProteinTarget * 4) /
                              calculatedValues.dailyCalorieTarget) *
                              100
                          )}%`,
                        }}
                        transition={{ duration: 1, delay: 0.1 }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium">Carbohidratos</span>
                      <span className="text-xs font-medium">
                        {calculatedValues.dailyCarbTarget}g
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        className="bg-black dark:bg-white w-1/2 h-2.5"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.round(
                            ((calculatedValues.dailyCarbTarget * 4) /
                              calculatedValues.dailyCalorieTarget) *
                              100
                          )}%`,
                        }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium">Grasas</span>
                      <span className="text-xs font-medium">
                        {calculatedValues.dailyFatTarget}g
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        className="bg-black dark:bg-white w-1/2 h-2.5"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.round(
                            ((calculatedValues.dailyFatTarget * 9) /
                              calculatedValues.dailyCalorieTarget) *
                              100
                          )}%`,
                        }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-sm font-medium mb-2">Recomendaciones</h3>
                  <motion.ul
                    className="list-disc pl-5 space-y-1 text-xs text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <li>
                      Consume proteínas en cada comida para mantener la
                      saciedad.
                    </li>
                    <li>
                      Distribuye tus calorías a lo largo del día en 3-5 comidas.
                    </li>
                    <li>Prioriza alimentos integrales y no procesados.</li>
                    {formValues.dietaryPreference === "keto" && (
                      <li>
                        Mantén tu consumo de carbohidratos bajo para mantener la
                        cetosis.
                      </li>
                    )}
                  </motion.ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-6">
            {step > 1 && (
              <Button
                type="button"
                className="text-xs px-4"
                size="sm"
                variant="outline"
                onClick={prevStep}
                disabled={isSubmitting}
              >
                Anterior
              </Button>
            )}
            {step < 3 && (
              <Button
                size="sm"
                type="button"
                className="ml-auto text-xs px-4"
                onClick={nextStep}
              >
                Siguiente
              </Button>
            )}
            {step === 3 && (
              <Button
                size="sm"
                type="submit"
                className="ml-auto text-xs px-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Calculando..." : "Calcular"}
              </Button>
            )}
            {step === 4 && (
              <Button
                type="button"
                size="sm"
                className="ml-auto text-xs px-4"
                onClick={saveGoals}
                disabled={isSubmitting || isSaved}
              >
                {isSaved ? (
                  <>Guardado</>
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
