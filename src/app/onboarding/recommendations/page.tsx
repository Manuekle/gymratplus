"use client";

import { useEffect, useState } from "react";
import { CustomSonner } from "@/components/custom-sonner";
import Recommendations from "@/components/recommendations";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

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

        // Si ya tiene datos, iniciar countdown para redirigir
        if (hasData) {
          const interval = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                router.push("/dashboard");
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error("Error checking existing data:", error);
        setHasExistingData(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkExistingData();
  }, [router]);

  // Si está verificando, mostrar loading
  if (isChecking) {
    return (
      <main className="w-full max-w-4xl mx-auto mt-6 p-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-xs text-muted-foreground">
              Verificando tus planes existentes...
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Si ya tiene datos, mostrar mensaje y countdown
  if (hasExistingData) {
    return (
      <main className="w-full max-w-4xl mx-auto mt-6 p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold tracking-heading">
              Ya tienes planes creados
            </CardTitle>
            <CardDescription>
              Ya tienes entrenamientos y/o planes nutricionales en tu cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Serás redirigido al dashboard en {countdown} segundo
              {countdown !== 1 ? "s" : ""}...
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-xs text-primary hover:underline"
            >
              Ir al dashboard ahora
            </button>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Si no tiene datos, mostrar el componente de recomendaciones para generarlos
  return (
    <main className="w-full max-w-4xl mx-auto mt-6 p-4">
      <CustomSonner position="top-center" />

      <Recommendations />
    </main>
  );
}
