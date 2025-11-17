import { prisma } from "@/lib/database/prisma";
import { createNotification } from "@/lib/notifications/notification-service";

export class WorkoutStreakService {
  async getOrCreateStreak(userId: string) {
    // First check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Usar upsert para evitar condiciones de carrera
    // Si el streak ya existe, lo devuelve; si no, lo crea
    const streak = await prisma.workoutStreak.upsert({
      where: { userId },
      update: {}, // No actualizar nada si ya existe
      create: {
        userId,
        currentStreak: 0,
        longestStreak: 0,
      },
    });

    return streak;
  }

  async updateStreak(userId: string, isWorkout: boolean = true) {
    const streak = await this.getOrCreateStreak(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Obtener días de entrenamiento por semana del usuario
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { trainingFrequency: true },
    });

    const trainingFrequency = profile?.trainingFrequency || 3;
    const allowedRestDays = 7 - trainingFrequency; // Días de descanso permitidos

    // Si es un día de descanso
    if (!isWorkout) {
      if (streak.lastRestDayAt?.getTime() === today.getTime()) {
        return streak; // Ya se registró un día de descanso hoy
      }

      // Verificar cuántos días han pasado desde el último entrenamiento
      if (!streak.lastWorkoutAt) {
        // No hay racha activa
        await prisma.workoutStreak.update({
          where: { userId },
          data: {
            lastRestDayAt: today,
          },
        });
        return streak;
      }

      const lastWorkoutDate = new Date(streak.lastWorkoutAt);
      lastWorkoutDate.setHours(0, 0, 0, 0);

      const daysSinceLastWorkout = Math.floor(
        (today.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Si está dentro de los días de descanso permitidos, mantener la racha
      if (daysSinceLastWorkout <= allowedRestDays) {
        await prisma.workoutStreak.update({
          where: { userId },
          data: {
            lastRestDayAt: today,
          },
        });

        await createNotification({
          userId,
          title: "¡Día de descanso registrado!",
          message: `Mantienes tu racha de ${streak.currentStreak} días. ¡Descansa bien!`,
          type: "workout",
        });

        return streak;
      }

      // Si excede los días de descanso permitidos, la racha se resetea
      // (esto se maneja en checkAndResetStreak, pero por seguridad también aquí)
      await prisma.workoutStreak.update({
        where: { userId },
        data: {
          currentStreak: 0,
          lastRestDayAt: today,
        },
      });

      await createNotification({
        userId,
        title: "Racha reiniciada",
        message: `Tu racha se ha reiniciado porque excediste los ${allowedRestDays} días de descanso permitidos. ¡Comienza una nueva racha!`,
        type: "workout",
      });

      return streak;
    }

    // Si es un entrenamiento
    if (streak.lastWorkoutAt?.getTime() === today.getTime()) {
      return streak; // Ya se registró un entrenamiento hoy
    }

    // Calcular días desde el último entrenamiento
    let daysSinceLastWorkout = 0;
    if (streak.lastWorkoutAt) {
      const lastWorkoutDate = new Date(streak.lastWorkoutAt);
      lastWorkoutDate.setHours(0, 0, 0, 0);
      daysSinceLastWorkout = Math.floor(
        (today.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24),
      );
    }

    // Si es el primer entrenamiento o está dentro de los días de descanso permitidos
    if (!streak.lastWorkoutAt || daysSinceLastWorkout <= allowedRestDays + 1) {
      // Si está dentro del límite, continuar la racha
      // Si excedió el límite pero entrena antes de medianoche del día crítico, mantener la racha
      const newStreak = streak.currentStreak + 1;
      const newLongestStreak = Math.max(newStreak, streak.longestStreak);
      const isStreakMilestone = newStreak > 0 && newStreak % 10 === 0;

      await prisma.workoutStreak.update({
        where: { userId },
        data: {
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastWorkoutAt: today,
          lastRestDayAt: null, // Limpiar días de descanso al entrenar
        },
      });

      // Notificación especial para hitos de racha (cada 10 días)
      if (isStreakMilestone) {
        await createNotification({
          userId,
          title: "¡Hito de racha alcanzado! 🔥",
          message: `¡Increíble! Has alcanzado una racha de ${newStreak} días. ¡Sigue así!`,
          type: "workout",
        });
      } else {
        await createNotification({
          userId,
          title: "¡Racha actualizada!",
          message: `¡Llevas ${newStreak} días seguidos entrenando! Tu mejor racha es de ${newLongestStreak} días.`,
          type: "workout",
        });
      }

      return {
        ...streak,
        currentStreak: newStreak,
        showMilestone: isStreakMilestone,
      };
    }

    // Si se rompió la racha (excedió los días de descanso permitidos)
    await prisma.workoutStreak.update({
      where: { userId },
      data: {
        currentStreak: 1,
        lastWorkoutAt: today,
        lastRestDayAt: null,
      },
    });

    await createNotification({
      userId,
      title: "¡Nueva racha!",
      message: "¡Comienza una nueva racha de entrenamiento!",
      type: "workout",
    });

    return streak;
  }

  async getStreakStats(userId: string) {
    try {
      const streak = await this.getOrCreateStreak(userId);

      // Obtener todos los entrenamientos completados del usuario
      const workoutSessions = await prisma.workoutSession.findMany({
        where: {
          userId,
          completed: true,
        },
        orderBy: {
          date: "desc",
        },
        select: {
          date: true,
        },
      });

      // Calcular días únicos entrenados (usar fecha en UTC para evitar problemas de zona horaria)
      const uniqueWorkoutDays = new Set<string>();
      workoutSessions.forEach((session) => {
        const date = new Date(session.date);
        // Usar UTC para evitar problemas de zona horaria
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const day = String(date.getUTCDate()).padStart(2, "0");
        const dateKey = `${year}-${month}-${day}`;
        uniqueWorkoutDays.add(dateKey);
      });

      const totalWorkoutDays = uniqueWorkoutDays.size;
      const lastWorkoutDate = workoutSessions[0]?.date || null;

      // Calcular la racha real basada en días consecutivos de entrenamiento
      // La racha se calcula considerando los días de descanso permitidos
      let calculatedStreak = 0;
      let sortedDays: Date[] = [];
      let allowedRestDays = 0;
      // Usar UTC para la fecha de hoy para ser consistente con las fechas de entrenamiento
      const now = new Date();
      const today = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          0,
          0,
          0,
          0,
        ),
      );

      if (workoutSessions.length > 0) {
        // Obtener trainingFrequency del usuario
        const profile = await prisma.profile.findUnique({
          where: { userId },
          select: { trainingFrequency: true },
        });
        const trainingFrequency = profile?.trainingFrequency || 3;
        allowedRestDays = 7 - trainingFrequency;

        // Ordenar días únicos de entrenamiento de más reciente a más antiguo
        // Usar UTC para evitar problemas de zona horaria
        sortedDays = Array.from(uniqueWorkoutDays)
          .map((d) => {
            // Parsear la fecha YYYY-MM-DD en UTC
            const parts = d.split("-").map(Number);
            if (parts.length !== 3 || parts.some((p) => isNaN(p))) {
              throw new Error(`Invalid date format: ${d}`);
            }
            const year = parts[0]!;
            const month = parts[1]!;
            const day = parts[2]!;
            const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
            return date;
          })
          .sort((a, b) => b.getTime() - a.getTime());

        if (sortedDays.length > 0) {
          // Calcular racha consecutiva desde el día más reciente hacia atrás
          // La racha cuenta los días consecutivos en los que el usuario entrenó,
          // permitiendo días de descanso entre entrenamientos según la frecuencia configurada

          let consecutiveDays = 0;
          let lastWorkoutDate: Date | null = null;

          // Verificar primero si el último entrenamiento está dentro del límite
          const firstWorkoutDate = sortedDays[0];
          if (!firstWorkoutDate) {
            calculatedStreak = 0;
          } else {
            const daysSinceLastWorkout = Math.floor(
              (today.getTime() - firstWorkoutDate.getTime()) /
                (1000 * 60 * 60 * 24),
            );

            const criticalDay = allowedRestDays + 1;

            // Logs detallados para debug
            console.log("--- Análisis de racha ---");
            console.log("Fecha de hoy:", today.toISOString().split("T")[0]);
            console.log(
              "Último entrenamiento:",
              firstWorkoutDate.toISOString().split("T")[0],
            );
            console.log(
              "Días desde último entrenamiento:",
              daysSinceLastWorkout,
            );
            console.log("Días de descanso permitidos:", allowedRestDays);
            console.log("Día crítico (allowedRestDays + 1):", criticalDay);
            console.log(
              `¿Perdió la racha? ${daysSinceLastWorkout > criticalDay ? "SÍ" : "NO"}`,
            );

            // Si el último entrenamiento fue hace más del día crítico (allowedRestDays + 1),
            // la racha se pierde completamente
            if (daysSinceLastWorkout > criticalDay) {
              console.log(
                `⚠️ Racha perdida: Han pasado ${daysSinceLastWorkout} días desde el último entrenamiento, excediendo el límite de ${criticalDay} días`,
              );
              calculatedStreak = 0;
            } else {
              // El último entrenamiento está dentro del límite, contar días consecutivos
              // Empezar desde el día más reciente de entrenamiento
              for (let i = 0; i < sortedDays.length; i++) {
                const workoutDate = sortedDays[i];
                if (!workoutDate) continue;

                if (i === 0) {
                  // Primer día (más reciente) - siempre se cuenta si está dentro del límite
                  consecutiveDays++;
                  lastWorkoutDate = workoutDate;
                } else {
                  // Días siguientes - verificar si están dentro del límite del entrenamiento anterior
                  if (lastWorkoutDate) {
                    const daysBetween = Math.floor(
                      (lastWorkoutDate.getTime() - workoutDate.getTime()) /
                        (1000 * 60 * 60 * 24),
                    );

                    // Si el tiempo entre entrenamientos está dentro de los días permitidos + 1,
                    // continuar la racha
                    // El +1 permite que si entrena día 1, luego descansa día 2-3, y entrena día 4, siga contando
                    if (daysBetween <= allowedRestDays + 1) {
                      consecutiveDays++;
                      lastWorkoutDate = workoutDate;
                    } else {
                      // Se rompió la racha (más de allowedRestDays + 1 días entre entrenamientos)
                      break;
                    }
                  }
                }
              }

              calculatedStreak = consecutiveDays;
            }

            // Logs detallados para debug (dentro del scope donde están las variables)
            console.log("--- Cálculo detallado de racha ---");
            console.log(
              "Días de entrenamiento ordenados:",
              sortedDays.map((d) => d.toISOString().split("T")[0]),
            );
            console.log("Training frequency:", trainingFrequency);
            console.log("Días de descanso permitidos:", allowedRestDays);
            console.log("Día crítico:", criticalDay);
            console.log(
              "Días desde último entrenamiento hasta hoy:",
              daysSinceLastWorkout,
            );
            console.log("Días consecutivos contados:", consecutiveDays);
            console.log("Racha final calculada:", calculatedStreak);
          }

          // Detalle del cálculo día por día
          if (calculatedStreak > 0) {
            console.log("\n📊 Análisis día por día:");
            let tempLastDate: Date | null = null;
            sortedDays.slice(0, calculatedStreak).forEach((date, idx) => {
              if (idx === 0) {
                console.log(
                  `  Día ${idx + 1}: ${date.toISOString().split("T")[0]} (último entrenamiento)`,
                );
                tempLastDate = date;
              } else if (tempLastDate) {
                const daysBetween = Math.floor(
                  (tempLastDate.getTime() - date.getTime()) /
                    (1000 * 60 * 60 * 24),
                );
                console.log(
                  `  Día ${idx + 1}: ${date.toISOString().split("T")[0]} (${daysBetween} días después del anterior)`,
                );
                tempLastDate = date;
              }
            });
          }

          console.log("----------------------------------\n");

          // NO crear notificaciones aquí - se maneja en sendCriticalDayNotifications
          // Solo loguear si está en día crítico para debug
          if (sortedDays.length > 0 && sortedDays[0]) {
            const firstWorkoutDate = sortedDays[0];
            const daysSinceLastWorkout = Math.floor(
              (today.getTime() - firstWorkoutDate.getTime()) /
                (1000 * 60 * 60 * 24),
            );

            if (
              daysSinceLastWorkout === allowedRestDays + 1 &&
              calculatedStreak > 0
            ) {
              console.log(
                `ℹ️ Usuario ${userId} está en día crítico (día ${daysSinceLastWorkout}), racha: ${calculatedStreak}. La notificación se manejará en sendCriticalDayNotifications.`,
              );
            }
          }
        }
      }

      // Si la racha en BD es diferente a la calculada, corregirla
      if (calculatedStreak !== streak.currentStreak) {
        console.log(
          `⚠️ Racha inconsistente detectada. BD: ${streak.currentStreak}, Calculada: ${calculatedStreak}. Corrigiendo...`,
        );

        await prisma.workoutStreak.update({
          where: { userId },
          data: {
            currentStreak: calculatedStreak,
            longestStreak: Math.max(calculatedStreak, streak.longestStreak),
          },
        });

        streak.currentStreak = calculatedStreak;
      }

      // Logs de debug
      console.log("=== DEBUG getStreakStats ===");
      console.log("Usuario ID:", userId);
      console.log("Racha actual en BD:", streak.currentStreak);
      console.log("Racha calculada desde entrenamientos:", calculatedStreak);
      console.log("Último entrenamiento en BD:", streak.lastWorkoutAt);
      console.log(
        "Total de sesiones de entrenamiento:",
        workoutSessions.length,
      );
      console.log("Total de días únicos entrenados:", totalWorkoutDays);
      console.log("Último entrenamiento real:", lastWorkoutDate);
      console.log("Racha final:", streak.currentStreak);
      console.log("=============================");

      return {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastWorkoutAt: streak.lastWorkoutAt?.toISOString() || null,
        lastRestDayAt: streak.lastRestDayAt?.toISOString() || null,
        totalWorkoutDays,
        totalWorkoutSessions: workoutSessions.length,
        lastWorkoutDate: lastWorkoutDate?.toISOString() || null,
        calculatedStreak,
      };
    } catch (error) {
      console.error("Error en getStreakStats:", error);
      throw error;
    }
  }

  async checkAndSendWorkoutReminder(userId: string) {
    // Primero verificar si está en día crítico - si es así, no enviar el recordatorio
    // porque ya se está mostrando el alert de racha en riesgo
    const checkResult = await this.checkAndResetStreak(userId);

    // Si está en día crítico, no enviar el recordatorio normal
    if (checkResult.isCriticalDay && checkResult.currentStreak > 0) {
      return;
    }

    const streak = await this.getOrCreateStreak(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Si no ha entrenado hoy y son más de las 5 PM
    const now = new Date();
    if (
      (!streak.lastWorkoutAt ||
        streak.lastWorkoutAt.getTime() !== today.getTime()) &&
      now.getHours() >= 17 && // 5 PM
      now.getHours() < 21 // 9 PM
    ) {
      // Verificar si ya se envió un recordatorio hoy
      const existingReminder = await prisma.notification.findFirst({
        where: {
          userId,
          type: "workout",
          title: "Recordatorio de entrenamiento",
          createdAt: {
            gte: today,
          },
        },
      });

      // También verificar si hay una notificación de racha en riesgo hoy
      const existingRiskNotification = await prisma.notification.findFirst({
        where: {
          userId,
          type: "workout",
          title: {
            contains: "Racha en riesgo",
          },
          createdAt: {
            gte: today,
          },
        },
      });

      // No enviar recordatorio si hay notificación de racha en riesgo
      if (!existingReminder && !existingRiskNotification) {
        const message =
          streak.currentStreak > 0
            ? `¡No pierdas tu racha de ${streak.currentStreak} días! Aún estás a tiempo de entrenar hoy.`
            : "¡No olvides entrenar hoy! Un nuevo hábito comienza con el primer paso.";

        await createNotification({
          userId,
          title: "Recordatorio de entrenamiento",
          message,
          type: "workout",
        });
      }
    }
  }

  /**
   * Verifica y resetea la racha basado en los días de entrenamiento por semana del usuario
   * Si el usuario excede los días de descanso permitidos, la racha se resetea a las 12 de la noche
   */
  async checkAndResetStreak(userId: string) {
    // Primero actualizar la racha calculada desde los entrenamientos reales
    const stats = await this.getStreakStats(userId);
    const streak = await this.getOrCreateStreak(userId);

    // Obtener el perfil del usuario para saber los días de entrenamiento por semana
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { trainingFrequency: true },
    });

    // Si no tiene configuración, usar 3 días por defecto
    const trainingFrequency = profile?.trainingFrequency || 3;
    const allowedRestDays = 7 - trainingFrequency; // Días de descanso permitidos

    if (!streak.lastWorkoutAt || stats.currentStreak === 0) {
      return { shouldReset: false, daysWithoutWorkout: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastWorkoutDate = new Date(streak.lastWorkoutAt);
    lastWorkoutDate.setHours(0, 0, 0, 0);

    // Calcular días sin entrenar (excluyendo el día del último entrenamiento)
    const daysSinceLastWorkout = Math.floor(
      (today.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Si excede los días de descanso permitidos + 1 (día crítico)
    const criticalDay = allowedRestDays + 1;
    const isCriticalDay = daysSinceLastWorkout === criticalDay;
    const shouldReset = daysSinceLastWorkout > criticalDay;

    // Si es medianoche (00:00) y estamos en el día crítico o después, resetear
    const now = new Date();
    if (shouldReset && now.getHours() === 0 && now.getMinutes() < 5) {
      await prisma.workoutStreak.update({
        where: { userId },
        data: {
          currentStreak: 0,
        },
      });

      await createNotification({
        userId,
        title: "Racha reiniciada",
        message: `Tu racha se ha reiniciado porque no entrenaste durante más de ${criticalDay} días. ¡Comienza una nueva racha hoy!`,
        type: "workout",
      });

      return {
        shouldReset: true,
        daysWithoutWorkout: daysSinceLastWorkout,
        reset: true,
      };
    }

    return {
      shouldReset: false,
      daysWithoutWorkout: daysSinceLastWorkout,
      isCriticalDay,
      criticalDay,
      allowedRestDays,
      currentStreak: stats.currentStreak,
    };
  }

  /**
   * Envía notificaciones cada 2 horas en el día crítico
   * Se debe llamar cada 2 horas durante el día crítico
   * SOLO se debe llamar desde aquí, NO desde getStreakStats
   */
  async sendCriticalDayNotifications(userId: string) {
    const checkResult = await this.checkAndResetStreak(userId);

    if (
      !checkResult.isCriticalDay ||
      !checkResult.currentStreak ||
      checkResult.currentStreak === 0
    ) {
      return { sent: false, reason: "Not critical day or no active streak" };
    }

    const now = new Date();
    // Usar UTC para ser consistente con otras fechas
    const todayStart = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );

    // Verificar si ya se envió una notificación hoy (no cada 2 horas, solo una vez por día)
    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId,
        type: "workout",
        title: "Racha en Riesgo - ¡Día Crítico!",
        createdAt: {
          gte: todayStart,
        },
      },
    });

    if (existingNotification) {
      return { sent: false, reason: "Notification already sent today" };
    }

    // Verificar si el usuario tiene notificaciones activadas
    const userProfile = await prisma.profile.findUnique({
      where: { userId },
      select: { notificationsActive: true },
    });

    if (userProfile?.notificationsActive === false) {
      return { sent: false, reason: "User has notifications disabled" };
    }

    // Obtener allowedRestDays del perfil
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { trainingFrequency: true },
    });
    const trainingFrequency = profile?.trainingFrequency || 3;
    const allowedRestDays = 7 - trainingFrequency;

    // Enviar notificación de advertencia (solo una vez por día)
    const message = `Has usado tus ${allowedRestDays} días de descanso permitidos. Tu racha de ${checkResult.currentStreak} días está en peligro. Si no entrenas antes de las 12:00 AM, perderás toda tu progreso. ¡Aún estás a tiempo de mantenerla! 💪`;

    await createNotification({
      userId,
      title: "Racha en Riesgo - ¡Día Crítico!",
      message,
      type: "workout",
    });

    console.log(
      `📢 Notificación de racha en riesgo enviada a usuario ${userId} (día crítico, racha: ${checkResult.currentStreak})`,
    );

    return { sent: true, streak: checkResult.currentStreak };
  }
}
