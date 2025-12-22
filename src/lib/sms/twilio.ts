import twilio from "twilio";

// Validar que las credenciales de Twilio estén configuradas
if (!process.env.TWILIO_ACCOUNT_SID) {
  console.warn(
    "⚠️  TWILIO_ACCOUNT_SID no está configurada. Los SMS no se enviarán.",
  );
}

if (!process.env.TWILIO_AUTH_TOKEN) {
  console.warn(
    "⚠️  TWILIO_AUTH_TOKEN no está configurada. Los SMS no se enviarán.",
  );
}

if (!process.env.TWILIO_PHONE_NUMBER) {
  console.warn(
    "⚠️  TWILIO_PHONE_NUMBER no está configurado. Los SMS no se enviarán.",
  );
}

// Inicializar cliente de Twilio solo si las credenciales están disponibles
export const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

export interface SendSMSOptions {
  to: string;
  message: string;
}

/**
 * Valida que un número de teléfono tenga formato internacional válido
 * Debe comenzar con + seguido del código de país
 */
export function validatePhoneNumber(phone: string): boolean {
  // Formato internacional: +[código de país][número]
  // Ejemplo: +1234567890, +521234567890
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

/**
 * Formatea un número de teléfono para enmascararlo
 * Ejemplo: +1234567890 -> +1 *** *** **90
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 4) return phone;

  const countryCode = phone.substring(0, phone.length - 10);
  const lastDigits = phone.substring(phone.length - 2);

  return `${countryCode} *** *** **${lastDigits}`;
}

/**
 * Envía un SMS usando Twilio
 */
export async function sendSMS({ to, message }: SendSMSOptions) {
  if (!twilioClient) {
    console.error("❌ Twilio no está configurado. SMS no enviado.");
    console.log("📱 SMS que se habría enviado:", { to, message });
    return { success: false, error: "Twilio no configurado" };
  }

  if (!process.env.TWILIO_PHONE_NUMBER) {
    console.error("❌ TWILIO_PHONE_NUMBER no está configurado.");
    return { success: false, error: "Número de Twilio no configurado" };
  }

  // Validar formato de número
  if (!validatePhoneNumber(to)) {
    return {
      success: false,
      error:
        "Formato de número inválido. Debe incluir código de país (ej: +1234567890)",
    };
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    console.log("✅ SMS enviado exitosamente:", result.sid);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error enviando SMS:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Envía un código de verificación por SMS
 */
export async function sendVerificationSMS(phone: string, code: string) {
  const message = `Tu código de verificación de GymRat+ es: ${code}\n\nVálido por 10 minutos.\n\nSi no solicitaste este código, ignora este mensaje.`;

  return await sendSMS({ to: phone, message });
}

/**
 * Envía una alerta de seguridad por SMS
 */
export async function sendSecurityAlert(phone: string, alertMessage: string) {
  const message = `🔒 Alerta de seguridad de GymRat+\n\n${alertMessage}\n\nSi no reconoces esta actividad, contacta a soporte inmediatamente.`;

  return await sendSMS({ to: phone, message });
}
