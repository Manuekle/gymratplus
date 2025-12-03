"use client";

import { useEffect, useState } from "react";
import { CustomSonner } from "@/components/custom-sonner";
import Recommendations from "@/components/recommendations";
import { ThemeToggle } from "@/components/layout/theme/theme-toggle";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RecommendationsPage() {
  const router = useRouter();
  const [hasExistingData, setHasExistingData] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const profileFormData = localStorage.getItem("profileFormData");

    if (!profileFormData) {
      router.push("/onboarding");
      return;
    }

    // Verificar si el usuario ya tiene entrenamiento y plan nutricional
    const checkExistingData = async () => {
      try {
        setIsChecking(true);

        // Verificar entrenamientos
        const workoutsResponse = await fetch("/api/workouts");
        const workoutsData = workoutsResponse.ok
          ? await workoutsResponse.json()
          : [];
        const hasWorkouts =
          Array.isArray(workoutsData) && workoutsData.length > 0;

        // Verificar planes nutricionales
        const foodPlansResponse = await fetch("/api/food-recommendations");
        const foodPlansData = foodPlansResponse.ok
          ? await foodPlansResponse.json()
          : [];
        const hasFoodPlans =
          Array.isArray(foodPlansData) && foodPlansData.length > 0;

        const hasData = hasWorkouts || hasFoodPlans;
        setHasExistingData(hasData);
      } catch (error) {
        console.error("Error checking existing data:", error);
        setHasExistingData(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkExistingData();
  }, [router]);

  // Iniciar countdown si ya tiene datos
  useEffect(() => {
    if (hasExistingData) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [hasExistingData]);

  // Redirigir cuando el countdown llegue a 0
  useEffect(() => {
    if (countdown === 0 && hasExistingData) {
      router.push("/dashboard");
    }
  }, [countdown, hasExistingData, router]);

  // Si está verificando, mostrar loading
  if (isChecking) {
    return (
      <main className="flex justify-center items-center min-h-screen p-8 relative">
        <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-2xl text-center">
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-6">
              <Loader2 className="h-8 w-8 animate-spin text-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Verificando
            </h1>
            <p className="text-xs text-muted-foreground">
              Estamos revisando tus planes existentes...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Si ya tiene datos, mostrar mensaje y countdown
  if (hasExistingData) {
    return (
      <main className="flex justify-center items-center min-h-screen p-8 relative">
        <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-2xl text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-6">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Todo listo
            </h1>
            <p className="text-xs text-muted-foreground mb-8">
              Ya tienes planes de entrenamiento y nutrición en tu cuenta.
            </p>
          </div>
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs text-muted-foreground">
                Redirigiendo en{" "}
                <span className="font-semibold text-foreground">
                  {countdown}
                </span>{" "}
                segundo
                {countdown !== 1 ? "s" : ""}
              </p>
            </div>
            <div>
              <Button
                variant="ghost"
                size="default"
                onClick={() => router.push("/dashboard")}
                className="text-xs font-medium text-foreground hover:text-primary transition-colors underline underline-offset-4"
              >
                Ir al dashboard ahora
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Si no tiene datos, mostrar el componente de recomendaciones para generarlos
  return (
    <main className="flex justify-center items-start min-h-screen p-8 pt-16 relative">
      <CustomSonner position="top-center" />
      <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-6xl">
        <Recommendations />
      </div>
    </main>
  );
}
