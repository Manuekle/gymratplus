"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { Loader2, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!session?.user) {
      toast.error("Debes iniciar sesión");
      router.push("/auth/signin");
      return;
    }

    setLoading(planId);

    try {
      const planTypeMap: Record<string, string> = {
        pro: "monthly",
        instructor: "annual",
      };

      const response = await fetch("/api/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType: planTypeMap[planId],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar el pago");
      }

      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        throw new Error("No se recibió URL de aprobación");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al procesar la suscripción",
      );
      setLoading(null);
    }
  };

  const currentTier = (session?.user as any)?.subscriptionTier || "FREE";

  return (
    <div className="">
      {/* Back Button */}
      <div className="mb-8">
        <Button variant="outline" asChild className="w-full md:w-auto text-xs">
          <Link href="/dashboard/profile">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al perfil
          </Link>
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {[
          {
            id: "free",
            name: "Gratis",
            price: "$0",
            features: [
              "Entrenamientos básicos",
              "Seguimiento de peso",
              "Comunidad",
            ],
            tier: "FREE",
            disabled: true,
          },
          {
            id: "pro",
            name: "Pro",
            price: "$9.99",
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
            features: [
              "Todo en Pro",
              "Gestión de estudiantes",
              "Planes ilimitados",
              "Analíticas avanzadas",
            ],
            tier: "INSTRUCTOR",
          },
        ].map((plan, i) => {
          const isCurrentPlan = currentTier === plan.tier;
          const isDisabled = plan.disabled || isCurrentPlan;

          return (
            <div
              key={i}
              className={`relative p-8 rounded-xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                plan.popular
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
                className={`text-2xl font-bold tracking-[-0.04em] mb-2 ${
                  plan.popular
                    ? "text-zinc-100 dark:text-zinc-900"
                    : "text-zinc-900 dark:text-zinc-100"
                }`}
              >
                {plan.name}
              </h3>
              <div
                className={`text-4xl font-bold tracking-[-0.04em] mb-6 ${
                  plan.popular
                    ? "text-zinc-100 dark:text-zinc-900"
                    : "text-zinc-900 dark:text-zinc-100"
                }`}
              >
                {plan.price}
                <span
                  className={`text-xs font-normal ${
                    plan.popular
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
                      className={`w-5 h-5 ${
                        plan.popular
                          ? "text-zinc-300 dark:text-zinc-700"
                          : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    />
                    <span
                      className={`text-xs tracking-[-0.02em] ${
                        plan.popular
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
                className={`w-full ${
                  plan.popular
                    ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    : "bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                }`}
                disabled={isDisabled || loading !== null}
                onClick={() => !isDisabled && handleSubscribe(plan.id)}
              >
                {loading === plan.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : isCurrentPlan ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Plan Actual
                  </>
                ) : (
                  "Comenzar"
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
