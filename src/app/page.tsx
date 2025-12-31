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
  BubbleChatIcon,
  FireIcon,
  ChartAverageIcon,
  Robot01Icon,
  ArtificialIntelligence02Icon,
  CheckmarkBadge02Icon,
} from "@hugeicons/core-free-icons";
import {
  InstagramIcon,
  TiktokIcon,
  Share08Icon,
  Cancel01Icon,
  Time01Icon,
  Award01Icon,
  CloudIcon,
  ChartAverageIcon as ChartIcon,
} from "@hugeicons/core-free-icons";

// Screenshot Carousel Component
const screenshots = ["body", "qr", "rocco", "water"];

function ScreenshotCarousel({ currentTheme }: { currentTheme: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % screenshots.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-[280px] md:w-[400px] lg:w-[480px] h-[560px] md:h-[800px] lg:h-[960px] p-8">
      {screenshots.map((screenshot, index) => (
        <div
          key={screenshot}
          className="absolute inset-0 transition-opacity duration-1000 p-8"
          style={{
            opacity: index === currentIndex ? 1 : 0,
            pointerEvents: index === currentIndex ? "auto" : "none",
          }}
        >
          <div className="relative w-full h-full overflow-hidden">
            <Image
              src={`/screenshots/${screenshot}-${currentTheme}.png`}
              alt={`GymRat+ ${screenshot}`}
              width={1284}
              height={2778}
              className="w-full h-full object-cover"
              priority={index === 0}
            />
            {/* Edge blur gradients */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Left edge */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/80 to-transparent dark:from-black/80 dark:to-transparent" />
              {/* Right edge */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/80 to-transparent dark:from-black/80 dark:to-transparent" />
              {/* Top edge */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/80 to-transparent dark:from-black/80 dark:to-transparent" />
              {/* Bottom edge */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/80 to-transparent dark:from-black/80 dark:to-transparent" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// iOS Install Popup Component
function IOSInstallPrompt({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md backdrop-blur-2xl bg-white/95 dark:bg-black/95 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl p-5 sm:p-6 animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-start mb-4 gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-2xl bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center">
              <HugeiconsIcon
                icon={Share08Icon}
                className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-700 dark:text-zinc-300"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-xs sm:text-lg tracking-[-0.04em] truncate">
                Instalar GymRat+
              </h3>
              <p className="text-xs sm:text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                Acceso rápido desde tu pantalla de inicio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex-shrink-0 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center transition-colors"
            aria-label="Cerrar"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <p className="text-xs sm:text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Pasos para instalar:
            </p>
            <ol className="space-y-2 text-xs sm:text-xs text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-semibold">
                  1
                </span>
                <span className="flex-1">
                  Toca el botón de <strong>Compartir</strong>{" "}
                  <HugeiconsIcon
                    icon={Share08Icon}
                    className="inline w-3 h-3"
                  />{" "}
                  en la barra inferior de Safari
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-semibold">
                  2
                </span>
                <span className="flex-1">
                  Desplázate y selecciona{" "}
                  <strong>"Añadir a pantalla de inicio"</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-semibold">
                  3
                </span>
                <span className="flex-1">
                  Toca <strong>"Añadir"</strong> en la esquina superior derecha
                </span>
              </li>
            </ol>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 sm:py-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 font-semibold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

// Android Install Popup Component
function AndroidInstallPrompt({
  onInstall,
  onClose,
}: {
  onInstall: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md backdrop-blur-2xl bg-white/95 dark:bg-black/95 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl p-5 sm:p-6 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-700 dark:from-zinc-100 dark:to-zinc-300 flex items-center justify-center shadow-lg flex-shrink-0">
            <Image
              src="/icons/icon-192x192.png"
              alt="GymRat+ Icon"
              width={64}
              height={64}
              className="w-10 h-10 object-contain brightness-0 invert dark:brightness-100 dark:invert-0"
              onError={(e) => {
                // Fallback if image fails
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Fallback icon if image missing, hidden by default unless image errors */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: -1 }}>
              <HugeiconsIcon icon={ChartIcon} className="w-8 h-8 text-white dark:text-black" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg sm:text-xl tracking-[-0.04em] mb-1">
              Instalar GymRat+
            </h3>
            <p className="text-xs sm:text-xs text-zinc-600 dark:text-zinc-400">
              Instala la aplicación para una mejor experiencia, acceso offline y notificaciones.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="rounded-xl h-12 text-xs font-semibold border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={onClose}
          >
            Ahora no
          </Button>
          <Button
            className="rounded-xl h-12 text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
            onClick={onInstall}
          >
            Instalar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function GymRatLanding() {
  const { resolvedTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
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

      // Detect iOS and show install prompt
      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as any).MSStream;
      const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;

      if (isIOS && !isStandalone) {
        // Show prompt after 3 seconds
        const timer = setTimeout(() => {
          setShowIOSPrompt(true);
        }, 3000);
        return () => clearTimeout(timer);
      }

      // Android / Desktop Install Prompt
      const handleBeforeInstallPrompt = (e: Event) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        setDeferredPrompt(e);
        // Update UI to notify the user they can add to home screen
        setShowAndroidPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener("change", handleChange);
        } else {
          mediaQuery.removeListener(handleChange);
        }
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
    return undefined;
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install scroll: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowAndroidPrompt(false);
  };

  const currentTheme =
    mounted && resolvedTheme
      ? resolvedTheme
      : mounted && systemTheme
        ? systemTheme
        : detectedTheme;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900 text-zinc-900 dark:text-zinc-50 relative overflow-hidden">
      {showIOSPrompt && <IOSInstallPrompt onClose={() => setShowIOSPrompt(false)} />}
      {showAndroidPrompt && (
        <AndroidInstallPrompt
          onInstall={handleInstallClick}
          onClose={() => setShowAndroidPrompt(false)}
        />
      )}
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
                  src={
                    currentTheme === "dark"
                      ? "/icons/logo-dark.png"
                      : "/icons/logo-light.png"
                  }
                  alt="GymRat+"
                  width={32}
                  height={32}
                  className="object-contain"
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

      {/* App Preview - Screenshot Carousel */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center">
            {mounted ? (
              <ScreenshotCarousel currentTheme={currentTheme} />
            ) : (
              <div className="w-[280px] md:w-[320px] h-[560px] md:h-[640px] bg-zinc-100 dark:bg-zinc-900 rounded-3xl animate-pulse" />
            )}
          </div>
        </div>
      </section>

      {/* Meet Rocco - AI Assistant Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="backdrop-blur-2xl bg-gradient-to-br from-white/60 to-zinc-100/60 dark:from-black/60 dark:to-zinc-900/60 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-12 p-12">
              {/* Left: Content */}
              <div className="flex flex-col justify-center">
                <Badge
                  variant="outline"
                  className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border-zinc-300/50 dark:border-zinc-700/50 mb-4 w-fit"
                >
                  <HugeiconsIcon
                    icon={ArtificialIntelligence02Icon}
                    className="w-3 h-3 mr-1"
                  />
                  Inteligencia Artificial
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.04em] mb-4">
                  <span className="bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
                    Conoce a Rocco
                  </span>
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-xs tracking-[-0.02em] mb-6">
                  Tu entrenador personal impulsado por IA. Rocco está disponible
                  24/7 para ayudarte a alcanzar tus objetivos.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Genera planes de entrenamiento personalizados",
                    "Crea planes nutricionales adaptados a ti",
                    "Estima calorías y macros automáticamente",
                    "Responde tus preguntas en tiempo real",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <HugeiconsIcon
                          icon={CheckmarkBadge02Icon}
                          className="w-4 h-4 text-zinc-700 dark:text-zinc-300"
                        />
                      </div>
                      <span className="text-xs tracking-[-0.02em] text-zinc-700 dark:text-zinc-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  size="default"
                  className="backdrop-blur-xl bg-zinc-900/90 dark:bg-zinc-100/90 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-xl w-fit"
                  asChild
                >
                  <Link href="/auth/signup">Prueba Rocco gratis</Link>
                </Button>
              </div>

              {/* Right: Visual */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="w-64 h-64 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-white/80 to-zinc-100/80 dark:from-black/80 dark:to-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl flex items-center justify-center">
                    <HugeiconsIcon
                      icon={Robot01Icon}
                      className="w-32 h-32 text-zinc-700 dark:text-zinc-300"
                    />
                  </div>
                  {/* Floating badges */}
                  <div className="absolute -top-4 -right-4 backdrop-blur-xl bg-white/90 dark:bg-black/90 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl p-3">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon
                        icon={FireIcon}
                        className="w-5 h-5 text-orange-500"
                      />
                      <span className="text-xs font-semibold">IA Avanzada</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -left-4 backdrop-blur-xl bg-white/90 dark:bg-black/90 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl p-3">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon
                        icon={BubbleChatIcon}
                        className="w-5 h-5 text-blue-500"
                      />
                      <span className="text-xs font-semibold">
                        24/7 Disponible
                      </span>
                    </div>
                  </div>
                </div>
              </div>
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
                icon: Robot01Icon,
                title: "Rocco - Tu Entrenador IA",
                desc: "Asistente inteligente que genera planes y responde tus preguntas 24/7",
              },
              {
                icon: Apple01Icon,
                title: "Nutrición con IA",
                desc: "Tracking automático de calorías y macros con estimación inteligente",
              },
              {
                icon: Target02Icon,
                title: "Planes Personalizados",
                desc: "Entrenamientos y dietas adaptados a tus objetivos específicos",
              },
              {
                icon: ChartAverageIcon,
                title: "Seguimiento Avanzado",
                desc: "Analíticas detalladas con gráficos interactivos en tiempo real",
              },
              {
                icon: UserGroupIcon,
                title: "Entrenadores Certificados",
                desc: "Conecta con profesionales expertos para coaching personalizado",
              },
              {
                icon: FireIcon,
                title: "Sistema de Rachas",
                desc: "Mantén tu motivación con seguimiento inteligente de progreso",
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

      {/* How It Works - Step by Step */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border-zinc-300/50 dark:border-zinc-700/50 mb-4"
            >
              Cómo Funciona
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.04em] mb-4">
              <span className="bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
                Empieza en 3 pasos
              </span>
            </h2>
            <p className="text-xs sm:text-xs text-zinc-600 dark:text-zinc-400 tracking-[-0.02em] max-w-2xl mx-auto">
              Comienza tu transformación hoy mismo
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: "1",
                title: "Crea tu cuenta",
                desc: "Regístrate gratis y completa tu perfil con tus objetivos y preferencias",
              },
              {
                step: "2",
                title: "Obtén tu plan",
                desc: "Rocco AI genera un plan personalizado de entrenamiento y nutrición para ti",
              },
              {
                step: "3",
                title: "Alcanza tus metas",
                desc: "Sigue tu progreso, ajusta tu plan y celebra cada logro en el camino",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative backdrop-blur-xl bg-white/40 dark:bg-black/40 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 p-6 sm:p-8 hover:bg-white/60 dark:hover:bg-black/60 transition-all duration-300"
              >
                <div className="absolute -top-4 left-6 w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-700 dark:from-zinc-100 dark:to-zinc-300 flex items-center justify-center shadow-xl">
                  <span className="text-2xl font-bold text-zinc-50 dark:text-zinc-900">
                    {item.step}
                  </span>
                </div>
                <div className="mt-6">
                  <h3 className="font-bold text-xl sm:text-2xl tracking-[-0.04em] mb-3 text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-xs tracking-[-0.02em] text-zinc-600 dark:text-zinc-400">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border-zinc-300/50 dark:border-zinc-700/50 mb-4"
            >
              Beneficios
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.04em] mb-4">
              <span className="bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
                ¿Por qué GymRat+?
              </span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                icon: Time01Icon,
                title: "Ahorra Tiempo",
                desc: "No más horas investigando rutinas o calculando calorías. Rocco AI lo hace por ti en segundos.",
              },
              {
                icon: Award01Icon,
                title: "Resultados Reales",
                desc: "Planes basados en ciencia deportiva y nutrición, adaptados específicamente a tu cuerpo y objetivos.",
              },
              {
                icon: CloudIcon,
                title: "Siempre Contigo",
                desc: "Accede desde cualquier dispositivo. Tu progreso se sincroniza automáticamente en la nube.",
              },
              {
                icon: ChartIcon,
                title: "Evoluciona Contigo",
                desc: "Tus planes se ajustan automáticamente según tu progreso y cambios en tus objetivos.",
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className="group backdrop-blur-xl bg-white/40 dark:bg-black/40 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 p-6 sm:p-8 hover:bg-white/60 dark:hover:bg-black/60 transition-all duration-300 hover:shadow-2xl hover:shadow-zinc-900/10 dark:hover:shadow-zinc-100/10 hover:-translate-y-1 hover:border-zinc-300/80 dark:hover:border-zinc-700/80"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-zinc-900/10 dark:shadow-zinc-100/10">
                    <HugeiconsIcon
                      icon={benefit.icon}
                      className="w-5 h-5 text-zinc-700 dark:text-zinc-300"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg sm:text-xl tracking-[-0.04em] mb-2 text-zinc-900 dark:text-zinc-100">
                      {benefit.title}
                    </h3>
                    <p className="text-xs sm:text-xs tracking-[-0.02em] text-zinc-600 dark:text-zinc-400">
                      {benefit.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border-zinc-300/50 dark:border-zinc-700/50 mb-4"
            >
              FAQ
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.04em] mb-4">
              <span className="bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
                Preguntas Frecuentes
              </span>
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "¿Necesito experiencia previa en el gimnasio?",
                a: "No, GymRat+ es perfecto para principiantes y expertos. Los planes se adaptan a tu nivel de experiencia.",
              },
              {
                q: "¿Qué hace diferente a Rocco AI?",
                a: "Rocco usa inteligencia artificial avanzada para crear planes personalizados basados en tus objetivos, experiencia y preferencias. Además, está disponible 24/7 para responder tus preguntas.",
              },
              {
                q: "¿Puedo usar GymRat+ sin instructor?",
                a: "Sí, la versión PRO incluye acceso completo a Rocco AI para planes personalizados. Los instructores son opcionales para quienes buscan coaching más personalizado.",
              },
              {
                q: "¿Funciona en mi teléfono?",
                a: "Sí, GymRat+ funciona en cualquier dispositivo con navegador web. También puedes instalarlo como app en iOS y Android.",
              },
              {
                q: "¿Puedo cancelar mi suscripción?",
                a: "Sí, puedes cancelar en cualquier momento desde tu perfil. No hay contratos ni penalizaciones.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="backdrop-blur-xl bg-white/40 dark:bg-black/40 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 p-5 sm:p-6 hover:bg-white/60 dark:hover:bg-black/60 transition-all duration-300"
              >
                <h3 className="font-bold text-xs sm:text-xs tracking-[-0.04em] mb-2 text-zinc-900 dark:text-zinc-100">
                  {faq.q}
                </h3>
                <p className="text-xs sm:text-xs tracking-[-0.02em] text-zinc-600 dark:text-zinc-400">
                  {faq.a}
                </p>
              </div>
            ))}
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
                price: "$37.700",
                features: [
                  "Todo en Gratis",
                  "Chat con Rocco IA",
                  "Planes personalizados con IA",
                  "Tracking nutricional IA",
                  "Chat con instructores",
                ],
                popular: true,
              },
              {
                name: "Instructor",
                price: "$74.500",
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
                    src={
                      currentTheme === "dark"
                        ? "/icons/logo-dark.png"
                        : "/icons/logo-light.png"
                    }
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
            {/* Social Media Links */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <a
                href="https://instagram.com/gymratplus"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full backdrop-blur-xl bg-white/60 dark:bg-black/60 border border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-center hover:bg-white/80 dark:hover:bg-black/80 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
                aria-label="Instagram"
              >
                <HugeiconsIcon
                  icon={InstagramIcon}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-700 dark:text-zinc-300"
                />
              </a>
              <a
                href="https://tiktok.com/@gymratplus"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full backdrop-blur-xl bg-white/60 dark:bg-black/60 border border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-center hover:bg-white/80 dark:hover:bg-black/80 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
                aria-label="TikTok"
              >
                <HugeiconsIcon
                  icon={TiktokIcon}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-700 dark:text-zinc-300"
                />
              </a>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 mb-3">
              <Link
                href="/privacy"
                className="text-xs sm:text-xs tracking-[-0.02em] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Política de Privacidad
              </Link>
              <span className="hidden sm:inline text-zinc-400 dark:text-zinc-600">
                •
              </span>
              <Link
                href="/terms"
                className="text-xs sm:text-xs tracking-[-0.02em] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Términos de Servicio
              </Link>
            </div>
            <p className="text-xs sm:text-xs tracking-[-0.02em] text-zinc-600 dark:text-zinc-400">
              © 2025 GymRat+. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* iOS Install Prompt */}
      {showIOSPrompt && (
        <IOSInstallPrompt onClose={() => setShowIOSPrompt(false)} />
      )}

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
    </div>
  );
}
