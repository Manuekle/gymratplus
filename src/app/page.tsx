"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle, useTheme } from "@/components/layout/theme/theme-toggle";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Target02Icon,
  Tick02Icon,
  UserGroupIcon,
  Apple01Icon,
  Message01Icon,
  FireIcon,
  ChartAverageIcon,
} from "@hugeicons/core-free-icons";
import { InstallPrompt } from "@/components/pwa/install-prompt";

export default function GymRatLanding() {
  const { resolvedTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [detectedTheme, setDetectedTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        setDetectedTheme(e.matches ? "dark" : "light");
      };
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleChange);
      } else {
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

  const currentTheme =
    mounted && resolvedTheme
      ? resolvedTheme
      : mounted && systemTheme
        ? systemTheme
        : detectedTheme;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900 text-zinc-900 dark:text-zinc-50 relative overflow-hidden">
      <InstallPrompt />

      {/* Animated Liquid Glass Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-gradient-to-br from-zinc-200/40 to-zinc-300/20 dark:from-zinc-800/40 dark:to-zinc-700/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-20 -right-40 w-96 h-96 bg-gradient-to-tl from-zinc-300/30 to-zinc-200/20 dark:from-zinc-700/30 dark:to-zinc-800/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-gradient-to-tr from-zinc-200/30 to-zinc-300/20 dark:from-zinc-800/30 dark:to-zinc-700/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Glass Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Navigation - Clean & Transparent */}
      <nav className="relative z-50 backdrop-blur-md bg-white/40 dark:bg-black/40 border-b border-zinc-200/30 dark:border-zinc-800/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {mounted ? (
                <Image
                  src={currentTheme === "dark" ? "/icons/logo-dark.png" : "/icons/logo-light.png"}
                  alt="GymRat+"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              )}
              <span className="text-xl font-semibold tracking-[-0.04em]">
                GymRat+
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="#features"
                className="hidden lg:flex text-xs tracking-[-0.02em] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Características
              </Link>
              <Link
                href="#pricing"
                className="hidden lg:flex text-xs tracking-[-0.02em] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Precios
              </Link>
              <ThemeToggle />
              <Button
                size="default"
                className="bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-lg shadow-zinc-900/20 dark:shadow-zinc-100/20"
                asChild
              >
                <Link href="/auth/signin">Iniciar sesión</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Liquid Glass */}
      <section className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Glass Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg shadow-zinc-900/5 dark:shadow-zinc-100/5 mb-8">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-zinc-600 to-zinc-400 dark:from-zinc-400 dark:to-zinc-200 animate-pulse" />
            <span className="text-xs font-medium tracking-[-0.02em] text-zinc-700 dark:text-zinc-300">
              Plataforma inteligente de fitness
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-[-0.04em]">
            <span className="bg-gradient-to-br from-zinc-900 via-zinc-700 to-zinc-600 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-400 bg-clip-text text-transparent">
              Transforma
            </span>
            <br />
            <span className="text-zinc-800 dark:text-zinc-200">tu cuerpo</span>
          </h1>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto ">
            La plataforma que conecta entrenadores y atletas. Planes
            personalizados, seguimiento avanzado y coaching profesional.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="default"
              className="backdrop-blur-xl bg-zinc-900/90 dark:bg-zinc-100/90 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-2xl shadow-zinc-900/30 dark:shadow-zinc-100/30 border border-zinc-800/50 dark:border-zinc-200/50"
              asChild
            >
              <Link href="/auth/signup">Empezar gratis</Link>
            </Button>
            <Button
              size="default"
              variant="outline"
              className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border-zinc-300/50 dark:border-zinc-700/50 hover:bg-white/60 dark:hover:bg-black/60 shadow-lg"
              asChild
            >
              <Link href="#features">Ver características</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* App Preview - Clean */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center">
            <div className="relative w-[280px]">
              {mounted ? (
                <div className="flex-1 relative">
                  <Image
                    key={currentTheme}
                    src={
                      currentTheme === "dark"
                        ? "/images/phone_dark.png"
                        : "/images/phone_light.png"
                    }
                    alt="GymRat+ App"
                    width={280}
                    height={560}
                    className="drop-shadow-2xl"
                    priority
                  />
                </div>
              ) : (
                <div className="flex-1 relative w-[280px] h-[560px] bg-zinc-100 dark:bg-zinc-900 rounded-3xl animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Clean & Simple */}
      <section id="features" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border-zinc-300/50 dark:border-zinc-700/50 mb-4"
            >
              Características
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.04em] mb-4">
              <span className="bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
                Todo lo que necesitas
              </span>
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs tracking-[-0.02em]">
              Herramientas profesionales para tu transformación
            </p>
          </div>

          {/* Simple Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Target02Icon,
                title: "Entrenamientos Personalizados",
                desc: "Planes inteligentes que se adaptan a tus objetivos y progreso",
              },
              {
                icon: Apple01Icon,
                title: "Nutrición Inteligente",
                desc: "Planes nutricionales con IA y seguimiento de macros",
              },
              {
                icon: ChartAverageIcon,
                title: "Seguimiento Avanzado",
                desc: "Analíticas detalladas con gráficos interactivos",
              },
              {
                icon: UserGroupIcon,
                title: "Entrenadores Expertos",
                desc: "Conecta con profesionales certificados",
              },
              {
                icon: FireIcon,
                title: "Sistema de Rachas",
                desc: "Mantén tu motivación con seguimiento inteligente",
              },
              {
                icon: Message01Icon,
                title: "Chat en Tiempo Real",
                desc: "Comunicación directa con tu instructor",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group backdrop-blur-xl bg-white/40 dark:bg-black/40 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 p-8 hover:bg-white/60 dark:hover:bg-black/60 transition-all duration-300 hover:shadow-2xl hover:shadow-zinc-900/10 dark:hover:shadow-zinc-100/10 hover:-translate-y-1 hover:border-zinc-300/80 dark:hover:border-zinc-700/80"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-zinc-900/10 dark:shadow-zinc-100/10">
                  <HugeiconsIcon
                    icon={feature.icon}
                    className="w-7 h-7 text-zinc-700 dark:text-zinc-300"
                  />
                </div>
                <h3 className="font-bold text-2xl tracking-[-0.04em] mb-3 text-zinc-900 dark:text-zinc-100">
                  {feature.title}
                </h3>
                <p className="text-xs tracking-[-0.02em] text-zinc-600 dark:text-zinc-400 ">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Frosted Glass */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="backdrop-blur-2xl bg-gradient-to-br from-white/50 to-zinc-100/50 dark:from-black/50 dark:to-zinc-900/50 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl p-12">
            <div className="grid md:grid-cols-3 gap-12 text-center">
              {[
                { value: "10K+", label: "Usuarios Activos" },
                { value: "50K+", label: "Entrenamientos Completados" },
                { value: "500+", label: "Entrenadores Certificados" },
              ].map((stat, i) => (
                <div key={i} className="relative">
                  <div className="text-5xl font-bold tracking-[-0.04em] bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-xs tracking-[-0.02em] text-zinc-600 dark:text-zinc-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - Glass Cards */}
      <section id="pricing" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border-zinc-300/50 dark:border-zinc-700/50 mb-4"
            >
              Precios
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.04em] mb-4">
              <span className="bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
                Planes flexibles
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Gratis",
                price: "$0",
                features: [
                  "Entrenamientos básicos",
                  "Seguimiento de peso",
                  "Comunidad",
                ],
              },
              {
                name: "Pro",
                price: "$9.99",
                features: [
                  "Todo en Gratis",
                  "Planes personalizados",
                  "Nutrición IA",
                  "Chat con instructores",
                ],
                popular: true,
              },
              {
                name: "Instructor",
                price: "$19.99",
                features: [
                  "Todo en Pro",
                  "Gestión de estudiantes",
                  "Planes ilimitados",
                  "Analíticas avanzadas",
                ],
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`relative p-8 rounded-xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${plan.popular
                  ? "backdrop-blur-xl bg-zinc-900/90 dark:bg-zinc-100/90 border-zinc-800/50 dark:border-zinc-200/50 shadow-2xl hover:border-zinc-700 dark:hover:border-zinc-300"
                  : "backdrop-blur-xl bg-white/80 dark:bg-black/80 border-zinc-200/50 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-900"
                  }`}
              >
                {plan.popular && (
                  <Badge className="mb-4 bg-zinc-700 dark:bg-zinc-300 text-zinc-100 dark:text-zinc-900">
                    Más popular
                  </Badge>
                )}
                <h3
                  className={`text-2xl font-bold tracking-[-0.04em] mb-2 ${plan.popular
                    ? "text-zinc-100 dark:text-zinc-900"
                    : "text-zinc-900 dark:text-zinc-100"
                    }`}
                >
                  {plan.name}
                </h3>
                <div
                  className={`text-4xl font-bold tracking-[-0.04em] mb-6 ${plan.popular
                    ? "text-zinc-100 dark:text-zinc-900"
                    : "text-zinc-900 dark:text-zinc-100"
                    }`}
                >
                  {plan.price}
                  <span
                    className={`text-xs font-normal ${plan.popular
                      ? "text-zinc-300 dark:text-zinc-700"
                      : "text-zinc-600 dark:text-zinc-400"
                      }`}
                  >
                    /mes
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        className={`w-5 h-5 ${plan.popular
                          ? "text-zinc-300 dark:text-zinc-700"
                          : "text-zinc-600 dark:text-zinc-400"
                          }`}
                      />
                      <span
                        className={`text-xs tracking-[-0.02em] ${plan.popular
                          ? "text-zinc-200 dark:text-zinc-800"
                          : "text-zinc-700 dark:text-zinc-300"
                          }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${plan.popular
                    ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    : "bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                    }`}
                  asChild
                >
                  <Link href="/auth/signup">Comenzar</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Glass */}
      <footer className="relative z-10 mt-20 backdrop-blur-xl bg-white/40 dark:bg-black/40 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              {mounted ? (
                <div className="relative w-8 h-8">
                  <Image
                    src={currentTheme === "dark" ? "/icons/logo-dark.png" : "/icons/logo-light.png"}
                    alt="GymRat+ Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              )}
              <span className="text-xl font-semibold tracking-[-0.04em]">
                GymRat+
              </span>
            </div>
            <div className="flex items-center justify-center gap-6 mb-3">
              <Link
                href="/privacy"
                className="text-xs tracking-[-0.02em] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Política de Privacidad
              </Link>
              <span className="text-zinc-400 dark:text-zinc-600">•</span>
              <Link
                href="/terms"
                className="text-xs tracking-[-0.02em] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Términos de Servicio
              </Link>
            </div>
            <p className="text-xs tracking-[-0.02em] text-zinc-600 dark:text-zinc-400">
              © 2025 GymRat+. Todos los derechos reservados.
            </p>
          </div >
        </div >
      </footer >

      <style jsx global>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scrollCarousel {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-fade-in-up {
          opacity: 0;
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-scroll-carousel {
          animation: scrollCarousel 30s linear infinite;
        }
        .animate-scroll-carousel:hover {
          animation-play-state: paused;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div >
  );
}
