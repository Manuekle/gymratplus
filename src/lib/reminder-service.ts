import { prisma } from "@/lib/prisma";
import { WorkoutStreakService } from "@/lib/workout-streak-service";

export class ReminderService {
  private workoutStreakService: WorkoutStreakService;

  constructor() {
    this.workoutStreakService = new WorkoutStreakService();
  }

  async checkWorkoutReminders() {
    try {
      // Obtener todos los usuarios activos con notificaciones habilitadas
      const activeUsers = await prisma.user.findMany({
        where: {
          profile: {
            notificationsActive: true,
          },
        },
        include: {
          profile: true,
        },
      });

      // Verificar y enviar recordatorios para cada usuario
      await Promise.all(
        activeUsers.map(async (user) => {
          await this.workoutStreakService.checkAndSendWorkoutReminder(user.id);
        })
      );
    } catch (error) {
      console.error("Error checking workout reminders:", error);
    }
  }

  // Esta función se puede llamar desde un cron job o un worker
  async startReminderCheck() {
    // Verificar recordatorios cada hora entre las 5 PM y 9 PM
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 17 && hour < 21) {
      await this.checkWorkoutReminders();
    }
  }
}
