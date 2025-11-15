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

    let streak = await prisma.workoutStreak.findUnique({
      where: { userId },
    });

    if (!streak) {
      streak = await prisma.workoutStreak.create({
        data: {
          userId,
          currentStreak: 0,
          longestStreak: 0,
        },
      });
    }

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
      return {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastWorkoutAt: streak.lastWorkoutAt?.toISOString() || null,
        lastRestDayAt: streak.lastRestDayAt?.toISOString() || null,
      };
    } catch (error) {
      console.error("Error en getStreakStats:", error);
      throw error;
    }
  }

  async checkAndSendWorkoutReminder(userId: string) {
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

      if (!existingReminder) {
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
    const streak = await this.getOrCreateStreak(userId);

    // Obtener el perfil del usuario para saber los días de entrenamiento por semana
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { trainingFrequency: true },
    });

    // Si no tiene configuración, usar 3 días por defecto
    const trainingFrequency = profile?.trainingFrequency || 3;
    const allowedRestDays = 7 - trainingFrequency; // Días de descanso permitidos

    if (!streak.lastWorkoutAt || streak.currentStreak === 0) {
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
    };
  }

  /**
   * Envía notificaciones cada 2 horas en el día crítico
   * Se debe llamar cada 2 horas durante el día crítico
   */
  async sendCriticalDayNotifications(userId: string) {
    const checkResult = await this.checkAndResetStreak(userId);

    if (!checkResult.isCriticalDay) {
      return { sent: false, reason: "Not critical day" };
    }

    const streak = await this.getOrCreateStreak(userId);
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Verificar si ya se envió una notificación en las últimas 2 horas
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const recentNotification = await prisma.notification.findFirst({
      where: {
        userId,
        type: "workout",
        title: {
          contains: "Racha en riesgo",
        },
        createdAt: {
          gte: twoHoursAgo,
        },
      },
    });

    if (recentNotification) {
      return { sent: false, reason: "Notification sent recently" };
    }

    // Enviar notificación de advertencia
    const hoursUntilMidnight = 24 - now.getHours();
    const message = `⚠️ Tu racha de ${streak.currentStreak} días está en riesgo. Si no entrenas antes de las 12:00 AM, tu racha se reiniciará. ¡Aún estás a tiempo!`;

    await createNotification({
      userId,
      title: "Racha en riesgo",
      message,
      type: "workout",
    });

    return { sent: true, hoursUntilMidnight };
  }
}
