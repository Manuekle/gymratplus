import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn(
    "⚠️  RESEND_API_KEY no está configurada. Los emails no se enviarán.",
  );
}

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Función para obtener el email "from" por defecto
function getDefaultFromEmail(): string {
  // Si hay un email personalizado configurado, usarlo
  if (process.env.RESEND_FROM_EMAIL) {
    return process.env.RESEND_FROM_EMAIL;
  }

  // Si no hay dominio verificado, usar el dominio de prueba de Resend
  // Este dominio funciona sin verificación para desarrollo
  return "GymRatPlus <onboarding@resend.dev>";
}

export async function sendEmail({
  to,
  subject,
  html,
  from = getDefaultFromEmail(),
}: SendEmailOptions) {
  if (!resend) {
    console.error("❌ Resend no está configurado. Email no enviado.");
    console.log("📧 Email que se habría enviado:", { to, subject });
    return { success: false, error: "Resend no configurado" };
  }

  try {
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error enviando email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
