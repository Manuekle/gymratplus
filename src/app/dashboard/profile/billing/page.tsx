"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BillingHistory } from "@/components/billing/billing-history";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Loading02Icon } from "@hugeicons/core-free-icons";

export default function BillingPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const hasProcessedRef = useRef(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    price: string;
  } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Handle PayPal callback
  useEffect(() => {
    const success = searchParams.get("success");
    const subscriptionId = searchParams.get("subscription_id");
    const canceled = searchParams.get("canceled");

    if (canceled) {
      toast.error("Suscripción cancelada");
      router.replace("/dashboard/profile/billing");
      return;
    }

    if (
      success === "true" &&
      subscriptionId &&
      !processing &&
      !hasProcessedRef.current
    ) {
      hasProcessedRef.current = true;
      setProcessing(true);

      fetch("/api/payment/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      })
        .then((res) => res.json())
        .then(async (data) => {
          if (data.success) {
            toast.success("¡Suscripción activada exitosamente! 🎉", {
              duration: 5000,
            });
            await updateSession();

            // Check if the subscription is for INSTRUCTOR plan
            const planType = searchParams.get("plan_type");
            if (
              planType === "instructor" ||
              data.subscriptionTier === "INSTRUCTOR"
            ) {
              // Hard reload to update session
              window.location.href =
                "/dashboard/profile/billing/instructor-register";
            } else {
              // Hard reload to update session
              window.location.href = "/dashboard";
            }
          } else {
            throw new Error(data.error || "Error al activar la suscripción");
          }
        })
        .catch((error) => {
          console.error("Error activating subscription:", error);
          toast.error(
            error instanceof Error
              ? error.message
              : "Error al activar la suscripción",
          );
          hasProcessedRef.current = false;
        })
        .finally(() => {
          setProcessing(false);
          router.replace("/dashboard/profile/billing");
        });
    }
  }, [searchParams, processing, router, updateSession]);

  const handleSubscribe = async (planId: string) => {
    if (!session?.user) {
      toast.error("Debes iniciar sesión");
      router.push("/auth/signin");
      return;
    }

    setLoading(planId);

    try {
      // Send plan ID directly since both are monthly subscriptions
      const planType = planId; // 'pro' or 'instructor'

      if (!planType || !["pro", "instructor"].includes(planType)) {
        toast.error("Plan inválido");
        return;
      }

      const response = await fetch("/api/payment/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planType,
          userId: session.user.id,
          userEmail: session.user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data.message || data.error || data.details || "Error desconocido";

        console.error("Error del servidor:", {
          status: response.status,
          error: data.error,
          message: data.message,
          details: data.details,
          planId: data.planId,
        });

        toast.error(`Error al crear la suscripción: ${errorMessage}`, {
          duration: 10000,
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

  const handleCancelSubscription = async () => {
    setLoading("cancel");
    try {
      const response = await fetch("/api/payment/cancel", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cancelar la suscripción");
      }

      toast.success("Suscripción cancelada correctamente");
      window.location.reload();
      await updateSession();
      setShowCancelDialog(false);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al cancelar la suscripción",
      );
    } finally {
      setLoading(null);
    }
  };

  const getCurrentTier = (): string => {
    const user = session?.user as any;

    // Use subscriptionTier as the primary source of truth
    if (user?.subscriptionTier) {
      return user.subscriptionTier;
    }

    // Fallback for legacy data: check if user is instructor
    if (user?.isInstructor) {
      return "INSTRUCTOR";
    }

    // Default to FREE
    return "FREE";
  };

  const currentTier = getCurrentTier();

  const plans = [
    {
      id: "free",
      name: "Gratis",
      price: "$0",
      description: "Plan básico gratuito.",
      tier: "FREE",
      disabled: true,
    },
    {
      id: "pro",
      name: "Pro",
      price: "$9.99",
      description: "Plan profesional mensual.",
      tier: "PRO",
    },
    {
      id: "instructor",
      name: "Instructor",
      price: "$19.99",
      description: "Plan completo para instructores.",
      tier: "INSTRUCTOR",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex md:flex-row flex-col justify-between w-full items-center gap-2">
        <Button
          variant="outline"
          className="text-xs w-full md:w-auto"
          size="default"
          onClick={() => router.push("/dashboard/profile")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
          Volver a perfil
        </Button>
      </div>

      <Card className="w-full overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold tracking-heading">
            Planes
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Elige el plan que mejor se ajuste a tus necesidades.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {plans.map((plan) => {
              const isCurrentPlan = currentTier === plan.tier;
              const isDisabled = plan.disabled || isCurrentPlan;

              return (
                <Card key={plan.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl tracking-heading font-semibold">
                          {plan.name}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {plan.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4 pt-0">
                    <div className="mb-4">
                      <span className="text-3xl font-semibold">
                        {plan.price}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        /mes
                      </span>
                    </div>
                    <div className="flex flex-row gap-2 items-center justify-between ">
                      <Button
                        className={`w-full dark:text-black ${isCurrentPlan
                          ? "bg-white dark:bg-white text-black hover:bg-zinc-100 border"
                          : "bg-black dark:bg-white text-white hover:bg-zinc-900"
                          }`}
                        size="default"
                        disabled={
                          isDisabled ||
                          loading !== null ||
                          (isCurrentPlan &&
                            session?.user?.subscriptionStatus === "canceled")
                        }
                        onClick={() => {
                          if (!isDisabled) {
                            setSelectedPlan(plan);
                            setShowConfirmDialog(true);
                          }
                        }}
                      >
                        {loading === plan.id ? (
                          <>
                            <HugeiconsIcon
                              icon={Loading02Icon}
                              className="mr-2 h-4 w-4 animate-spin"
                            />
                            Procesando...
                          </>
                        ) : isCurrentPlan ? (
                          session?.user?.subscriptionStatus === "canceled" ? (
                            "Cancelación Pendiente"
                          ) : (
                            "Plan Actual"
                          )
                        ) : (
                          "Cambiar Plan"
                        )}
                      </Button>

                      {isCurrentPlan &&
                        plan.id !== "free" &&
                        session?.user?.subscriptionStatus !== "canceled" && (
                          <Button
                            variant="destructive"
                            size="default"
                            className="w-full text-xs"
                            onClick={() => setShowCancelDialog(true)}
                            disabled={loading !== null}
                          >
                            Cancelar Suscripción
                          </Button>
                        )}
                    </div>

                    {isCurrentPlan &&
                      session?.user?.subscriptionStatus === "canceled" && (
                        <p className="text-xs text-center text-muted-foreground mt-2">
                          Tu acceso finalizará al terminar el periodo actual.
                        </p>
                      )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Billing History */}
          <BillingHistory />
        </CardContent>
      </Card>
      {/* Plans Grid */}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-heading">
              Confirmar cambio de suscripción
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Estás a punto de cambiar tu suscripción al plan{" "}
              {selectedPlan?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Plan:</span>
                <span className="text-xs">{selectedPlan?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Precio:</span>
                <span className="text-xs font-semibold">
                  {selectedPlan?.price}/mes
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">
                  Ciclo de facturación:
                </span>
                <span className="text-xs">Mensual</span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                setSelectedPlan(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowConfirmDialog(false);
                if (selectedPlan) {
                  handleSubscribe(selectedPlan.id);
                }
              }}
              disabled={loading !== null}
            >
              {loading === selectedPlan?.id ? (
                <>
                  <HugeiconsIcon
                    icon={Loading02Icon}
                    className="mr-2 h-4 w-4 animate-spin"
                  />
                  Procesando...
                </>
              ) : (
                "Confirmar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancellation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-heading text-destructive">
              Cancelar Suscripción
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              ¿Estás seguro de que deseas cancelar tu suscripción? Perderás
              acceso a las funciones premium inmediatamente y volverás al plan
              gratuito.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              No, mantener plan
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={loading !== null}
            >
              {loading === "cancel" ? (
                <>
                  <HugeiconsIcon
                    icon={Loading02Icon}
                    className="mr-2 h-4 w-4 animate-spin"
                  />
                  Cancelando...
                </>
              ) : (
                "Sí, cancelar suscripción"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
