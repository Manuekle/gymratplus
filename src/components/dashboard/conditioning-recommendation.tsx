"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, ArrowRight, BatteryCharging } from "lucide-react";
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
    <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none shadow-lg mb-6">
      <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <BatteryCharging className="h-6 w-6 text-yellow-300" />
            {title}
          </h3>
          <p className="text-indigo-100 max-w-lg">{description}</p>
        </div>
        <Button
          onClick={handleStart}
          variant="secondary"
          className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold shrink-0"
        >
          Iniciar Acondicionamiento
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
