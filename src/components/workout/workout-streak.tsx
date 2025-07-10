import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";

import { useStreakAlert } from "@/providers/streak-alert-provider";
import { HugeiconsIcon } from "@hugeicons/react";
import { FireIcon } from "@hugeicons/core-free-icons";

interface WorkoutStreakProps {
  userId: string;
}

interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutAt: Date | null;
  lastRestDayAt: Date | null;
}

export function WorkoutStreak({ userId }: WorkoutStreakProps) {
  const [stats, setStats] = useState<StreakStats | null>(null);
  const { showStreakAlert } = useStreakAlert();
  const previousStreak = useRef<number>(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/workout-streak?userId=${userId}`);
        const data = await response.json();
        setStats(data);

        // Mostrar alerta si la racha ha aumentado y es múltiplo de 10
        if (
          data.currentStreak > previousStreak.current &&
          data.currentStreak % 10 === 0
        ) {
          showStreakAlert(data.currentStreak);
        }

        previousStreak.current = data.currentStreak;
      } catch (error) {
        console.error("Error fetching streak stats:", error);
      }
    };

    fetchStats();

    // Actualizar las estadísticas cada minuto
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [userId, showStreakAlert]);

  if (!stats) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <HugeiconsIcon icon={FireIcon} className="h-4 w-4 text-orange-500" />
      <Badge variant="secondary" className="text-xs">
        {stats.currentStreak} días
      </Badge>
    </div>
  );
}
