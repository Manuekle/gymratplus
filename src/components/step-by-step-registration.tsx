"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

import {
  UserIcon,
  Mail01Icon,
  WeightScale01Icon,
  RulerIcon,
  Activity01Icon,
  Dumbbell01Icon,
  Calendar01Icon,
  Target01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "hugeicons-react";
import { Card, CardContent } from "./ui/card";

const schema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  weight: z.number().positive("El peso debe ser positivo"),
  height: z.number().positive("La altura debe ser positiva"),
  goal: z.string().min(1, "El objetivo es requerido"),
  activityLevel: z.string().min(1, "El nivel de actividad es requerido"),
  trainingPreference: z
    .string()
    .min(1, "La preferencia de entrenamiento es requerida"),
  daysPerWeek: z.string().min(1, "Los días de entrenamiento son requeridos"),
});

type FormData = z.infer<typeof schema>;

const steps = [
  {
    title: "Información básica",
    fields: ["name", "email"],
    icon: <UserIcon size={24} color={"#eee"} />,
  },
  {
    title: "Datos físicos",
    fields: ["weight", "height"],
    icon: <RulerIcon size={24} color={"#eee"} />,
  },
  {
    title: "Objetivos",
    fields: ["goal", "activityLevel"],
    icon: <Target01Icon size={24} color={"#eee"} />,
  },
  {
    title: "Preferencias de entrenamiento",
    fields: ["trainingPreference", "daysPerWeek"],
    icon: <Dumbbell01Icon size={24} color={"#eee"} />,
  },
];

export function StepByStepRegistration() {
  const [currentStep, setCurrentStep] = useState(0);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: FormData) => {
    console.log("Formulario enviado:", data);
    // Aquí iría la lógica para enviar los datos al servidor
  };

  const renderStep = () => {
    const step = steps[currentStep];
    return (
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center space-x-2 mb-8 w-full">
          {step.icon}
          <h2 className="text-xl font-bold">{step.title}</h2>
        </div>
        {step.fields.includes("name") && (
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <div className="relative">
              {/* <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /> */}
              <UserIcon
                size={18}
                color={"#eee"}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                id="name"
                {...register("name")}
                className="pl-10"
                placeholder="Juan Pérez"
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>
        )}
        {step.fields.includes("email") && (
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="relative">
              <Mail01Icon
                size={18}
                color={"#eee"}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                id="email"
                {...register("email")}
                className="pl-10"
                placeholder="juan@ejemplo.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
        )}
        {step.fields.includes("weight") && (
          <div className="space-y-2">
            <Label htmlFor="weight">Peso (kg)</Label>
            <div className="relative">
              <WeightScale01Icon
                size={18}
                color={"#eee"}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                id="weight"
                {...register("weight")}
                className="pl-10"
                placeholder="70"
              />
            </div>
            {errors.weight && (
              <p className="text-red-500 text-sm">{errors.weight.message}</p>
            )}
          </div>
        )}
        {step.fields.includes("height") && (
          <div className="space-y-2">
            <Label htmlFor="height">Altura (cm)</Label>
            <div className="relative">
              <RulerIcon
                size={18}
                color={"#eee"}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                id="height"
                {...register("height")}
                className="pl-10"
                placeholder="175"
              />
            </div>
            {errors.height && (
              <p className="text-red-500 text-sm">{errors.height.message}</p>
            )}
          </div>
        )}
        {step.fields.includes("goal") && (
          <div className="space-y-2">
            <Label>Objetivo principal</Label>
            <RadioGroup
              onValueChange={(value) =>
                register("goal").onChange({ target: { value } })
              }
              value={watch("goal")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="loseWeight" id="loseWeight" />
                <Label htmlFor="loseWeight">Perder peso</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gainMuscle" id="gainMuscle" />
                <Label htmlFor="gainMuscle">Ganar músculo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="improveHealth" id="improveHealth" />
                <Label htmlFor="improveHealth">Mejorar salud general</Label>
              </div>
            </RadioGroup>
            {errors.goal && (
              <p className="text-red-500 text-sm">{errors.goal.message}</p>
            )}
          </div>
        )}
        {step.fields.includes("activityLevel") && (
          <div className="space-y-2">
            <Label htmlFor="activityLevel">Nivel de actividad</Label>
            <div className="relative">
              <Activity01Icon
                size={18}
                color={"#eee"}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Select
                onValueChange={(value) =>
                  register("activityLevel").onChange({ target: { value } })
                }
                value={watch("activityLevel")}
              >
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Selecciona tu nivel de actividad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentario</SelectItem>
                  <SelectItem value="lightlyActive">
                    Ligeramente activo
                  </SelectItem>
                  <SelectItem value="moderatelyActive">
                    Moderadamente activo
                  </SelectItem>
                  <SelectItem value="veryActive">Muy activo</SelectItem>
                  <SelectItem value="extraActive">
                    Extremadamente activo
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {errors.activityLevel && (
              <p className="text-red-500 text-sm">
                {errors.activityLevel.message}
              </p>
            )}
          </div>
        )}
        {step.fields.includes("trainingPreference") && (
          <div className="space-y-2">
            <Label htmlFor="trainingPreference">
              Preferencia de entrenamiento
            </Label>
            <div className="relative">
              <Dumbbell01Icon
                size={18}
                color={"#eee"}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Select
                onValueChange={(value) =>
                  register("trainingPreference").onChange({ target: { value } })
                }
                value={watch("trainingPreference")}
              >
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Selecciona tu preferencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gym">Gimnasio</SelectItem>
                  <SelectItem value="home">En casa</SelectItem>
                  <SelectItem value="outdoors">Al aire libre</SelectItem>
                  <SelectItem value="mixed">Mixto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {errors.trainingPreference && (
              <p className="text-red-500 text-sm">
                {errors.trainingPreference.message}
              </p>
            )}
          </div>
        )}
        {step.fields.includes("daysPerWeek") && (
          <div className="space-y-2">
            <Label htmlFor="daysPerWeek">
              Días de entrenamiento por semana
            </Label>
            <div className="relative">
              <Calendar01Icon
                size={18}
                color={"#eee"}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Select
                onValueChange={(value) =>
                  register("daysPerWeek").onChange({ target: { value } })
                }
                value={watch("daysPerWeek")}
              >
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Selecciona los días" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-2">1-2 días</SelectItem>
                  <SelectItem value="3-4">3-4 días</SelectItem>
                  <SelectItem value="5-6">5-6 días</SelectItem>
                  <SelectItem value="7">Todos los días</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {errors.daysPerWeek && (
              <p className="text-red-500 text-sm">
                {errors.daysPerWeek.message}
              </p>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <Card className="w-lg h-fit">
      {/* <CardHeader>
        <CardTitle className="text-center">R</CardTitle>
      </CardHeader> */}
      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
          <div className="mt-6 flex justify-between">
            <Button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              variant="outline"
            >
              <ArrowLeft01Icon className="mr-2 h-4 w-4" /> Anterior
            </Button>
            {currentStep === steps.length - 1 ? (
              <Button type="submit">Finalizar</Button>
            ) : (
              <Button type="button" onClick={nextStep}>
                Siguiente <ArrowRight01Icon className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
        <div className="mt-4 flex justify-center">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 w-2 rounded-full mx-1 ${
                index === currentStep ? "bg-primary" : "bg-gray-300"
              }`}
              initial={false}
              animate={{
                scale: index === currentStep ? 1 : 0.5,
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
