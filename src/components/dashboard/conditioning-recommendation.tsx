"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BatteryCharging01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { toast } from "sonner";

export default function ConditioningRecommendation() {
  const [status, setStatus] = useState<{
    recommended: boolean;
    reason: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/conditioning/status");
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);

  if (loading || !status?.recommended) return null;

  const title =
    status.reason === "new_user"
      ? "¡Bienvenido a GymRat+!"
      : "¡Bienvenido de vuelta!";

  const description =
    status.reason === "new_user"
      ? "Hemos detectado que eres nuevo. Te recomendamos empezar con un plan de adaptación."
      : "Ha pasado un tiempo desde tu último entreno. Recupera el ritmo con una rutina suave.";

  const handleStart = () => {
    toast.success("Rutina de Acondicionamiento asignada (Demo)");
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-muted">
              <HugeiconsIcon
                icon={BatteryCharging01Icon}
                className="h-5 w-5"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {description}
              </p>
            </div>
          </div>
          <Button
            onClick={handleStart}
            size="sm"
            variant="default"
          >
            Iniciar
            <HugeiconsIcon icon={ArrowRight01Icon} className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
