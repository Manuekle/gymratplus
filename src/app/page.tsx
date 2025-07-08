"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dumbbell,
  Users,
  BarChart3,
  Target,
  Check,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function GymRatLanding() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white relative overflow-hidden transition-colors">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]"></div>

      {/* Background Blur Effects */}
      <div className="absolute top-0 left-1/4 w-48 h-48 bg-gradient-to-br from-gray-500/5 to-transparent rounded-full blur-2xl"></div>
      <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-gradient-to-tl from-gray-600/5 dark:from-white/5 to-transparent rounded-full blur-2xl"></div>

      {/* Navigation */}
      <nav className="relative z-10 bg-white dark:bg-black shadow-sm py-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-semibold tracking-heading">
                GymRat+
              </span>
            </div>
            <div className="flex items-center space-x-8">
              <Link
                href="#caracteristicas"
                className="text-foreground hover:text-black dark:hover:text-white transition-colors text-sm"
              >
                Características
              </Link>
              <Link
                href="#precios"
                className="text-foreground hover:text-black dark:hover:text-white transition-colors text-sm"
              >
                Precios
              </Link>
              <Link
                href="/auth/signin"
                className="text-foreground hover:text-black dark:hover:text-white transition-colors text-sm"
              >
                Iniciar sesión
              </Link>
              <ThemeToggle />
              <Button
                size="sm"
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 text-sm"
                asChild
              >
                <Link href="/auth/signup">Comenzar</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-16 pb-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge
            variant="outline"
            className="shadow-sm border border-zinc-200 dark:border-zinc-800 px-4 rounded-4xl dark:bg-zinc-900 py-1 mb-4"
          >
            <span className="text-xs text-foreground font-normal">
              Plataforma inteligente de fitness
            </span>
          </Badge>

          <h1 className="text-4xl md:text-5xl font-semibold  mb-4 tracking-heading">
            GymRat+
          </h1>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
            La plataforma inteligente que conecta entrenadores y atletas para
            experiencias de entrenamiento personalizadas
          </p>
          <Button
            className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 px-6 py-2"
            asChild
          >
            <Link href="/auth/signup">Empezar ahora</Link>
          </Button>
        </div>
      </section>

      {/* App Preview */}
      <section className="relative z-10 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="shadow-sm border border-zinc-200 dark:border-zinc-800 px-4 rounded-4xl dark:bg-zinc-900 py-1 mb-4"
            >
              <span className="text-xs text-foreground font-normal">
                Aplicación móvil
              </span>
            </Badge>
            <h2 className="text-3xl font-semibold  mb-3">
              Diseñado para atletas
            </h2>
            <p className="text-muted-foreground text-sm">
              Simple, potente y enfocado en resultados
            </p>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gray-200/20 dark:bg-white/10 rounded-2xl blur-xl"></div>
              <Image
                src="/placeholder.svg?height=500&width=250"
                alt="GymRat+ App Móvil"
                width={250}
                height={500}
                className="relative rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="caracteristicas"
        className="relative z-10 py-20 border-t border-gray-200 dark:border-gray-800/50"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <Badge
                  variant="outline"
                  className="shadow-sm border border-zinc-200 dark:border-zinc-800 px-4 rounded-4xl dark:bg-zinc-900 py-1 mb-4"
                >
                  <span className="text-xs text-foreground font-normal">
                    Características
                  </span>
                </Badge>
                <h2 className="text-3xl font-semibold tracking-heading mb-3">
                  Todo lo que necesitas
                </h2>
                <p className="text-muted-foreground text-sm">
                  Herramientas profesionales para tu entrenamiento
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-zinc-800">
                    <Target className="w-4 h-4 text-gray-700 dark:text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold tracking-heading mb-1">
                      Entrenamientos Personalizados
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Planes de entrenamiento inteligentes que se adaptan a tus
                      objetivos y progreso
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-zinc-800">
                    <BarChart3 className="w-4 h-4 text-gray-700 dark:text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold tracking-heading mb-1">
                      Seguimiento Avanzado
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Analíticas detalladas para monitorear tu progreso y logros
                      fitness
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-zinc-800">
                    <Users className="w-4 h-4 text-gray-700 dark:text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold tracking-heading mb-1">
                      Entrenadores Expertos
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Conecta con entrenadores certificados para coaching
                      profesional
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gray-200/20 dark:bg-white/10 rounded-xl blur-xl"></div>
                <Image
                  src="/placeholder.svg?height=350&width=500"
                  alt="Dashboard GymRat+"
                  width={500}
                  height={350}
                  className="relative rounded-xl border border-gray-200 dark:border-gray-800/50 shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="relative z-10 py-20 border-t border-gray-200 dark:border-gray-800/50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="shadow-sm border border-zinc-200 dark:border-zinc-800 px-4 rounded-4xl dark:bg-zinc-900 py-1 mb-4"
            >
              <span className="text-xs text-foreground font-normal">
                Para todos
              </span>
            </Badge>
            <h2 className="text-3xl font-semibold tracking-heading mb-3">
              Para todos los niveles
            </h2>
            <p className="text-muted-foreground text-sm">
              Desde principiantes hasta profesionales
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-zinc-800">
                <Users className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold tracking-heading mb-3">
                Para Atletas
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Accede a planes de entrenamiento personalizados, rastrea tu
                progreso y conecta con entrenadores profesionales para alcanzar
                tus metas fitness
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-zinc-800">
                <Dumbbell className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold tracking-heading mb-3">
                Para Entrenadores
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Gestiona tus clientes, crea planes de entrenamiento
                personalizados y haz crecer tu negocio fitness con herramientas
                profesionales
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="precios"
        className="relative z-10 py-20 border-t border-gray-200 dark:border-gray-800/50"
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="shadow-sm border border-zinc-200 dark:border-zinc-800 px-4 rounded-4xl dark:bg-zinc-900 py-1 mb-4"
            >
              <span className="text-xs text-foreground font-normal">
                Precios
              </span>
            </Badge>
            <h2 className="text-3xl font-semibold  mb-3">Precios simples</h2>
            <p className="text-muted-foreground text-sm">Elige el plan que se adapte a ti</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Plan Alumno */}
            <Card className="relative flex flex-col shadow-sm dark:shadow-md transition-all duration-200 hover:scale-[1.005] hover:shadow-lg hover:bg-gradient-to-br hover:from-gray-100/90 hover:to-gray-200/90 dark:hover:from-zinc-900/90 dark:hover:to-zinc-800/90 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm border px-4 py-3 min-h-[220px] overflow-hidden">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-zinc-900/50 dark:to-zinc-800/50" />
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold tracking-heading mb-2">Alumno</h3>
                  <div className="text-3xl font-semibold tracking-heading mb-1">Gratis</div>
                  <p className="text-muted-foreground text-sm">
                    Perfecto para empezar tu journey fitness
                  </p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-sm">
                    <Check className="w-4 h-4 mr-3 text-foreground flex-shrink-0" />
                    <span>Planes de entrenamiento básicos</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="w-4 h-4 mr-3 text-foreground flex-shrink-0" />
                    <span>Seguimiento de progreso</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="w-4 h-4 mr-3 text-foreground flex-shrink-0" />
                    <span>Acceso a la comunidad</span>
                  </li>
                </ul>
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link href="/auth/signup">Comenzar gratis</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Plan Instructor Mensual */}
            <Card className="relative flex flex-col shadow-sm dark:shadow-md transition-all duration-200 hover:scale-[1.005] hover:shadow-lg hover:bg-gradient-to-br hover:from-gray-100/90 hover:to-gray-200/90 dark:hover:from-zinc-900/90 dark:hover:to-zinc-800/90 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm border px-4 pt-6 pb-3 min-h-[220px] overflow-visible">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-zinc-900/50 dark:to-zinc-800/50" />
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <div className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-full text-xs font-medium">
                  Más popular
                </div>
              </div>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold tracking-heading mb-2">Instructor</h3>
                  <div className="text-3xl font-semibold tracking-heading mb-1">
                    $5
                    <span className="text-lg text-foreground font-normal">
                      /mes
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Para entrenadores profesionales
                  </p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-sm">
                    <Check className="w-4 h-4 mr-3 text-black dark:text-white flex-shrink-0" />
                    <span>Todo lo del plan Alumno</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="w-4 h-4 mr-3 text-black dark:text-white flex-shrink-0" />
                    <span>Gestión de clientes</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="w-4 h-4 mr-3 text-black dark:text-white flex-shrink-0" />
                    <span>Creación de entrenamientos personalizados</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="w-4 h-4 mr-3 text-black dark:text-white flex-shrink-0" />
                    <span>Dashboard de analíticas avanzadas</span>
                  </li>
                </ul>
                <Button
                  className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100"
                  asChild
                >
                  <Link href="/auth/signup">Prueba gratis 14 días</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Plan Instructor Anual */}
            <Card className="relative flex flex-col shadow-sm dark:shadow-md transition-all duration-200 hover:scale-[1.005] hover:shadow-lg hover:bg-gradient-to-br hover:from-gray-100/90 hover:to-gray-200/90 dark:hover:from-zinc-900/90 dark:hover:to-zinc-800/90 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm border px-4 pt-6 pb-3 min-h-[220px] overflow-visible">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-zinc-900/50 dark:to-zinc-800/50" />
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <div className="bg-sky-600 text-white dark:text-white px-3 py-1 rounded-full text-xs font-medium">
                  Ahorra 18%
                </div>
              </div>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold tracking-heading mb-2">
                    Instructor Anual
                  </h3>
                  <div className="text-3xl font-semibold tracking-heading mb-1">
                    $49
                    <span className="text-lg text-gray-600 dark:text-gray-200 font-normal">
                      /año
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Paga una vez y olvídate todo el año
                  </p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-sm">
                    <Check className="w-4 h-4 mr-3 text-sky-600 dark:text-sky-300 flex-shrink-0" />
                    <span>Todo lo del plan Instructor</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="w-4 h-4 mr-3 text-sky-600 dark:text-sky-300 flex-shrink-0" />
                    <span>Soporte prioritario</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="w-4 h-4 mr-3 text-sky-600 dark:text-sky-300 flex-shrink-0" />
                    <span>Acceso anticipado a nuevas funciones</span>
                  </li>
                </ul>
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link href="/auth/signup">Elegir anual</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative backdrop-blur-md bg-white/90 dark:bg-black/90 mt-16">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Main content */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-semibold text-black dark:text-white tracking-heading">GymRat+</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-6 text-sm">
            <Link
              href="#"
              className="text-muted-foreground hover:text-black dark:hover:text-white transition-colors"
            >
              Privacidad
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-black dark:hover:text-white transition-colors"
            >
              Términos
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-black dark:hover:text-white transition-colors"
            >
              Contacto
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6">
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} GymRat+. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
    </div>
  );
}
