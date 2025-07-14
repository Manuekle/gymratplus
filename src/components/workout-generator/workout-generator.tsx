"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StepGoal } from "./steps/step-goal";
import { StepSplit } from "./steps/step-split";
import { StepMethodology } from "./steps/step-methodology";
import { StepFrequency } from "./steps/step-frequency";
import { StepName } from "./steps/step-name";
import { StepResults } from "./steps/step-results";
import { Workout } from "@/types/workout-types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Icons } from "../icons";
import { WorkoutPersonalize } from "../workouts/workout-personalize";

export type FormData = {
  goal: string;
  splitType: string;
  methodology: string;
  trainingFrequency: number;
  name: string;
};

export function WorkoutGenerator() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    goal: "",
    splitType: "",
    methodology: "",
    trainingFrequency: 3,
    name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [workoutResult, setWorkoutResult] = useState<Workout | null>(null);

  const totalSteps = 5;

  const updateFormData = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/custom-workout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create workout");
      }

      const result = await response.json();
      setWorkoutResult(result);
      setStep(totalSteps + 1); // Move to results step
    } catch (error) {
      console.error("Error creating workout:", error);
      toast.error("Error", {
        description: "No se pudo crear el entrenamiento. Inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return !!formData.goal;
      case 2:
        return !!formData.splitType;
      case 3:
        return !!formData.methodology;
      case 4:
        return (
          formData.trainingFrequency >= 1 && formData.trainingFrequency <= 7
        );
      case 5:
        return !!formData.name;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepGoal
            value={formData.goal}
            onChange={(value) => updateFormData("goal", value)}
          />
        );
      case 2:
        return (
          <StepSplit
            value={formData.splitType}
            onChange={(value) => updateFormData("splitType", value)}
          />
        );
      case 3:
        return (
          <StepMethodology
            value={formData.methodology}
            onChange={(value) => updateFormData("methodology", value)}
          />
        );
      case 4:
        return (
          <StepFrequency
            value={formData.trainingFrequency}
            onChange={(value) => updateFormData("trainingFrequency", value)}
          />
        );
      case 5:
        return (
          <StepName
            value={formData.name}
            onChange={(value) => updateFormData("name", value)}
          />
        );
      case 6:
        return <StepResults workout={workoutResult!} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {step <= totalSteps && (
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-medium">
              Paso {step} de {totalSteps}
            </span>
            <span className="text-xs text-muted-foreground">
              {Math.round((step / totalSteps) * 100)}% completado
            </span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-in-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}
      <div className="flex flex-row gap-2">
        <Dialog>
          <DialogTrigger asChild className="mb-8">
            <Button className="text-xs" size="sm">
              Generar rutina
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm max-h-[900px] overflow-y-auto pt-12 xl:pt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div>{renderStep()}</div>
              </motion.div>
            </AnimatePresence>
            <DialogFooter>
              {step <= totalSteps && (
                <div className="flex justify-between mt-6 w-full">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={step === 1}
                    className="text-xs px-4"
                    size="sm"
                  >
                    Anterior
                  </Button>

                  {step < totalSteps ? (
                    <Button
                      onClick={nextStep}
                      disabled={!isStepValid()}
                      className="text-xs px-4"
                      size="sm"
                    >
                      Siguiente
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={!isStepValid() || isSubmitting}
                      className="text-xs px-4"
                      size="sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Icons.spinner className="h-2 w-2 animate-spin" />
                          Generando rutina
                        </>
                      ) : (
                        <>Generar rutina</>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <WorkoutPersonalize />
      </div>
    </div>
  );
}
