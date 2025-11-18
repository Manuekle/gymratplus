"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

type PlanType = "alumno" | "instructor-monthly" | "instructor-yearly" | null;

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = status === "authenticated" && !!session;

  const handlePlanSelect = (plan: PlanType) => {
    setSelectedPlan(plan);

    // Si es plan Alumno (gratis), redirigir directamente a iniciar sesión
    if (plan === "alumno") {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/auth/signin?redirect=/dashboard");
      }
      return;
    }

    // Si es plan de pago (Instructor mensual o anual)
    // Si ya está autenticado, ir directo a la pasarela
    if (isAuthenticated) {
      router.push("/dashboard/profile/payment");
      return;
    }

    // Si no está autenticado, mostrar diálogo preguntando si tiene cuenta
    setShowDialog(true);
  };

  const handleDialogAction = (hasAccount: boolean) => {
    setIsLoading(true);
    setShowDialog(false);

    if (!selectedPlan) {
      setIsLoading(false);
      return;
    }

    // Pequeño delay para feedback visual
    setTimeout(() => {
      if (hasAccount) {
        // Si tiene cuenta, redirigir a iniciar sesión y luego a la pasarela
        router.push(
          `/auth/signin?redirect=/dashboard/profile/payment&plan=${selectedPlan}`,
        );
      } else {
        // Si no tiene cuenta, redirigir a registro y luego a la pasarela
        router.push(
          `/auth/signup?redirect=/dashboard/profile/payment&plan=${selectedPlan}`,
        );
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-5 md:px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-heading mb-3">
            Precios simples
          </h1>
          <p className="text-muted-foreground text-xs md:text-xs">
            Elige el plan que se adapte a ti
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {/* Plan Alumno */}
          <Card className="relative flex flex-col shadow-md dark:shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-visible">
            <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-green-600 text-white px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-semibold shadow-lg">
                Gratis
              </div>
            </div>
            <CardContent className="p-6 md:p-8 flex flex-col flex-1 pt-10 md:pt-12">
              <div className="text-center mb-6 md:mb-8">
                <h3 className="text-xl md:text-2xl font-semibold tracking-heading mb-2 md:mb-3">
                  Alumno
                </h3>
                <div className="mb-2">
                  <span className="text-4xl md:text-5xl font-bold tracking-tight">
                    $0
                  </span>
                </div>
                <p className="text-[11px] md:text-xs text-muted-foreground mt-2">
                  Perfecto para empezar tu journey fitness
                </p>
              </div>
              <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1">
                <li className="flex items-start gap-2 md:gap-3">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-[11px] md:text-xs leading-relaxed">
                    Planes de entrenamiento básicos
                  </span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-[11px] md:text-xs leading-relaxed">
                    Seguimiento de progreso
                  </span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-[11px] md:text-xs leading-relaxed">
                    Acceso a la comunidad
                  </span>
                </li>
              </ul>
              <Button
                variant="default"
                className="w-full text-[11px] md:text-xs py-2.5 md:py-3 text-white bg-green-600 hover:bg-green-700 transition-colors shadow-lg"
                onClick={() => handlePlanSelect("alumno")}
                disabled={isLoading}
              >
                {isAuthenticated ? "Ir al Dashboard" : "Comenzar gratis"}
              </Button>
            </CardContent>
          </Card>

          {/* Plan Instructor Mensual */}
          <Card className="relative flex flex-col shadow-xl dark:shadow-2xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 overflow-visible md:scale-105 z-10">
            <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-black dark:bg-white text-white dark:text-black px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-semibold shadow-lg">
                Más popular
              </div>
            </div>
            <CardContent className="p-6 md:p-8 flex flex-col flex-1 pt-10 md:pt-12">
              <div className="text-center mb-6 md:mb-8">
                <h3 className="text-xl md:text-2xl font-semibold tracking-heading mb-2 md:mb-3">
                  Instructor
                </h3>
                <div className="mb-2">
                  <span className="text-4xl md:text-5xl font-bold tracking-tight">
                    $5
                  </span>
                  <span className="text-lg md:text-xl text-muted-foreground font-normal ml-1">
                    /mes
                  </span>
                </div>
                <p className="text-[11px] md:text-xs text-muted-foreground mt-2">
                  Para entrenadores profesionales
                </p>
              </div>
              <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1">
                <li className="flex items-start gap-2 md:gap-3">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 md:w-5 md:h-5 text-black dark:text-white flex-shrink-0 mt-0.5"
                  />
                  <span className="text-[11px] md:text-xs leading-relaxed">
                    Todo lo del plan Alumno
                  </span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 md:w-5 md:h-5 text-black dark:text-white flex-shrink-0 mt-0.5"
                  />
                  <span className="text-[11px] md:text-xs leading-relaxed">
                    Gestión de clientes
                  </span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 md:w-5 md:h-5 text-black dark:text-white flex-shrink-0 mt-0.5"
                  />
                  <span className="text-[11px] md:text-xs leading-relaxed">
                    Creación de entrenamientos personalizados
                  </span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 md:w-5 md:h-5 text-black dark:text-white flex-shrink-0 mt-0.5"
                  />
                  <span className="text-[11px] md:text-xs leading-relaxed">
                    Dashboard de analíticas avanzadas
                  </span>
                </li>
              </ul>
              <Button
                className="w-full text-[11px] md:text-xs py-2.5 md:py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-lg"
                onClick={() => handlePlanSelect("instructor-monthly")}
                disabled={isLoading}
              >
                {isAuthenticated ? "Ir a la pasarela" : "Prueba gratis 14 días"}
              </Button>
            </CardContent>
          </Card>

          {/* Plan Instructor Anual */}
          <Card className="relative flex flex-col shadow-md dark:shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-visible">
            <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-sky-600 text-white px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-semibold shadow-lg">
                Ahorra 18%
              </div>
            </div>
            <CardContent className="p-6 md:p-8 flex flex-col flex-1 pt-10 md:pt-12">
              <div className="text-center mb-6 md:mb-8">
                <h3 className="text-xl md:text-2xl font-semibold tracking-heading mb-2 md:mb-3">
                  Instructor Anual
                </h3>
                <div className="mb-2">
                  <span className="text-4xl md:text-5xl font-bold tracking-tight">
                    $49
                  </span>
                  <span className="text-lg md:text-xl text-muted-foreground font-normal ml-1">
                    /año
                  </span>
                </div>
                <p className="text-[11px] md:text-xs text-muted-foreground mt-2">
                  Paga una vez y olvídate todo el año
                </p>
              </div>
              <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1">
                <li className="flex items-start gap-2 md:gap-3">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 md:w-5 md:h-5 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-[11px] md:text-xs leading-relaxed">
                    Todo lo del plan Instructor
                  </span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 md:w-5 md:h-5 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-[11px] md:text-xs leading-relaxed">
                    Soporte prioritario
                  </span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 md:w-5 md:h-5 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-[11px] md:text-xs leading-relaxed">
                    Acceso anticipado a nuevas funciones
                  </span>
                </li>
              </ul>
              <Button
                variant="default"
                className="w-full text-[11px] md:text-xs py-2.5 md:py-3 text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-lg"
                onClick={() => handlePlanSelect("instructor-yearly")}
                disabled={isLoading}
              >
                {isAuthenticated ? "Ir a la pasarela" : "Elegir anual"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog para preguntar si tiene cuenta */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-semibold">
              ¿Ya tienes una cuenta?
            </DialogTitle>
            <DialogDescription className="text-xs md:text-xs pt-2 leading-relaxed">
              Para continuar con el plan de Instructor, necesitamos saber si ya
              tienes una cuenta en GymRat+. Esto nos ayudará a redirigirte al
              lugar correcto.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
              <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
                <HugeiconsIcon
                  icon={Tick02Icon}
                  className="w-5 h-5 text-white dark:text-black"
                />
              </div>
              <div className="flex-1">
                <p className="text-xs md:text-xs font-medium">
                  Plan seleccionado:{" "}
                  {selectedPlan === "instructor-monthly"
                    ? "Instructor Mensual ($5/mes)"
                    : "Instructor Anual ($49/año)"}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => handleDialogAction(false)}
              disabled={isLoading}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              {isLoading ? "Cargando..." : "No, crear cuenta"}
            </Button>
            <Button
              onClick={() => handleDialogAction(true)}
              disabled={isLoading}
              className="w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100 order-1 sm:order-2"
            >
              {isLoading ? "Cargando..." : "Sí, tengo cuenta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
