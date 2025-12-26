"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStreakAlert } from "@/providers/streak-alert-provider";
import { isStreakAdmin } from "@/lib/actions/admin";
import { FireIcon, Alert02Icon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function AdminStreakTester() {
  const [isVisible, setIsVisible] = useState(false);
  const { showStreakAlert, showStreakRiskAlert } = useStreakAlert();

  useEffect(() => {
    isStreakAdmin().then(setIsVisible);
  }, []);

  if (!isVisible) return null;

  return (
    <Card className="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={FireIcon} className="h-5 w-5 text-orange-500" />
          <CardTitle className="text-lg text-orange-700 dark:text-orange-400">
            Admin: Test de Rachas
          </CardTitle>
        </div>
        <CardDescription>
          Herramientas para probar las animaciones de racha. Solo visible para
          el admin configurado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => showStreakAlert(1)}
            className="justify-start"
          >
            <HugeiconsIcon
              icon={FireIcon}
              className="h-4 w-4 mr-2 text-indigo-500"
            />
            Test Racha Día 1
          </Button>

          <Button
            variant="outline"
            onClick={() => showStreakAlert(5)}
            className="justify-start"
          >
            <HugeiconsIcon
              icon={FireIcon}
              className="h-4 w-4 mr-2 text-cyan-500"
            />
            Test Racha Día 5
          </Button>

          <Button
            variant="outline"
            onClick={() => showStreakAlert(10)}
            className="justify-start"
          >
            <HugeiconsIcon
              icon={FireIcon}
              className="h-4 w-4 mr-2 text-lime-500"
            />
            Test Milestone 10 Días
          </Button>

          <Button
            variant="outline"
            onClick={() => showStreakAlert(100)}
            className="justify-start"
          >
            <HugeiconsIcon
              icon={StarIcon}
              className="h-4 w-4 mr-2 text-yellow-500"
            />
            Test Racha 100 Días
          </Button>

          <Button
            variant="outline"
            onClick={() => showStreakRiskAlert(5, 2)}
            className="justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            <HugeiconsIcon icon={Alert02Icon} className="h-4 w-4 mr-2" />
            Test Alerta Riesgo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
