"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStreakAlert } from "@/providers/streak-alert-provider";

export function StreakSimulator() {
  const [streakValue, setStreakValue] = useState(4);
  const { showStreakAlert } = useStreakAlert();

  const handleShowAnimation = () => {
    if (streakValue > 0) {
      showStreakAlert(streakValue);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold tracking-heading">
          Simulador de Racha
        </CardTitle>
        <CardDescription className="text-xs">
          Prueba la animación de la racha con diferentes valores
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="streak-input">Días de racha</Label>
          <Input
            id="streak-input"
            type="number"
            min="1"
            max="100"
            value={streakValue}
            onChange={(e) =>
              setStreakValue(Number.parseInt(e.target.value) || 1)
            }
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setStreakValue(Math.max(1, streakValue - 1))}
            variant="outline"
            size="sm"
          >
            -1
          </Button>
          <Button
            onClick={() => setStreakValue(Math.min(100, streakValue + 1))}
            variant="outline"
            size="sm"
          >
            +1
          </Button>
          <Button
            onClick={() => setStreakValue(10)}
            variant="outline"
            size="sm"
          >
            10
          </Button>
          <Button
            onClick={() => setStreakValue(20)}
            variant="outline"
            size="sm"
          >
            20
          </Button>
          <Button
            onClick={() => setStreakValue(30)}
            variant="outline"
            size="sm"
          >
            30
          </Button>
        </div>
        <Button onClick={handleShowAnimation} className="w-full">
          Ver Animación
        </Button>
      </CardContent>
    </Card>
  );
}
