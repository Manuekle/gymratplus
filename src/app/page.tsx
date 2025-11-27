"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { ThemeToggle, useTheme } from "@/components/layout/theme/theme-toggle";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BoxingGlove01Icon,
  ChartAverageIcon,
  Target02Icon,
  Tick02Icon,
  UserGroupIcon,
  WorkoutRunIcon,
  Dumbbell01Icon,
  Apple01Icon,
  Message01Icon,
  FireIcon,
  WeightScaleIcon,
  Calendar01Icon,
  PresentationBarChart02Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";

export default function GymRatLanding() {
  const { resolvedTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Inicializar el tema detectado usando una función para evitar problemas de hidratación
  const [detectedTheme, setDetectedTheme] = useState<"light" | "dark">(() => {
    // Solo ejecutar en el cliente
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });

  // Sincronizar con next-themes cuando esté disponible
  useEffect(() => {
    setMounted(true);

    // Escuchar cambios en la preferencia del sistema
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleChange = (e: MediaQueryListEvent) => {
        setDetectedTheme(e.matches ? "dark" : "light");
      };

      // Usar addEventListener si está disponible (navegadores modernos)
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleChange);
      } else {
        // Fallback para navegadores antiguos
        mediaQuery.addListener(handleChange);
      }

      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener("change", handleChange);
        } else {
          mediaQuery.removeListener(handleChange);
        }
      };
    }
    return undefined;
  }, []);

  // Prioridad: resolvedTheme > systemTheme > detectedTheme
  const currentTheme =
    mounted && resolvedTheme
      ? resolvedTheme
      : mounted && systemTheme
        ? systemTheme
        : detectedTheme;

  // Carrusel automático de imágenes
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // Array con 4 imágenes - puedes cambiar las rutas por tus imágenes específicas
  const images = [
    {
      light: "/images/pic_light.png",
      dark: "/images/pic_dark.png",
    },
    {
      light: "/images/pic_light.png", // Cambia por tu segunda imagen light
      dark: "/images/pic_dark.png", // Cambia por tu segunda imagen dark
    },
    {
      light: "/images/pic_light.png", // Cambia por tu tercera imagen light
      dark: "/images/pic_dark.png", // Cambia por tu tercera imagen dark
    },
    {
      light: "/images/pic_light.png", // Cambia por tu cuarta imagen light
      dark: "/images/pic_dark.png", // Cambia por tu cuarta imagen dark
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); // Cambia cada 4 segundos

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white relative overflow-hidden transition-colors">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]"></div>

      {/* Background Blur Effects */}
      <div className="absolute top-0 left-1/4 w-48 h-48 bg-gradient-to-br from-zinc-500/5 to-transparent rounded-full blur-2xl"></div>
      <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-gradient-to-tl from-zinc-600/5 dark:from-white/5 to-transparent rounded-full blur-2xl"></div>
      <div className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-gradient-to-tr from-blue-500/5 dark:from-blue-400/5 to-transparent rounded-full blur-3xl"></div>

      {/* Navigation */}
      <nav className="relative z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm py-4 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-5 md:px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-semibold tracking-heading">
                GymRat+
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="#caracteristicas"
                className="hidden lg:flex text-foreground hover:text-black dark:hover:text-white transition-colors text-xs"
              >
                Características
              </Link>
              <Link
                href="#funcionalidades"
                className="hidden lg:flex text-foreground hover:text-black dark:hover:text-white transition-colors text-xs"
              >
                Funcionalidades
              </Link>
              <Link
                href="#precios"
                className="hidden lg:flex text-foreground hover:text-black dark:hover:text-white transition-colors text-xs"
              >
                Precios
              </Link>
              <Link
                href="/auth/signin"
                className="hidden lg:flex text-foreground hover:text-black dark:hover:text-white transition-colors text-xs"
              >
                Iniciar sesión
              </Link>
              <ThemeToggle />
              <Button
                size="default"
                variant="outline"
                className="xl:hidden flex text-xs"
                asChild
              >
                <Link href="/auth/signin">Iniciar sesión</Link>
              </Button>
              <Button
                size="default"
                className="hidden lg:flex bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100 text-xs"
                asChild
              >
                <Link href="/auth/signup">Comenzar</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="max-w-4xl mx-auto px-5 md:px-4 text-center">
          <Badge
            variant="outline"
            className="shadow-sm border border-zinc-200 dark:border-zinc-800 px-3 md:px-4 rounded-4xl dark:bg-zinc-900 py-1 mb-4 md:mb-6"
          >
            <span className="text-[10px] md:text-xs text-foreground font-normal">
              Plataforma inteligente de fitness
            </span>
          </Badge>

          <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold mb-4 md:mb-6 tracking-heading">
            Transforma tu cuerpo,
            <br />
            <span className="bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
              transforma tu vida
            </span>
          </h1>
          <p className="text-[11px] md:text-xs text-muted-foreground mb-6 md:mb-10 leading-relaxed max-w-2xl mx-auto px-2">
            La plataforma inteligente que conecta entrenadores y atletas para
            experiencias de entrenamiento personalizadas. Planes de nutrición
            inteligentes, seguimiento avanzado y coaching profesional en un solo
            lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
            <Button
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100 px-6 md:px-8 py-2.5 md:py-3 text-[11px] md:text-xs w-full sm:w-auto"
              asChild
            >
              <Link href="/auth/signup">Empezar gratis</Link>
            </Button>
            <Button
              variant="outline"
              className="px-6 md:px-8 py-2.5 md:py-3 text-[11px] md:text-xs border w-full sm:w-auto"
              asChild
            >
              <Link href="#caracteristicas">Ver características</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* App Preview */}
      <section className="relative z-10 py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-5 md:px-4">
          <div className="text-center mb-8 md:mb-12">
            <Badge
              variant="outline"
              className="shadow-sm border border-zinc-200 dark:border-zinc-800 px-3 md:px-4 rounded-4xl dark:bg-zinc-900 py-1 mb-3 md:mb-4"
            >
              <span className="text-[10px] md:text-xs text-foreground font-normal">
                Aplicación móvil
              </span>
            </Badge>
            <h2 className="text-2xl md:text-3xl lg:text-4xl tracking-heading font-semibold mb-2 md:mb-3">
              Diseñado para atletas
            </h2>
            <p className="text-muted-foreground text-[11px] md:text-xs">
              Simple, potente y enfocado en resultados
            </p>
          </div>

          <div className="flex justify-center">
            <div className="relative w-[200px] md:w-[300px]">
              <Image
                key={currentTheme}
                src={
                  currentTheme === "dark"
                    ? "/images/phone_dark.png"
                    : "/images/phone_light.png"
                }
                alt="GymRat+ App Móvil"
                width={300}
                height={600}
                className="relative drop-shadow-2xl w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features - Características principales */}
      <section
        id="caracteristicas"
        className="relative z-10 py-12 md:py-20 border-t border-zinc-200 dark:border-zinc-800/50"
      >
        <div className="max-w-6xl mx-auto px-5 md:px-4">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center justify-center">
            <div className="space-y-6 md:space-y-8">
              <div>
                <Badge
                  variant="outline"
                  className="shadow-sm border border-zinc-200 dark:border-zinc-800 px-3 md:px-4 rounded-4xl dark:bg-zinc-900 py-1 mb-3 md:mb-4"
                >
                  <span className="text-[10px] md:text-xs text-foreground font-normal">
                    Características
                  </span>
                </Badge>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-heading mb-2 md:mb-3">
                  Todo lo que necesitas
                </h2>
                <p className="text-muted-foreground text-[11px] md:text-xs">
                  Herramientas profesionales para tu entrenamiento y nutrición
                </p>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0 border border-zinc-200 dark:border-zinc-800">
                    <HugeiconsIcon
                      icon={Target02Icon}
                      className="w-4 h-4 md:w-5 md:h-5 text-zinc-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold tracking-heading mb-1 text-xs md:text-xl">
                      Entrenamientos Personalizados
                    </h3>
                    <p className="text-muted-foreground text-[11px] md:text-xs leading-relaxed">
                      Planes de entrenamiento inteligentes que se adaptan a tus
                      objetivos y progreso. Crea rutinas personalizadas o asigna
                      planes a tus estudiantes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0 border border-zinc-200 dark:border-zinc-800">
                    <HugeiconsIcon
                      icon={Apple01Icon}
                      className="w-4 h-4 md:w-5 md:h-5 text-zinc-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold tracking-heading mb-1 text-xs md:text-xl">
                      Nutrición Inteligente
                    </h3>
                    <p className="text-muted-foreground text-[11px] md:text-xs leading-relaxed">
                      Planes nutricionales generados con IA, calculadora de
                      calorías y macros, y seguimiento detallado de tu
                      alimentación diaria.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0 border border-zinc-200 dark:border-zinc-800">
                    <HugeiconsIcon
                      icon={ChartAverageIcon}
                      className="w-4 h-4 md:w-5 md:h-5 text-zinc-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold tracking-heading mb-1 text-xs md:text-xl">
                      Seguimiento Avanzado
                    </h3>
                    <p className="text-muted-foreground text-[11px] md:text-xs leading-relaxed">
                      Analíticas detalladas para monitorear tu progreso, peso,
                      medidas corporales y logros fitness con gráficos
                      interactivos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0 border border-zinc-200 dark:border-zinc-800">
                    <HugeiconsIcon
                      icon={UserGroupIcon}
                      className="w-4 h-4 md:w-5 md:h-5 text-zinc-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold tracking-heading mb-1 text-xs md:text-xl">
                      Entrenadores Expertos
                    </h3>
                    <p className="text-muted-foreground text-[11px] md:text-xs leading-relaxed">
                      Conecta con entrenadores certificados para coaching
                      profesional, planes personalizados y seguimiento continuo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center items-end h-full">
              <div className="relative w-full max-w-4xl aspect-video">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      index === currentImageIndex ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <Image
                      key={`${currentTheme}-${index}`}
                      src={currentTheme === "dark" ? image.dark : image.light}
                      alt={`Dashboard GymRat+ ${index + 1}`}
                      width={1200}
                      height={800}
                      className="w-full h-full object-contain rounded-xl border border-zinc-200 dark:border-zinc-800/50 shadow-2xl"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades Detalladas */}
      <section
        id="funcionalidades"
        className="relative z-10 py-12 md:py-20 border-t border-zinc-200 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-950/50"
      >
        <div className="max-w-6xl mx-auto px-5 md:px-4">
          <div className="text-center mb-10 md:mb-16">
            <Badge
              variant="outline"
              className="shadow-sm border border-zinc-200 dark:border-zinc-800 px-3 md:px-4 rounded-4xl dark:bg-zinc-900 py-1 mb-3 md:mb-4"
            >
              <span className="text-[10px] md:text-xs text-foreground font-normal">
                Funcionalidades
              </span>
            </Badge>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-heading mb-2 md:mb-3">
              Potencia tu entrenamiento
            </h2>
            <p className="text-muted-foreground text-[11px] md:text-xs max-w-2xl mx-auto px-2">
              Descubre todas las herramientas que tenemos para ayudarte a
              alcanzar tus objetivos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Racha de Entrenamiento */}
            <Card className="border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-4 md:p-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                  <HugeiconsIcon
                    icon={FireIcon}
                    className="w-5 h-5 md:w-6 md:h-6 text-orange-600 dark:text-orange-400"
                  />
                </div>
                <h3 className="font-semibold tracking-heading mb-2 text-xs md:text-xl">
                  Racha de Entrenamiento
                </h3>
                <p className="text-muted-foreground text-[11px] md:text-xs leading-relaxed">
                  Mantén tu motivación con un sistema de racha inteligente que
                  respeta tus días de descanso y te motiva a seguir entrenando.
                </p>
              </CardContent>
            </Card>

            {/* Seguimiento de Peso */}
            <Card className="border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-4 md:p-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                  <HugeiconsIcon
                    icon={WeightScaleIcon}
                    className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400"
                  />
                </div>
                <h3 className="font-semibold tracking-heading mb-2 text-xs md:text-xl">
                  Seguimiento de Peso
                </h3>
                <p className="text-muted-foreground text-[11px] md:text-xs leading-relaxed">
                  Registra tu peso, grasa corporal y masa muscular con gráficos
                  detallados para visualizar tu progreso a lo largo del tiempo.
                </p>
              </CardContent>
            </Card>

            {/* Objetivos y Metas */}
            <Card className="border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-4 md:p-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                  <HugeiconsIcon
                    icon={StarIcon}
                    className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400"
                  />
                </div>
                <h3 className="font-semibold tracking-heading mb-2 text-xs md:text-xl">
                  Objetivos y Metas
                </h3>
                <p className="text-muted-foreground text-[11px] md:text-xs leading-relaxed">
                  Establece objetivos de peso, fuerza, medidas corporales y
                  actividad. Visualiza tu progreso hacia cada meta.
                </p>
              </CardContent>
            </Card>

            {/* Historial de Entrenamientos */}
            <Card className="border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-4 md:p-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                  <HugeiconsIcon
                    icon={Calendar01Icon}
                    className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400"
                  />
                </div>
                <h3 className="font-semibold tracking-heading mb-2 text-xs md:text-xl">
                  Historial Completo
                </h3>
                <p className="text-muted-foreground text-[11px] md:text-xs leading-relaxed">
                  Accede a todo tu historial de entrenamientos, sesiones
                  completadas y progreso de ejercicios con detalles específicos.
                </p>
              </CardContent>
            </Card>

            {/* Analíticas Avanzadas */}
            <Card className="border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-4 md:p-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                  <HugeiconsIcon
                    icon={PresentationBarChart02Icon}
                    className="w-5 h-5 md:w-6 md:h-6 text-indigo-600 dark:text-indigo-400"
                  />
                </div>
                <h3 className="font-semibold tracking-heading mb-2 text-xs md:text-xl">
                  Analíticas Avanzadas
                </h3>
                <p className="text-muted-foreground text-[11px] md:text-xs leading-relaxed">
                  Dashboard completo con estadísticas, gráficos de progreso y
                  insights para optimizar tu entrenamiento y nutrición.
                </p>
              </CardContent>
            </Card>

            {/* Chat con Instructores */}
            <Card className="border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-4 md:p-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                  <HugeiconsIcon
                    icon={Message01Icon}
                    className="w-5 h-5 md:w-6 md:h-6 text-pink-600 dark:text-pink-400"
                  />
                </div>
                <h3 className="font-semibold tracking-heading mb-2 text-xs md:text-xl">
                  Comunicación Directa
                </h3>
                <p className="text-muted-foreground text-[11px] md:text-xs leading-relaxed">
                  Chatea directamente con tu instructor, recibe feedback en
                  tiempo real y resuelve dudas sobre tu plan de entrenamiento.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sección de Imágenes - Dashboard Features */}
      <section className="relative z-10 py-12 md:py-20 border-t border-zinc-200 dark:border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-5 md:px-4">
          <div className="text-center mb-8 md:mb-12">
            <Badge
              variant="outline"
              className="shadow-sm border border-zinc-200 dark:border-zinc-800 px-3 md:px-4 rounded-4xl dark:bg-zinc-900 py-1 mb-3 md:mb-4"
            >
              <span className="text-[10px] md:text-xs text-foreground font-normal">
                Dashboard
              </span>
            </Badge>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-heading mb-2 md:mb-3">
              Todo en un solo lugar
            </h2>
            <p className="text-muted-foreground text-[11px] md:text-xs">
              Visualiza tu progreso, objetivos y estadísticas de forma clara y
              organizada
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0 border border-zinc-200 dark:border-zinc-800">
                  <HugeiconsIcon
                    icon={Dumbbell01Icon}
                    className="w-3.5 h-3.5 md:w-4 md:h-4 text-zinc-700 dark:text-white"
                  />
                </div>
                <div>
                  <h3 className="font-semibold tracking-heading mb-1 text-xs md:text-xl">
                    Resumen de Entrenamientos
                  </h3>
                  <p className="text-muted-foreground text-[11px] md:text-xs leading-relaxed">
                    Accede rápidamente a tus últimos entrenamientos, racha
                    actual y recordatorios inteligentes.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0 border border-zinc-200 dark:border-zinc-800">
                  <HugeiconsIcon
                    icon={Apple01Icon}
                    className="w-3.5 h-3.5 md:w-4 md:h-4 text-zinc-700 dark:text-white"
                  />
                </div>
                <div>
                  <h3 className="font-semibold tracking-heading mb-1 text-xs md:text-xl">
                    Resumen Nutricional
                  </h3>
                  <p className="text-muted-foreground text-[11px] md:text-xs leading-relaxed">
                    Monitorea tus calorías, macros y consumo de agua del día
                    actual de un vistazo.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0 border border-zinc-200 dark:border-zinc-800">
                  <HugeiconsIcon
                    icon={Target02Icon}
                    className="w-3.5 h-3.5 md:w-4 md:h-4 text-zinc-700 dark:text-white"
                  />
                </div>
                <div>
                  <h3 className="font-semibold tracking-heading mb-1 text-xs md:text-xl">
                    Progreso de Objetivos
                  </h3>
                  <p className="text-muted-foreground text-[11px] md:text-xs leading-relaxed">
                    Visualiza el progreso de todos tus objetivos activos con
                    barras de progreso y métricas claras.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800/50 shadow-2xl">
                {/* Placeholder para imagen del dashboard */}
                <div className="aspect-video bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">
                    📊 Imagen: Dashboard principal con resúmenes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Imágenes - Nutrición */}
      <section className="relative z-10 py-12 md:py-20 border-t border-zinc-200 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-950/50">
        <div className="max-w-6xl mx-auto px-5 md:px-4">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
            <div className="relative order-2 md:order-1">
              <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800/50 shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 flex items-center justify-center">
                  <p className="text-[10px] md:text-xs text-muted-foreground px-2 text-center">
                    🍎 Imagen: Plan nutricional con comidas del día
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4 md:space-y-6 order-1 md:order-2">
              <Badge
                variant="outline"
                className="shadow-sm border border-zinc-200 dark:border-zinc-800 px-3 md:px-4 rounded-4xl dark:bg-zinc-900 py-1 mb-3 md:mb-4"
              >
                <span className="text-[10px] md:text-xs text-foreground font-normal">
                  Nutrición
                </span>
              </Badge>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-heading mb-2 md:mb-3">
                Nutrición inteligente
              </h2>
              <p className="text-muted-foreground text-[11px] md:text-xs mb-4 md:mb-6">
                Planes nutricionales generados con inteligencia artificial que
                se adaptan a tus objetivos y preferencias dietéticas.
              </p>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400 flex-shrink-0"
                  />
                  <span className="text-[11px] md:text-xs">
                    Calculadora de calorías y macros personalizada
                  </span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400 flex-shrink-0"
                  />
                  <span className="text-[11px] md:text-xs">
                    Registro de comidas con base de datos extensa
                  </span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400 flex-shrink-0"
                  />
                  <span className="text-[11px] md:text-xs">
                    Planes de alimentación personalizados por instructores
                  </span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400 flex-shrink-0"
                  />
                  <span className="text-[11px] md:text-xs">
                    Seguimiento de agua y hidratación
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Imágenes - Entrenamiento */}
      <section className="relative z-10 py-12 md:py-20 border-t border-zinc-200 dark:border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-5 md:px-4">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
            <div className="space-y-4 md:space-y-6">
              <Badge
                variant="outline"
                className="shadow-sm border border-zinc-200 dark:border-zinc-800 px-3 md:px-4 rounded-4xl dark:bg-zinc-900 py-1 mb-3 md:mb-4"
              >
                <span className="text-[10px] md:text-xs text-foreground font-normal">
                  Entrenamiento
                </span>
              </Badge>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-heading mb-2 md:mb-3">
                Entrenamientos personalizados
              </h2>
              <p className="text-muted-foreground text-[11px] md:text-xs mb-4 md:mb-6">
                Crea y sigue rutinas de entrenamiento completas con ejercicios,
                series, repeticiones y pesos. Ideal tanto para atletas como para
                instructores.
              </p>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
                  />
                  <span className="text-[11px] md:text-xs">
                    Base de datos con cientos de ejercicios
                  </span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
                  />
                  <span className="text-[11px] md:text-xs">
                    Seguimiento de sesiones en tiempo real
                  </span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
                  />
                  <span className="text-[11px] md:text-xs">
                    Historial completo de entrenamientos
                  </span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
                  />
                  <span className="text-[11px] md:text-xs">
                    Asignación de rutinas por instructores
                  </span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800/50 shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">
                    💪 Imagen: Pantalla de entrenamiento activo con ejercicios
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Imágenes - Instructores */}
      <section className="relative z-10 py-12 md:py-20 border-t border-zinc-200 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-950/50">
        <div className="max-w-6xl mx-auto px-5 md:px-4">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
            <div className="relative order-2 md:order-1">
              <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800/50 shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 flex items-center justify-center">
                  <p className="text-[10px] md:text-xs text-muted-foreground px-2 text-center">
                    👥 Imagen: Dashboard de instructor con estudiantes
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4 md:space-y-6 order-1 md:order-2">
              <Badge
                variant="outline"
                className="shadow-sm border border-zinc-200 dark:border-zinc-800 px-3 md:px-4 rounded-4xl dark:bg-zinc-900 py-1 mb-3 md:mb-4"
              >
                <span className="text-[10px] md:text-xs text-foreground font-normal">
                  Para Instructores
                </span>
              </Badge>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-heading mb-2 md:mb-3">
                Gestiona tu negocio fitness
              </h2>
              <p className="text-muted-foreground text-[11px] md:text-xs mb-4 md:mb-6">
                Herramientas profesionales para entrenadores que quieren hacer
                crecer su negocio y ayudar a más personas.
              </p>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400 flex-shrink-0"
                  />
                  <span className="text-[11px] md:text-xs">
                    Gestión completa de estudiantes y clientes
                  </span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400 flex-shrink-0"
                  />
                  <span className="text-[11px] md:text-xs">
                    Creación de planes de entrenamiento y nutrición
                  </span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400 flex-shrink-0"
                  />
                  <span className="text-[11px] md:text-xs">
                    Dashboard de analíticas y estadísticas
                  </span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="w-4 h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400 flex-shrink-0"
                  />
                  <span className="text-[11px] md:text-xs">
                    Comunicación directa con estudiantes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="relative z-10 py-12 md:py-20 border-t border-zinc-200 dark:border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-5 md:px-4">
          <div className="text-center mb-8 md:mb-12">
            <Badge
              variant="outline"
              className="shadow-sm border border-zinc-200 dark:border-zinc-800 px-3 md:px-4 rounded-4xl dark:bg-zinc-900 py-1 mb-3 md:mb-4"
            >
              <span className="text-[10px] md:text-xs text-foreground font-normal">
                Para todos
              </span>
            </Badge>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-heading mb-2 md:mb-3">
              Para todos los niveles
            </h2>
            <p className="text-muted-foreground text-[11px] md:text-xs">
              Desde principiantes hasta profesionales
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 border border-zinc-200 dark:border-zinc-800">
                <HugeiconsIcon
                  icon={WorkoutRunIcon}
                  className="w-6 h-6 md:w-8 md:h-8 text-foreground"
                />
              </div>
              <h3 className="text-lg md:text-xl lg:text-2xl font-semibold tracking-heading mb-2 md:mb-3">
                Para Atletas
              </h3>
              <p className="text-muted-foreground leading-relaxed text-[11px] md:text-xs px-2">
                Accede a planes de entrenamiento personalizados, rastrea tu
                progreso, conecta con entrenadores profesionales y alcanza tus
                metas fitness con herramientas inteligentes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 border border-zinc-200 dark:border-zinc-800">
                <HugeiconsIcon
                  icon={BoxingGlove01Icon}
                  className="w-6 h-6 md:w-8 md:h-8 text-foreground"
                />
              </div>
              <h3 className="text-lg md:text-xl lg:text-2xl font-semibold tracking-heading mb-2 md:mb-3">
                Para Entrenadores
              </h3>
              <p className="text-muted-foreground leading-relaxed text-[11px] md:text-xs px-2">
                Gestiona tus clientes, crea planes de entrenamiento y nutrición
                personalizados, y haz crecer tu negocio fitness con herramientas
                profesionales y analíticas avanzadas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="precios"
        className="relative z-10 py-12 md:py-24 border-t border-zinc-200 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-950/30"
      >
        <div className="max-w-7xl mx-auto px-5 md:px-4">
          <div className="text-center mb-8 md:mb-16">
            <Badge
              variant="outline"
              className="shadow-sm border border-zinc-200 dark:border-zinc-800 px-3 md:px-4 rounded-full dark:bg-zinc-900 py-1 md:py-1.5 mb-3 md:mb-6"
            >
              <span className="text-[10px] md:text-xs text-foreground font-medium">
                Precios
              </span>
            </Badge>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-heading mb-2 md:mb-4">
              Precios simples
            </h2>
            <p className="text-[11px] md:text-xs text-muted-foreground max-w-2xl mx-auto">
              Elige el plan que se adapte a ti
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
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
                  asChild
                >
                  <Link href="/dashboard">Comenzar gratis</Link>
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
                  asChild
                >
                  <Link href="/dashboard/profile/payment">
                    Prueba gratis 14 días
                  </Link>
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
                  asChild
                >
                  <Link href="/dashboard/profile/payment">Elegir anual</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative backdrop-blur-md bg-white/90 dark:bg-black/90 mt-10 md:mt-16 border-t border-zinc-200 dark:border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-5 md:px-6 py-8 md:py-12">
          {/* Main content */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
            {/* Brand */}
            <div className="flex items-center space-x-2">
              <span className="text-xl md:text-2xl font-semibold text-black dark:text-white tracking-heading">
                GymRat+
              </span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-4 md:gap-6 text-[11px] md:text-xs">
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
          <div className="mt-6 md:mt-8 pt-4 md:pt-6">
            <p className="text-[11px] md:text-xs text-muted-foreground text-center">
              &copy; {new Date().getFullYear()} GymRat+. Todos los derechos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
