import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import { render } from "@react-email/render";

interface PasswordResetCodeEmailProps {
  code: string;
  userName?: string;
  userEmail?: string;
  expiresIn?: string;
}

export function PasswordResetCodeEmail({
  code,
  userName,
  userEmail,
  expiresIn = "10 minutos",
}: PasswordResetCodeEmailProps) {
  const baseUrl = process.env.NEXTAUTH_URL || "https://gymratplus.com";

  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>Tu código de verificación: {code} - GymRat+</Preview>
      <Tailwind>
        <Body
          style={{
            fontFamily:
              '"Geist", "Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          }}
        >
          <Container className="mx-auto max-w-[520px] px-[24px] py-[32px]">
            {/* Header - Minimalista */}
            <Section className="mb-[24px]">
              <Img
                src={`${baseUrl}/icons/logo-light.png`}
                width="48"
                height="48"
                alt="GymRat+"
                className="mb-[16px] rounded-[12px]"
              />
              <Heading className="text-[24px] tracking-heading font-semibold text-zinc-900 m-0 mb-[4px]">
                GymRat+
              </Heading>
              <Text className="text-[13px] text-zinc-500 m-0">
                Código de verificación
              </Text>
            </Section>

            {/* Greeting - Compacto */}
            <Section className="mb-[20px]">
              <Text className="text-[15px] text-zinc-900 mb-[12px] leading-[22px] m-0">
                {userName ? `Hola ${userName},` : "Hola,"}
              </Text>
              <Text className="text-[15px] text-zinc-700 mb-0 leading-[22px] m-0">
                Usa este código para restablecer tu contraseña
                {userEmail && ` de ${userEmail}`}:
              </Text>
            </Section>

            {/* Code Display - Moderno y destacado */}
            <Section className="text-center mb-[24px]">
              <div
                style={{
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  padding: "16px 32px",
                  borderRadius: "12px",
                  display: "inline-block",
                  fontFamily:
                    '"Geist Mono", "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
                  letterSpacing: "6px",
                  fontSize: "28px",
                  fontWeight: "600",
                  lineHeight: "1.2",
                }}
              >
                {code}
              </div>
            </Section>

            {/* Expiry Notice - Compacto */}
            <Section className="mb-[20px]">
              <Text className="text-[13px] text-zinc-600 mb-0 leading-[18px] text-center m-0">
                Válido por {expiresIn}
              </Text>
            </Section>

            {/* Security Notice - Minimalista */}
            <Section className="bg-zinc-50 rounded-[8px] p-[16px] mb-[20px]">
              <Text className="text-[12px] text-zinc-600 mb-0 leading-[18px] m-0">
                <strong>Seguridad:</strong> Si no solicitaste este cambio,
                ignora este email. Nunca compartas este código con nadie.
              </Text>
            </Section>

            {/* Footer - Minimalista */}
            <Section className="border-t border-zinc-100 pt-[20px]">
              <Text className="text-xs text-zinc-400 mb-[4px] m-0 text-center">
                © {new Date().getFullYear()} GymRat+. Todos los derechos
                reservados.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

PasswordResetCodeEmail.PreviewProps = {
  code: "123456",
  userName: "Juan Pérez",
  userEmail: "juan@ejemplo.com",
  expiresIn: "10 minutos",
};

// Función para renderizar el email a HTML
export async function renderPasswordResetCodeEmail(
  props: PasswordResetCodeEmailProps,
): Promise<string> {
  return await render(<PasswordResetCodeEmail {...props} />);
}
