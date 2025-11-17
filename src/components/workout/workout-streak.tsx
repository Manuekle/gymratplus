import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

import { useStreakAlert } from "@/providers/streak-alert-provider";

interface WorkoutStreakProps {
  userId: string;
}

interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutAt: Date | null;
  lastRestDayAt: Date | null;
}

const getStreakColor = (streak: number) => {
  // 365+: Blanco brillante / Dorado (temperatura máxima)
  if (streak >= 365) {
    return {
      text: "text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-100 to-white",
      svgFilter:
        "saturate(2.0) brightness(1.8) contrast(1.2) drop-shadow(0 0 10px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 20px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 30px rgba(255, 200, 0, 0.6))",
      filter: "saturate(2.0) brightness(1.8)",
      isRainbow: false,
    };
  }
  // 291-364: Rojo anaranjado / Rojo intenso
  if (streak >= 291)
    return {
      text: "text-red-600 bg-red-500/80 dark:bg-red-600/30 shadow-lg shadow-red-500/20 dark:shadow-red-600/20",
      svgFilter:
        "hue-rotate(0deg) saturate(1.6) brightness(1.3) drop-shadow(0 0 8px rgba(220, 38, 38, 0.9)) drop-shadow(0 0 16px rgba(239, 68, 68, 0.7))",
      filter: "saturate(1.6) brightness(1.3)",
    };
  // 221-290: Naranja
  if (streak >= 221)
    return {
      text: "text-orange-500 bg-orange-500/80 dark:bg-orange-600/30 shadow-lg shadow-orange-500/20 dark:shadow-orange-600/20",
      svgFilter:
        "hue-rotate(5deg) saturate(1.5) brightness(1.25) drop-shadow(0 0 8px rgba(249, 115, 22, 0.8)) drop-shadow(0 0 16px rgba(251, 146, 60, 0.6))",
      filter: "saturate(1.5) brightness(1.25)",
    };
  // 151-220: Amarillo pálido / Amarillo brillante
  if (streak >= 151)
    return {
      text: "text-yellow-400 bg-yellow-500/80 dark:bg-yellow-600/30 shadow-lg shadow-yellow-500/20 dark:shadow-yellow-600/20",
      svgFilter:
        "hue-rotate(30deg) saturate(1.4) brightness(1.2) drop-shadow(0 0 6px rgba(250, 204, 21, 0.7)) drop-shadow(0 0 12px rgba(255, 237, 74, 0.5))",
      filter: "saturate(1.4) brightness(1.2)",
    };
  // 101-150: Verde claro / Lima
  if (streak >= 101)
    return {
      text: "text-lime-400 bg-lime-500/80 dark:bg-lime-600/30 shadow-lg shadow-lime-500/20 dark:shadow-lime-600/20",
      svgFilter:
        "hue-rotate(80deg) saturate(1.3) brightness(1.15) drop-shadow(0 0 6px rgba(163, 230, 53, 0.7)) drop-shadow(0 0 12px rgba(190, 242, 100, 0.5))",
      filter: "saturate(1.3) brightness(1.15)",
    };
  // 51-100: Cian / Turquesa
  if (streak >= 51)
    return {
      text: "text-cyan-400 bg-cyan-500/80 dark:bg-cyan-600/30 shadow-lg shadow-cyan-500/20 dark:shadow-cyan-600/20",
      svgFilter:
        "hue-rotate(175deg) saturate(1.2) brightness(1.1) drop-shadow(0 0 5px rgba(34, 211, 238, 0.6)) drop-shadow(0 0 10px rgba(103, 232, 249, 0.4))",
      filter: "saturate(1.2) brightness(1.1)",
    };
  // 1-50: Azul profundo / Índigo
  if (streak >= 1)
    return {
      text: "text-white bg-indigo-500/80 dark:bg-indigo-600/30 shadow-lg shadow-indigo-500/20 dark:shadow-indigo-600/20",
      svgFilter:
        "hue-rotate(220deg) saturate(1.1) brightness(1.05) drop-shadow(0 0 4px rgba(79, 70, 229, 0.5)) drop-shadow(0 0 8px rgba(99, 102, 241, 0.3))",
      filter: "saturate(1.1) brightness(1.05)",
    };
  // 0: Gris sin racha
  return {
    text: "text-white bg-gray-500/80 dark:bg-gray-600/30 shadow-lg shadow-gray-500/20 dark:shadow-gray-600/20",
    svgFilter: "saturate(0.8) brightness(0.9) grayscale(0.5)",
    filter: "saturate(0.8) brightness(0.9)",
  };
};

export function WorkoutStreak({ userId }: WorkoutStreakProps) {
  const [stats, setStats] = useState<StreakStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showStreakAlert, showStreakRiskAlert } = useStreakAlert();
  const previousStreak = useRef<number>(0);
  const hasShownRiskAlert = useRef<boolean>(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/workout-streak?userId=${userId}`);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Logs de debug
        console.log("=== DEBUG RACHA ===");
        console.log("Usuario ID:", userId);
        console.log("Datos recibidos de la API:", data);
        console.log("Racha actual (currentStreak):", data.currentStreak);
        console.log(
          "Último entrenamiento (lastWorkoutAt):",
          data.lastWorkoutAt,
        );
        console.log(
          "Último día de descanso (lastRestDayAt):",
          data.lastRestDayAt,
        );
        console.log(
          "Total de días entrenados:",
          data.totalWorkoutDays || "N/A",
        );
        console.log("===================");

        const newStreak = data.currentStreak || 0;
        const oldStreak = previousStreak.current;

        // Mostrar alerta cuando la racha cambia a un múltiplo de 10
        // Casos válidos:
        // - 9 -> 10, 19 -> 20, etc. (de no múltiplo a múltiplo)
        // - 10 -> 20, 20 -> 30, etc. (de múltiplo a múltiplo mayor)
        // NO mostrar si:
        // - Es la primera carga (oldStreak === 0) para evitar alertas al recargar
        const isNewMultipleOf10 = newStreak > 0 && newStreak % 10 === 0;
        const streakIncreased = newStreak > oldStreak;

        if (
          streakIncreased && // La racha debe haber aumentado (cambio real)
          isNewMultipleOf10 && // La nueva racha debe ser múltiplo de 10
          oldStreak > 0 // Evitar mostrar en primera carga (previene alerta al recargar)
        ) {
          showStreakAlert(newStreak);
        }

        setStats({
          currentStreak: newStreak,
          longestStreak: data.longestStreak || 0,
          lastWorkoutAt: data.lastWorkoutAt
            ? new Date(data.lastWorkoutAt)
            : null,
          lastRestDayAt: data.lastRestDayAt
            ? new Date(data.lastRestDayAt)
            : null,
        });
        previousStreak.current = newStreak;

        // Verificar si está en el día crítico después de obtener los datos
        // Usar los datos de check-reset para obtener información más precisa
        if (newStreak > 0) {
          try {
            const checkResponse = await fetch(
              "/api/workout-streak/check-reset",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
              },
            );

            const checkResult = await checkResponse.json();
            console.log("🔍 Check result en fetchStats:", checkResult);

            // Si está en el día crítico, mostrar alert
            if (checkResult.isCriticalDay && newStreak > 0) {
              const todayKey = new Date().toDateString();
              const lastShownKey = sessionStorage.getItem(
                "streakRiskAlertShown",
              );

              if (lastShownKey !== todayKey && !hasShownRiskAlert.current) {
                console.log(
                  "✅ Mostrando alert de racha en riesgo desde fetchStats",
                );
                showStreakRiskAlert(
                  newStreak,
                  checkResult.allowedRestDays || 0,
                );
                sessionStorage.setItem("streakRiskAlertShown", todayKey);
                hasShownRiskAlert.current = true;
              }
            }
          } catch (error) {
            console.error("Error checking critical day in fetchStats:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching streak stats:", error);
        // En caso de error, mostrar 0 días
        setStats({
          currentStreak: 0,
          longestStreak: 0,
          lastWorkoutAt: null,
          lastRestDayAt: null,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

    // Verificar y resetear racha si es necesario
    const checkStreak = async () => {
      try {
        // Primero obtener las estadísticas de la racha para verificar el día crítico
        const statsResponse = await fetch(
          `/api/workout-streak?userId=${userId}`,
        );
        const statsData = await statsResponse.json();

        const response = await fetch("/api/workout-streak/check-reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        const result = await response.json();

        console.log("🔍 Check streak result:", result);
        console.log("🔍 Stats data:", statsData);

        // Verificar si está en el día crítico basándose en los datos reales
        // Si tiene racha y está en el día crítico según el cálculo
        const isCritical =
          result.isCriticalDay &&
          (result.currentStreak > 0 || statsData.currentStreak > 0);
        const currentStreakValue =
          result.currentStreak || statsData.currentStreak || 0;
        const allowedRest = result.allowedRestDays || 0;

        console.log("🔍 Is critical day:", isCritical);
        console.log("🔍 Current streak:", currentStreakValue);

        // Si está en el día crítico, mostrar alert y enviar notificación
        if (isCritical && currentStreakValue > 0) {
          // Solo mostrar el alert una vez por día
          const todayKey = new Date().toDateString();
          const lastShownKey = sessionStorage.getItem("streakRiskAlertShown");

          console.log("🔍 Today key:", todayKey);
          console.log("🔍 Last shown key:", lastShownKey);
          console.log("🔍 Has shown current:", hasShownRiskAlert.current);

          if (lastShownKey !== todayKey && !hasShownRiskAlert.current) {
            console.log("✅ Mostrando alert de racha en riesgo");
            showStreakRiskAlert(currentStreakValue, allowedRest);
            sessionStorage.setItem("streakRiskAlertShown", todayKey);
            hasShownRiskAlert.current = true;
          }

          // Enviar notificación si es necesario
          await fetch("/api/workout-streak/check-reset", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          });
        } else {
          // Resetear el flag si ya no está en día crítico
          hasShownRiskAlert.current = false;
        }
      } catch (error) {
        console.error("Error checking streak reset:", error);
      }
    };

    // Verificar reset al cargar y cada hora
    checkStreak();
    const checkInterval = setInterval(checkStreak, 60 * 60 * 1000);

    // Enviar notificaciones críticas cada 2 horas si es necesario
    const sendCriticalNotifications = async () => {
      try {
        await fetch("/api/workout-streak/check-reset", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
      } catch (error) {
        console.error("Error sending critical notifications:", error);
      }
    };

    // Enviar notificaciones críticas cada 2 horas
    sendCriticalNotifications();
    const notificationInterval = setInterval(
      sendCriticalNotifications,
      2 * 60 * 60 * 1000,
    );

    // Actualizar las estadísticas cada minuto
    const statsInterval = setInterval(fetchStats, 60000);

    return () => {
      clearInterval(checkInterval);
      clearInterval(notificationInterval);
      clearInterval(statsInterval);
    };
  }, [userId, showStreakAlert]);

  // Mostrar estado de carga o racha
  if (isLoading || !stats) {
    return (
      <div className="flex items-center space-x-2">
        <Image
          src="/svg/streak.svg"
          alt="Racha"
          width={16}
          height={16}
          className="h-4 w-4 opacity-50 animate-pulse"
          style={{
            filter: "saturate(0.8) brightness(0.9) grayscale(0.5)",
          }}
        />
        <Badge
          variant="secondary"
          className="text-xs text-muted-foreground opacity-50"
        >
          ...
        </Badge>
      </div>
    );
  }

  // Si la racha es 0, mostrar "0 días" en gris
  if (stats.currentStreak === 0) {
    return (
      <div className="flex items-center space-x-2">
        <Image
          src="/svg/streak.svg"
          alt="Racha"
          width={16}
          height={16}
          className="h-4 w-4"
          style={{
            filter: "saturate(0.8) brightness(0.9) grayscale(0.5)",
          }}
        />
        <Badge variant="secondary" className="text-xs text-muted-foreground">
          0 días
        </Badge>
      </div>
    );
  }

  const streakColor = getStreakColor(stats.currentStreak);
  const dayText = stats.currentStreak === 1 ? "día" : "días";

  return (
    <div className="flex items-center space-x-2">
      <Image
        src="/svg/streak.svg"
        alt="Racha"
        width={16}
        height={16}
        className="h-4 w-4"
        style={{
          filter: streakColor.svgFilter,
        }}
      />
      <Badge
        variant="secondary"
        className={`text-xs ${streakColor.text || "text-foreground"}`}
      >
        {stats.currentStreak} {dayText}
      </Badge>
    </div>
  );
}
