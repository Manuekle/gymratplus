import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Tailwind,
  Row,
  Column,
} from "@react-email/components";
import { render } from "@react-email/render";

interface PaymentReminderEmailProps {
  userName: string;
  planName: string;
  renewalDate: string;
  amount: number;
  currency: string;
}

export const PaymentReminderEmail = ({
  userName,
  planName,
  renewalDate,
  amount,
  currency,
}: PaymentReminderEmailProps) => {
  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>Tu suscripción se renovará pronto - GymRat+</Preview>
      <Tailwind>
        <Body
          style={{
            fontFamily:
              '"Geist", "Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          }}
        >
          <Container className="mx-auto max-w-[520px] px-[24px] py-[32px]">
            {/* Header */}
            <Section className="mb-[24px]">
              <Img
                src={`${process.env.NEXTAUTH_URL || "https://gymratplus.com"}/favicon.ico`}
                width="48"
                height="48"
                alt="GymRat+"
                className="mb-[16px] rounded-[12px]"
              />
              <Heading className="text-lg tracking-heading font-semibold text-zinc-900 m-0 mb-[4px]">
                GymRat+
              </Heading>
              <Text className="text-xs text-zinc-500 m-0">
                Recordatorio de renovación
              </Text>
            </Section>

            {/* Greeting */}
            <Section className="mb-[20px]">
              <Text className="text-xs text-zinc-900 mb-[12px] leading-[22px] m-0">
                ¡Hola {userName}!
              </Text>
              <Text className="text-xs text-zinc-700 mb-0 leading-[22px] m-0">
                Esperamos que estés disfrutando de GymRat+. Te escribimos para
                recordarte que tu suscripción al plan{" "}
                <strong>{planName}</strong> se renovará automáticamente el
                próximo <strong>{renewalDate}</strong>.
              </Text>
            </Section>

            {/* Plan Details */}
            <Section className="bg-zinc-50 rounded-[8px] p-[16px] mb-[20px]">
              <Text className="text-xs font-semibold text-zinc-900 mb-[12px] m-0">
                Detalles de la Renovación
              </Text>
              <div className="space-y-[8px]">
                <div className="flex justify-between items-center">
                  <Text className="text-xs text-zinc-600 m-0">Plan:</Text>
                  <Text className="text-xs font-medium text-zinc-900 m-0">
                    {planName}
                  </Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text className="text-xs text-zinc-600 m-0">Fecha:</Text>
                  <Text className="text-xs font-medium text-zinc-900 m-0">
                    {renewalDate}
                  </Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text className="text-xs text-zinc-600 m-0">
                    Monto a cobrar:
                  </Text>
                  <Text className="text-xs font-medium text-zinc-900 m-0">
                    ${amount.toLocaleString()} {currency}
                  </Text>
                </div>
              </div>
            </Section>

            {/* Info Message */}
            <Section className="mb-[20px]">
              <Text className="text-xs text-zinc-700 mb-[12px] leading-[22px] m-0">
                Si deseas continuar con tu plan, no necesitas hacer nada. El
                cobro se procesará automáticamente.
              </Text>
            </Section>

            {/* CTA Button */}
            <Section className="text-center mb-[24px]">
              <Button
                href="https://gymratplus.com/dashboard/profile/billing"
                className="bg-black text-white rounded-[8px] px-[24px] py-[12px] text-xs font-medium no-underline inline-block"
              >
                Gestionar Suscripción
              </Button>
            </Section>

            {/* Footer Info */}
            <Section className="bg-zinc-50 rounded-[8px] p-[16px] mb-[20px]">
              <Text className="text-xs text-zinc-600 mb-0 leading-[18px] m-0">
                Si deseas cancelar o cambiar tu plan antes de la renovación,
                puedes hacerlo desde tu perfil. Si tienes alguna pregunta,
                contáctanos en support@gymratplus.com
              </Text>
            </Section>

            {/* Footer */}
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
};

export default PaymentReminderEmail;

// Función para renderizar el email a HTML
export async function renderPaymentReminderEmail(
  props: PaymentReminderEmailProps,
): Promise<string> {
  return await render(<PaymentReminderEmail {...props} />);
}
