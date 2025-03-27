import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notification-service";

export class WorkoutStreakService {
  async getOrCreateStreak(userId: string) {
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

    // Si es un día de descanso
    if (!isWorkout) {
      if (streak.lastRestDayAt?.getTime() === today.getTime()) {
        return streak; // Ya se registró un día de descanso hoy
      }

      // Si el último entrenamiento fue ayer, mantener la racha
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (streak.lastWorkoutAt?.getTime() === yesterday.getTime()) {
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

      // Si no hay racha activa, reiniciar
      await prisma.workoutStreak.update({
        where: { userId },
        data: {
          currentStreak: 0,
          lastRestDayAt: today,
        },
      });

      await createNotification({
        userId,
        title: "Nueva racha",
        message: "¡Comienza una nueva racha de entrenamiento!",
        type: "workout",
      });

      return streak;
    }

    // Si es un entrenamiento
    if (streak.lastWorkoutAt?.getTime() === today.getTime()) {
      return streak; // Ya se registró un entrenamiento hoy
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Si el último entrenamiento fue ayer o es el primer entrenamiento
    if (
      !streak.lastWorkoutAt ||
      streak.lastWorkoutAt.getTime() === yesterday.getTime()
    ) {
      const newStreak = streak.currentStreak + 1;
      const newLongestStreak = Math.max(newStreak, streak.longestStreak);
      const isStreakMilestone = newStreak > 0 && newStreak % 10 === 0;

      await prisma.workoutStreak.update({
        where: { userId },
        data: {
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastWorkoutAt: today,
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

    // Si se rompió la racha
    await prisma.workoutStreak.update({
      where: { userId },
      data: {
        currentStreak: 1,
        lastWorkoutAt: today,
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
    const streak = await this.getOrCreateStreak(userId);
    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastWorkoutAt: streak.lastWorkoutAt,
      lastRestDayAt: streak.lastRestDayAt,
    };
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
}
