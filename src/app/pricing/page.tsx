"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold tracking-heading mb-3">
            Precios simples
          </h1>
          <p className="text-muted-foreground text-xs">
            Elige el plan que se adapte a ti
          </p>
        </div>

        <div className="grid md:grid-cols-3 xl:gap-6 gap-8 max-w-7xl mx-auto">
          {/* Plan Alumno */}
          <Card className="relative flex flex-col shadow-sm dark:shadow-md transition-all duration-200 hover:shadow-lg hover:bg-gradient-to-br hover:from-zinc-100/90 hover:to-zinc-200/90 dark:hover:from-zinc-900/90 dark:hover:to-zinc-800/90 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm border px-4 py-3 min-h-[240px] overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-zinc-50/50 to-zinc-100/50 dark:from-zinc-900/50 dark:to-zinc-800/50" />
            <CardContent className="px-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold tracking-heading mb-2">
                  Alumno
                </h3>
                <div className="text-3xl font-semibold tracking-heading mb-1">
                  Gratis
                </div>
                <p className="text-muted-foreground text-xs">
                  Perfecto para empezar tu journey fitness
                </p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-xs">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 mr-3 text-foreground flex-shrink-0"
                  />
                  <span>Planes de entrenamiento básicos</span>
                </li>
                <li className="flex items-center text-xs">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 mr-3 text-foreground flex-shrink-0"
                  />
                  <span>Seguimiento de progreso</span>
                </li>
                <li className="flex items-center text-xs">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 mr-3 text-foreground flex-shrink-0"
                  />
                  <span>Acceso a la comunidad</span>
                </li>
              </ul>
              <Button
                variant="default"
                className="text-xs w-full text-white bg-green-600 hover:bg-green-600/90 backdrop-blur-sm transition-colors shadow-sm hover:shadow-md"
                asChild
              >
                <Link href="/dashboard">Comenzar gratis</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Plan Instructor Mensual */}
          <Card className="relative flex flex-col shadow-lg dark:shadow-xl transition-all duration-200 hover:shadow-xl hover:bg-gradient-to-br hover:from-zinc-100/90 hover:to-zinc-200/90 dark:hover:from-zinc-900/90 dark:hover:to-zinc-800/90 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 px-4 pt-8 pb-4 min-h-[280px] -mt-5 mb-1 overflow-visible transform xl:scale-102 scale-100">
            <div className="absolute rounded-2xl inset-0 -z-10 bg-gradient-to-br from-zinc-50/50 to-zinc-100/50 dark:from-zinc-900/50 dark:to-zinc-800/50" />
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <div className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-full text-xs font-medium">
                Más popular
              </div>
            </div>
            <CardContent className="px-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold tracking-heading mb-2">
                  Instructor
                </h3>
                <div className="text-3xl font-semibold tracking-heading mb-1">
                  $5
                  <span className="text-lg text-foreground font-normal">
                    /mes
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">
                  Para entrenadores profesionales
                </p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-xs">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 mr-3 text-black dark:text-white flex-shrink-0"
                  />
                  <span className="text-xs">Todo lo del plan Alumno</span>
                </li>
                <li className="flex items-center text-xs">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 mr-3 text-black dark:text-white flex-shrink-0"
                  />
                  <span className="text-xs">Gestión de clientes</span>
                </li>
                <li className="flex items-center text-xs">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 mr-3 text-black dark:text-white flex-shrink-0"
                  />
                  <span className="text-xs">
                    Creación de entrenamientos personalizados
                  </span>
                </li>
                <li className="flex items-center text-xs">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 mr-3 text-black dark:text-white flex-shrink-0"
                  />
                  <span className="text-xs">
                    Dashboard de analíticas avanzadas
                  </span>
                </li>
              </ul>
              <Button
                className="text-xs w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-md hover:shadow-lg"
                asChild
              >
                <Link href="/dashboard/profile/payment">
                  Prueba gratis 14 días
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Plan Instructor Anual */}
          <Card className="relative flex flex-col shadow-sm dark:shadow-md transition-all duration-200 hover:shadow-lg hover:bg-gradient-to-br hover:from-zinc-100/90 hover:to-zinc-200/90 dark:hover:from-zinc-900/90 dark:hover:to-zinc-800/90 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm border px-4 py-3 min-h-[240px] overflow-visible">
            <div className="absolute rounded-2xl inset-0 -z-10 bg-gradient-to-br from-zinc-50/50 to-zinc-100/50 dark:from-zinc-900/50 dark:to-zinc-800/50" />
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <div className="bg-sky-600 text-white dark:text-white px-3 py-1 rounded-full text-xs font-medium">
                Ahorra 18%
              </div>
            </div>
            <CardContent className="px-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold tracking-heading mb-2">
                  Instructor Anual
                </h3>
                <div className="text-3xl font-semibold tracking-heading mb-1">
                  $49
                  <span className="text-lg text-zinc-600 dark:text-zinc-200 font-normal">
                    /año
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">
                  Paga una vez y olvídate todo el año
                </p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-xs">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 mr-3 text-sky-600 dark:text-sky-300 flex-shrink-0"
                  />
                  <span>Todo lo del plan Instructor</span>
                </li>
                <li className="flex items-center text-xs">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 mr-3 text-sky-600 dark:text-sky-300 flex-shrink-0"
                  />
                  <span>Soporte prioritario</span>
                </li>
                <li className="flex items-center text-xs">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 mr-3 text-sky-600 dark:text-sky-300 flex-shrink-0"
                  />
                  <span>Acceso anticipado a nuevas funciones</span>
                </li>
              </ul>
              <Button
                variant="default"
                className="text-xs w-full text-white bg-sky-600 hover:bg-sky-600/90 backdrop-blur-sm transition-colors shadow-sm hover:shadow-md"
                asChild
              >
                <Link href="/dashboard/profile/payment">Elegir anual</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
