import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
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
  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>
        Código de verificación - Restablece tu contraseña en GymRat+
      </Preview>
      <Tailwind>
        <Body
          className="bg-gray-100 py-[40px]"
          style={{
            fontFamily:
              '"Geist", "Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          }}
        >
          <Container className="mx-auto bg-white rounded-[8px] shadow-sm max-w-[600px] px-[32px] py-[40px]">
            {/* Header */}
            <Section className="text-center mb-[32px]">
              <Heading className="text-[28px] font-bold text-gray-900 mb-[8px] m-0">
                GymRat+
              </Heading>
              <Text className="text-[16px] text-gray-600 m-0">
                Código de Verificación
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="mb-[32px]">
              {userName ? (
                <Text className="text-[16px] text-gray-800 mb-[16px] leading-[24px]">
                  Hola <strong>{userName}</strong>,
                </Text>
              ) : (
                <Text className="text-[16px] text-gray-800 mb-[16px] leading-[24px]">
                  Hola,
                </Text>
              )}
              <Text className="text-[16px] text-gray-800 mb-[16px] leading-[24px]">
                Recibimos una solicitud para restablecer la contraseña de tu
                cuenta
                {userEmail && (
                  <>
                    {" "}
                    asociada con <strong>{userEmail}</strong>
                  </>
                )}
                .
              </Text>
              <Text className="text-[16px] text-gray-800 mb-[24px] leading-[24px]">
                Usa el siguiente código de verificación de 6 dígitos:
              </Text>
            </Section>

            {/* Code Display */}
            <Section className="text-center mb-[32px]">
              <div
                className="bg-black text-white px-[40px] py-[20px] rounded-[8px] inline-block"
                style={{
                  fontFamily:
                    '"Geist Mono", "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
                  letterSpacing: "8px",
                  fontSize: "32px",
                  fontWeight: "bold",
                }}
              >
                {code}
              </div>
            </Section>

            {/* Instructions */}
            <Section className="mb-[32px]">
              <Text className="text-[14px] text-gray-600 mb-[8px] text-center">
                Ingresa este código en la página de restablecimiento de
                contraseña.
              </Text>
            </Section>

            {/* Security Notice */}
            <Section className="bg-yellow-50 border border-yellow-200 rounded-[8px] p-[20px] mb-[32px]">
              <Text className="text-[14px] text-yellow-800 mb-[8px] font-semibold">
                ⚠️ Aviso de Seguridad
              </Text>
              <Text className="text-[14px] text-yellow-700 m-0 leading-[20px]">
                Este código expirará en {expiresIn} por seguridad. Si no
                solicitaste este cambio, ignora este email y tu contraseña
                permanecerá sin cambios.
              </Text>
            </Section>

            {/* Security Tip */}
            <Section className="bg-gray-50 border border-gray-200 rounded-[8px] p-[20px] mb-[32px]">
              <Text className="text-[14px] text-gray-800 mb-[8px] font-semibold">
                💡 Consejo de Seguridad
              </Text>
              <Text className="text-[14px] text-gray-700 m-0 leading-[20px]">
                Nunca compartas este código con nadie. GymRatPlus nunca te
                pedirá tu código por teléfono o email.
              </Text>
            </Section>

            {/* Additional Info */}
            <Section className="mb-[32px]">
              <Text className="text-[14px] text-gray-600 leading-[20px]">
                Si tienes problemas o no solicitaste este cambio, contacta
                nuestro equipo de soporte inmediatamente.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="border-t border-gray-200 pt-[24px] text-center">
              <Text className="text-[12px] text-gray-500 mb-[8px] m-0">
                © {new Date().getFullYear()} GymRatPlus. Todos los derechos
                reservados.
              </Text>
              <Text className="text-[12px] text-gray-500 mb-[8px] m-0">
                Si tienes problemas, contacta a nuestro equipo de soporte.
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
