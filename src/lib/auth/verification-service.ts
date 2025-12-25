import { prisma } from "@/lib/database/prisma";
import { redis } from "@/lib/database/redis";
import { sendEmail } from "@/lib/email/resend";
// import { sendVerificationSMS } from "@/lib/sms/twilio";

// Configuración
const VERIFICATION_CODE_EXPIRY = 10 * 60 * 1000; // 10 minutos
const MAX_VERIFICATION_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hora

export type VerificationType = "email" | "sms" | "password-reset";

/**
 * Genera un código de verificación de 6 dígitos
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Verifica si un email ya está en uso
 */
export async function checkEmailUniqueness(
  email: string,
  excludeUserId?: string,
): Promise<{ available: boolean; message?: string }> {
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true },
  });

  if (existingUser && existingUser.id !== excludeUserId) {
    return {
      available: false,
      message: "Este email ya está registrado",
    };
  }

  return { available: true };
}

/**
 * Verifica si un número de teléfono ya está en uso
 */
export async function checkPhoneUniqueness(
  phone: string,
  excludeUserId?: string,
): Promise<{ available: boolean; message?: string }> {
  const existingUser = await prisma.user.findUnique({
    where: { phone: phone.trim() },
    select: { id: true },
  });

  if (existingUser && existingUser.id !== excludeUserId) {
    return {
      available: false,
      message: "Este número de teléfono ya está registrado",
    };
  }

  return { available: true };
}

/**
 * Verifica el rate limit para envío de códigos
 */
async function checkRateLimit(
  userId: string,
  type: VerificationType,
): Promise<{ allowed: boolean; message?: string }> {
  try {
    const rateLimitKey = `verification:rate-limit:${type}:${userId}`;
    const attempts = await redis.incr(rateLimitKey);

    if (attempts === 1) {
      await redis.expire(rateLimitKey, Math.floor(RATE_LIMIT_WINDOW / 1000));
    }

    if (attempts > 10) {
      // Incremented threshold slightly for production robustness
      return {
        allowed: false,
        message:
          "Demasiados intentos. Por favor, espera una hora antes de intentar de nuevo.",
      };
    }

    return { allowed: true };
  } catch (error) {
    console.warn(
      `[VERIFY-SERVICE] Redis rate limit failed for ${userId}:`,
      error,
    );
    // Silent fail - allow verification if Redis is down
    return { allowed: true };
  }
}

/**
 * Envía un código de verificación por email
 */
export async function sendEmailVerification(
  userId: string,
  email: string,
  userName?: string,
) {
  // Verificar rate limit
  const rateLimitCheck = await checkRateLimit(userId, "email");
  if (!rateLimitCheck.allowed) {
    return { success: false, error: rateLimitCheck.message };
  }

  // Generar código
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + VERIFICATION_CODE_EXPIRY);

  // Guardar en base de datos
  await prisma.verificationCode.create({
    data: {
      userId,
      type: "email",
      code,
      destination: email,
      expiresAt,
      attempts: 0,
      verified: false,
    },
  });

  // También guardar en Redis para acceso rápido
  try {
    const redisKey = `verification:email:${userId}`;
    await redis.set(
      redisKey,
      JSON.stringify({
        code,
        email,
        expiresAt: expiresAt.getTime(),
        attempts: 0,
      }),
      {
        ex: Math.floor(VERIFICATION_CODE_EXPIRY / 1000),
      },
    );
  } catch (error) {
    console.warn(`[VERIFY-SERVICE] Redis skip set for ${userId}:`, error);
  }

  // Enviar email
  const { renderEmailVerificationCode } =
    await import("@/lib/email/templates/email-verification-code");
  const emailHtml = await renderEmailVerificationCode({
    code,
    userName,
    userEmail: email,
    expiresIn: "10 minutos",
  });

  const emailResult = await sendEmail({
    to: email,
    subject: "Verifica tu email - GymRat+",
    html: emailHtml,
  });

  if (!emailResult.success) {
    console.error("Error enviando email de verificación:", emailResult.error);

    // En desarrollo, devolver el código
    if (process.env.NODE_ENV === "development") {
      return {
        success: true,
        message: "Código generado (email falló en desarrollo)",
        code,
      };
    }

    return {
      success: false,
      error: "Error al enviar el email. Por favor, intenta más tarde.",
    };
  }

  return {
    success: true,
    message: "Código de verificación enviado a tu email",
    ...(process.env.NODE_ENV === "development" && { code }),
  };
}

/*
export async function sendSMSVerification(userId: string, phone: string) {
  // ... (comentado por ahora)
}
*/

/**
 * Verifica un código ingresado por el usuario
 */
export async function verifyCode(
  userId: string,
  code: string,
  type: VerificationType,
): Promise<{ success: boolean; verified: boolean; error?: string }> {
  let storedCode: string | null = null;
  let expiresAt: number | null = null;
  let attempts = 0;
  let redisData: string | null = null;

  console.log(`[VERIFY] Checking code for userId: ${userId}, type: ${type}`);

  // Try Redis first, but don't fail if it's unavailable or data is corrupt
  try {
    const redisKey = `verification:${type}:${userId}`;
    const redisValue = await redis.get(redisKey);

    if (redisValue) {
      redisData =
        typeof redisValue === "string"
          ? redisValue
          : JSON.stringify(redisValue);
      const parsed = JSON.parse(redisData);
      storedCode = parsed.code;
      expiresAt = parsed.expiresAt;
      attempts = parsed.attempts || 0;
      console.log(
        `[VERIFY] Found in Redis - attempts: ${attempts}, expires: ${
          expiresAt ? new Date(expiresAt) : "null"
        }`,
      );
    } else {
      console.log("[VERIFY] Not found in Redis, checking database...");
    }
  } catch (redisError) {
    console.error("[VERIFY] Redis error (falling back to DB):", redisError);
    redisData = null;
    storedCode = null;
  }

  // Si no está en Redis o Redis falló, buscar en base de datos
  if (!storedCode) {
    try {
      const dbCode = await prisma.verificationCode.findFirst({
        where: {
          userId,
          type,
          verified: false,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (dbCode) {
        storedCode = dbCode.code;
        expiresAt = dbCode.expiresAt.getTime();
        attempts = dbCode.attempts;
        console.log(
          `[VERIFY] Found in DB - attempts: ${attempts}, expires: ${
            expiresAt ? new Date(expiresAt) : "null"
          }`,
        );
      } else {
        console.log("[VERIFY] No code found in DB");
      }
    } catch (dbError) {
      console.error("[VERIFY] Database error:", dbError);
      return {
        success: false,
        verified: false,
        error: "Error al verificar el código. Por favor, intenta más tarde.",
      };
    }
  }

  // Verificar si existe el código
  if (!storedCode || !expiresAt) {
    console.log("[VERIFY] ERROR: No code found");
    return {
      success: false,
      verified: false,
      error: "No se encontró un código de verificación. Solicita uno nuevo.",
    };
  }

  // Verificar si expiró
  if (Date.now() > expiresAt) {
    console.log(
      `[VERIFY] ERROR: Code expired. Now: ${new Date()}, Expires: ${new Date(
        expiresAt,
      )}`,
    );
    return {
      success: false,
      verified: false,
      error: "El código ha expirado. Solicita uno nuevo.",
    };
  }

  // Verificar intentos máximos
  if (attempts >= MAX_VERIFICATION_ATTEMPTS) {
    console.log(
      `[VERIFY] ERROR: Max attempts reached (${attempts}/${MAX_VERIFICATION_ATTEMPTS})`,
    );
    return {
      success: false,
      verified: false,
      error:
        "Demasiados intentos fallidos. Solicita un nuevo código de verificación.",
    };
  }

  // Verificar el código
  console.log(
    `[VERIFY] Comparing codes - Input: ${code}, Stored: ${storedCode}`,
  );
  if (code !== storedCode) {
    // Incrementar contador de intentos
    attempts++;
    console.log(`[VERIFY] ERROR: Code mismatch. Attempts now: ${attempts}`);

    // Actualizar en Redis
    if (redisData) {
      try {
        const redisKey = `verification:${type}:${userId}`;
        const parsed = JSON.parse(redisData);
        parsed.attempts = attempts;
        await redis.set(redisKey, JSON.stringify(parsed), {
          ex: Math.floor((expiresAt - Date.now()) / 1000),
        });
      } catch (redisError) {
        console.error("[VERIFY] Redis update error:", redisError);
      }
    }

    // Actualizar en base de datos
    await prisma.verificationCode.updateMany({
      where: {
        userId,
        type,
        verified: false,
      },
      data: {
        attempts,
      },
    });

    return {
      success: false,
      verified: false,
      error: `Código incorrecto. Te quedan ${
        MAX_VERIFICATION_ATTEMPTS - attempts
      } intentos.`,
    };
  }

  console.log("[VERIFY] SUCCESS: Code matched!");

  // Código correcto - marcar como verificado
  try {
    await prisma.verificationCode.updateMany({
      where: {
        userId,
        type,
        verified: false,
      },
      data: {
        verified: true,
      },
    });

    // Actualizar el usuario según el tipo de verificación
    if (type === "email") {
      await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: new Date() },
      });
    } else if (type === "sms") {
      await prisma.user.update({
        where: { id: userId },
        data: { phoneVerified: new Date() },
      });
    }

    // Eliminar de Redis
    try {
      const redisKey = `verification:${type}:${userId}`;
      await redis.del(redisKey);
    } catch (redisError) {
      console.error("[VERIFY] Redis delete error:", redisError);
    }

    return {
      success: true,
      verified: true,
    };
  } catch (finalError) {
    console.error("[VERIFY] Final update error:", finalError);
    return {
      success: false,
      verified: false,
      error: "Error al actualizar el estado de verificación.",
    };
  }
}
