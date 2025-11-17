"use client";

import { useState, useEffect } from "react";
import { differenceInDays } from "date-fns";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, BedIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { toast } from "sonner";

interface WorkoutReminderAlertProps {
  lastWorkoutAt: Date | string | null;
  onDismiss?: () => void;
  onRestDayMarked?: () => void;
}

// Obtener los días de la semana en español
const getWeekDays = () => {
  return ["L", "M", "M", "J", "V", "S", "D"];
};

// Calcular qué días están activos (últimos N días desde hoy)
const getActiveDays = (streak: number) => {
  const today = new Date();
  const activeDays = [];

  for (let i = streak - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    // Convertir a formato L, M, M, J, V, S, D (Lunes = 1)
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    activeDays.push(dayIndex);
  }

  return activeDays;
};

export function WorkoutReminderAlert({
  lastWorkoutAt,
  onDismiss,
  onRestDayMarked,
}: WorkoutReminderAlertProps) {
  const { data: session } = useSession();
  const [daysSinceLastWorkout, setDaysSinceLastWorkout] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(true);
  const [trainingFrequency, setTrainingFrequency] = useState<number>(3);
  const [isMarkingRestDay, setIsMarkingRestDay] = useState(false);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [notificationCreated, setNotificationCreated] = useState(false);
  const [hasCompletedWorkouts, setHasCompletedWorkouts] =
    useState<boolean>(false);

  useEffect(() => {
    // Obtener trainingFrequency del perfil del usuario
    const fetchTrainingFrequency = async () => {
      if (session?.user) {
        // Intentar obtener desde la sesión primero
        const profile = (
          session.user as { profile?: { trainingFrequency?: number } }
        )?.profile;
        if (profile?.trainingFrequency) {
          setTrainingFrequency(Number(profile.trainingFrequency));
        }
      }

      // Si no está en la sesión, obtener desde la API
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const profileData = await response.json();
          if (profileData?.trainingFrequency) {
            setTrainingFrequency(Number(profileData.trainingFrequency));
          }
        }
      } catch (error) {
        console.error("Error al obtener trainingFrequency:", error);
      }
    };

    fetchTrainingFrequency();
  }, [session]);

  useEffect(() => {
    // Verificar si el usuario tiene entrenamientos completados
    const checkCompletedWorkouts = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch("/api/workout-session/history");
          if (response.ok) {
            const sessions = await response.json();
            const completedSessions = Array.isArray(sessions)
              ? sessions.filter(
                  (s: { completed?: boolean }) => s.completed === true,
                )
              : [];
            setHasCompletedWorkouts(completedSessions.length > 0);
          }
        } catch (error) {
          console.error("Error al verificar entrenamientos:", error);
        }
      }
    };

    checkCompletedWorkouts();
  }, [session]);

  useEffect(() => {
    // Obtener la racha actual
    const fetchStreak = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(
            `/api/workout-streak?userId=${session.user.id}`,
          );
          if (response.ok) {
            const data = await response.json();
            setCurrentStreak(data.currentStreak || 0);
          }
        } catch (error) {
          console.error("Error al obtener la racha:", error);
        }
      }
    };

    fetchStreak();
  }, [session]);

  useEffect(() => {
    if (!lastWorkoutAt) {
      setDaysSinceLastWorkout(999); // Nunca ha entrenado
      return;
    }

    const lastWorkoutDate = new Date(lastWorkoutAt);
    lastWorkoutDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = differenceInDays(today, lastWorkoutDate);
    setDaysSinceLastWorkout(Math.max(0, days)); // Asegurar que nunca sea negativo
  }, [lastWorkoutAt]);

  useEffect(() => {
    // Crear notificación cuando se muestra la alerta (solo una vez por día)
    const createNotification = async () => {
      if (!isVisible || !session?.user?.id || notificationCreated) return;

      const allowedRestDays = 7 - trainingFrequency;
      if (daysSinceLastWorkout <= allowedRestDays) return;

      try {
        // Verificar si ya existe una notificación del mismo tipo hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const checkResponse = await fetch("/api/notifications");
        if (checkResponse.ok) {
          const notifications = (await checkResponse.json()) as Array<{
            createdAt: string;
            type: string;
            title: string;
          }>;
          const todayNotifications = notifications.filter((n) => {
            const notifDate = new Date(n.createdAt);
            notifDate.setHours(0, 0, 0, 0);
            return (
              notifDate.getTime() === today.getTime() &&
              n.type === "workout" &&
              (n.title.includes("motivación") ||
                n.title.includes("Última oportunidad") ||
                n.title.includes("Recordatorio de entrenamiento"))
            );
          });

          if (todayNotifications.length > 0) {
            console.log(
              "Ya existe una notificación de recordatorio de entrenamiento hoy, no se creará otra",
            );
            setNotificationCreated(true);
            return;
          }
        }

        const title =
          daysSinceLastWorkout > allowedRestDays + 2
            ? "¿Necesitas motivación?"
            : daysSinceLastWorkout === allowedRestDays + 2
              ? "⚠️ Última oportunidad"
              : "Recordatorio de entrenamiento";

        const message =
          daysSinceLastWorkout > allowedRestDays + 2
            ? "¿No quieres entrenar hoy? Te falta motivación. ¡Tú puedes hacerlo! 💪"
            : daysSinceLastWorkout === allowedRestDays + 2
              ? "Has excedido tus días de descanso permitidos. Si no entrenas hoy, perderás tu racha."
              : `Has usado todos tus días de descanso permitidos (${allowedRestDays} días). Si no entrenas hoy, perderás tu racha.`;

        const response = await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            message,
            type: "workout",
          }),
        });

        if (response.ok) {
          setNotificationCreated(true);
          console.log("Notificación de recordatorio de entrenamiento creada");
        }
      } catch (error) {
        console.error("Error al crear notificación:", error);
      }
    };

    createNotification();
  }, [
    isVisible,
    daysSinceLastWorkout,
    trainingFrequency,
    session,
    notificationCreated,
  ]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleMarkRestDay = async () => {
    setIsMarkingRestDay(true);
    try {
      const response = await fetch("/api/workout-streak/rest-day", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Error al marcar día de descanso");
      }

      toast.success("Día de descanso registrado", {
        description: "Tu racha se mantiene activa. ¡Descansa bien!",
      });

      setIsVisible(false);
      if (onRestDayMarked) {
        onRestDayMarked();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al marcar día de descanso");
    } finally {
      setIsMarkingRestDay(false);
    }
  };

  // Calcular días de descanso permitidos
  const allowedRestDays = 7 - trainingFrequency;

  // No mostrar alerta si el usuario no tiene entrenamientos completados
  if (!hasCompletedWorkouts) {
    return null;
  }

  // Verificar si está en el día crítico (día crítico = allowedRestDays + 1)
  const isCriticalDay = daysSinceLastWorkout === allowedRestDays + 1;

  // No mostrar esta alerta si está en el día crítico (se muestra el StreakRiskAlert en su lugar)
  if (isCriticalDay) {
    return null;
  }

  // Solo mostrar alerta si se excedieron los días de descanso permitidos
  if (!isVisible || daysSinceLastWorkout <= allowedRestDays) {
    return null;
  }

  // El botón de "Día de descanso" solo aparece el primer día después de los permitidos
  const canMarkRestDay = daysSinceLastWorkout === allowedRestDays + 1;

  const getMessage = () => {
    if (daysSinceLastWorkout > allowedRestDays + 2) {
      // Mensajes motivacionales cuando se pasa de más días
      const motivationalMessages = [
        "¿No quieres entrenar hoy? Te falta motivación. ¡Tú puedes hacerlo! 💪",
        "Cada día que pasa sin entrenar es un paso atrás. ¡Vuelve a la acción! 🔥",
        "Tu futuro yo te agradecerá por entrenar hoy. ¡No te rindas! ⚡",
        "La disciplina es elegir entre lo que quieres ahora y lo que quieres más. ¡Entrena hoy! 🏆",
        "Un día de entrenamiento puede cambiar tu semana. ¡Hazlo ahora! 💎",
      ];
      const randomMessage =
        motivationalMessages[
          Math.floor(Math.random() * motivationalMessages.length)
        ];
      return randomMessage;
    } else if (daysSinceLastWorkout === allowedRestDays + 2) {
      return "Has excedido tus días de descanso permitidos. Si no entrenas hoy, perderás tu racha. ¡No dejes que se enfríe tu progreso!";
    } else {
      // Primer día después de los permitidos
      return `Has usado todos tus días de descanso permitidos (${allowedRestDays} días). Si no entrenas hoy, perderás tu racha. ¡Mantén tu progreso activo!`;
    }
  };

  const getTitle = () => {
    if (daysSinceLastWorkout > allowedRestDays + 2) {
      return "¿Necesitas motivación?";
    } else if (daysSinceLastWorkout === allowedRestDays + 2) {
      return "⚠️ Última oportunidad";
    } else {
      return "Recordatorio de entrenamiento";
    }
  };

  const weekDays = getWeekDays();
  const activeDays = getActiveDays(currentStreak);
  // Racha en gris (sin color)
  const streakColor = {
    dayColor: "bg-gray-400",
    svgFilter: "saturate(0.8) brightness(0.9) grayscale(0.5)",
    filter: "saturate(0.8) brightness(0.9)",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-sm w-full p-8 relative"
            >
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 h-6 w-6 p-0"
                onClick={handleDismiss}
              >
                <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
              </Button>

              <div className="text-center space-y-6">
                {/* Large Fire Icon - en gris */}
                <div className="relative flex justify-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative"
                  >
                    <Image
                      src="/svg/streak.svg"
                      alt="Racha"
                      width={120}
                      height={120}
                      className="w-30 h-30"
                      style={{
                        filter: streakColor.svgFilter,
                      }}
                    />
                  </motion.div>
                </div>

                {/* Week Days */}
                <div className="flex justify-center gap-1.5">
                  {weekDays.map((day, index) => {
                    const isActive = activeDays.includes(index);
                    return (
                      <div
                        key={index}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                          isActive
                            ? `${streakColor.dayColor} text-white shadow-md`
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>

                {/* Title and Message */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold tracking-heading text-zinc-900 dark:text-white">
                    {getTitle()}
                  </h2>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {getMessage()}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2">
                  {canMarkRestDay && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleMarkRestDay}
                      disabled={isMarkingRestDay}
                    >
                      <HugeiconsIcon icon={BedIcon} className="h-4 w-4 mr-2" />
                      {isMarkingRestDay ? "Registrando..." : "Día de descanso"}
                    </Button>
                  )}
                  <Link href="/dashboard/workout/active" className="w-full">
                    <Button className="w-full">Iniciar entrenamiento</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
