"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";

export default function PaymentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!session?.user) {
      toast.error("Debes iniciar sesión");
      router.push("/auth/signin");
      return;
    }

    // Check if user already has an active subscription
    const user = session.user as any;
    if (
      user?.subscriptionStatus === "active" ||
      user?.subscriptionStatus === "trialing"
    ) {
      toast.error("Ya tienes una suscripción activa", {
        description: "Ve a Billing para gestionar tu suscripción",
      });
      router.push("/dashboard/profile/billing");
      return;
    }

    // Redirect to instructor registration for instructor plan
    if (planId === "instructor") {
      router.push("/dashboard/profile/billing/instructor-register");
      return;
    }

    // Redirect to free plan (no payment needed)
    if (planId === "free") {
      toast.info("Ya tienes el plan gratuito");
      return;
    }

    // Process Pro plan payment
    setLoading(planId);

    try {
      const response = await fetch("/api/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Error al procesar el pago", {
          description: data.details
            ? `Detalles: ${JSON.stringify(data.details)}`
            : undefined,
        });
        return;
      }

      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        toast.error("No se recibió URL de aprobación de PayPal");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al procesar el pago",
      );
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      id: "free",
      name: "Gratis",
      price: "$0",
      period: "/mes",
      features: ["Entrenamientos básicos", "Seguimiento de peso", "Comunidad"],
      tier: "FREE",
      disabled: true,
    },
    {
      id: "pro",
      name: "Pro",
      price: "$9.99",
      period: "/mes",
      features: [
        "Todo en Gratis",
        "Planes personalizados",
        "Nutrición IA",
        "Chat con instructores",
      ],
      popular: true,
      tier: "PRO",
    },
    {
      id: "instructor",
      name: "Instructor",
      price: "$19.99",
      period: "/mes",
      features: [
        "Todo en Pro",
        "Gestión de estudiantes",
        "Planes ilimitados",
        "Analíticas avanzadas",
      ],
      tier: "INSTRUCTOR",
    },
  ];

  return (
    <div className="">
      {/* Back Button */}
      <div className="mb-8">
        <Button variant="outline" asChild className="w-full md:w-auto text-xs">
          <Link href="/dashboard/profile">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
            Volver al perfil
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-semibold tracking-heading">
            Elige tu Plan
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Selecciona el plan que mejor se adapte a tus necesidades
          </CardDescription>
        </CardHeader>
        <CardContent className="py-0 md:py-12">
          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan, i) => {
              const isDisabled = plan.disabled;

              return (
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
                  <div className="mb-6">
                    <h3
                      className={`text-2xl font-bold mb-2 ${plan.popular
                        ? "text-zinc-100 dark:text-zinc-900"
                        : "text-zinc-900 dark:text-zinc-100"
                        }`}
                    >
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-4xl font-bold ${plan.popular
                          ? "text-zinc-100 dark:text-zinc-900"
                          : "text-zinc-900 dark:text-zinc-100"
                          }`}
                      >
                        {plan.price}
                      </span>
                      <span
                        className={`text-sm ${plan.popular
                          ? "text-zinc-400 dark:text-zinc-600"
                          : "text-zinc-600 dark:text-zinc-400"
                          }`}
                      >
                        {plan.period}
                      </span>
                    </div>
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
                    disabled={isDisabled || loading !== null}
                    onClick={() => !isDisabled && handleSubscribe(plan.id)}
                  >
                    {loading === plan.id
                      ? "Procesando..."
                      : isDisabled
                        ? "Plan Actual"
                        : "Comenzar"}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
