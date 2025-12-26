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
} from "@react-email/components";
import { render } from "@react-email/render";

interface InvoiceEmailProps {
  userName: string;
  userEmail: string;
  invoiceNumber: string;
  invoiceDate: string;
  planName: string;
  planType: string;
  amount: number;
  currency: string;
  trialEndsAt?: string;
  nextBillingDate: string;
  subscriptionId: string;
}

export const InvoiceEmail = ({
  userName,
  userEmail,
  invoiceNumber,
  invoiceDate,
  planName,
  planType,
  amount,
  currency,
  trialEndsAt,
  nextBillingDate,
  subscriptionId,
}: InvoiceEmailProps) => {
  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>Confirmación de suscripción a {planName} - GymRat+</Preview>
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
                Confirmación de suscripción
              </Text>
            </Section>

            {/* Greeting */}
            <Section className="mb-[20px]">
              <Text className="text-xs text-zinc-900 mb-[12px] leading-[22px] m-0">
                ¡Hola {userName}!
              </Text>
              <Text className="text-xs text-zinc-700 mb-0 leading-[22px] m-0">
                Tu suscripción a <strong>{planName}</strong> ha sido confirmada
                exitosamente.
                {trialEndsAt && (
                  <>
                    {" "}
                    Disfruta de 14 días de prueba gratis hasta el {trialEndsAt}.
                  </>
                )}
              </Text>
            </Section>

            {/* Invoice Details */}
            <Section className="bg-zinc-50 rounded-[8px] p-[16px] mb-[20px]">
              <Text className="text-xs font-semibold text-zinc-900 mb-[12px] m-0">
                Detalles de la Factura
              </Text>
              <div className="space-y-[8px]">
                <div className="flex justify-between items-center">
                  <Text className="text-xs text-zinc-600 m-0">
                    Número de Factura:
                  </Text>
                  <Text className="text-xs font-medium text-zinc-900 m-0">
                    {invoiceNumber}
                  </Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text className="text-xs text-zinc-600 m-0">Fecha:</Text>
                  <Text className="text-xs font-medium text-zinc-900 m-0">
                    {invoiceDate}
                  </Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text className="text-xs text-zinc-600 m-0">Cliente:</Text>
                  <Text className="text-xs font-medium text-zinc-900 m-0">
                    {userName}
                  </Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text className="text-xs text-zinc-600 m-0">Email:</Text>
                  <Text className="text-xs font-medium text-zinc-900 m-0">
                    {userEmail}
                  </Text>
                </div>
              </div>

              <div className="border-t border-zinc-200 my-[12px]" />

              <div className="space-y-[8px]">
                <div className="flex justify-between items-center">
                  <Text className="text-xs text-zinc-600 m-0">Plan:</Text>
                  <Text className="text-xs font-medium text-zinc-900 m-0">
                    {planName}
                  </Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text className="text-xs text-zinc-600 m-0">Tipo:</Text>
                  <Text className="text-xs font-medium text-zinc-900 m-0">
                    {planType === "monthly" ? "Mensual" : "Anual"}
                  </Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text className="text-xs text-zinc-600 m-0">
                    ID de Suscripción:
                  </Text>
                  <Text className="text-xs font-medium text-zinc-900 m-0">
                    {subscriptionId}
                  </Text>
                </div>
              </div>

              <div className="border-t border-zinc-200 my-[12px]" />

              <div className="flex justify-between items-center">
                <Text className="text-xs font-semibold text-zinc-900 m-0">
                  Total:
                </Text>
                <Text className="text-sm font-bold text-zinc-900 m-0">
                  ${amount.toLocaleString()} {currency}
                </Text>
              </div>
            </Section>

            {/* Next Billing Info */}
            <Section className="bg-blue-50 rounded-[8px] p-[16px] mb-[20px]">
              <Text className="text-xs text-zinc-700 mb-0 leading-[18px] m-0">
                <strong>Próxima facturación:</strong> {nextBillingDate}
                {trialEndsAt && (
                  <>
                    <br />
                    <br />
                    No se te cobrará hasta que termine tu período de prueba el{" "}
                    {trialEndsAt}.
                  </>
                )}
              </Text>
            </Section>

            {/* CTA Button */}
            <Section className="text-center mb-[24px]">
              <Button
                href="https://gymratplus.com/dashboard/profile"
                className="bg-black text-white rounded-[8px] px-[24px] py-[12px] text-xs font-medium no-underline inline-block"
              >
                Ver mi perfil
              </Button>
            </Section>

            {/* Support Info */}
            <Section className="bg-zinc-50 rounded-[8px] p-[16px] mb-[20px]">
              <Text className="text-xs text-zinc-600 mb-0 leading-[18px] m-0">
                Puedes gestionar tu suscripción en cualquier momento desde tu
                perfil. Si tienes alguna pregunta, contáctanos en
                support@gymratplus.com
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

export default InvoiceEmail;

// Función para renderizar el email a HTML
export async function renderInvoiceEmail(
  props: InvoiceEmailProps,
): Promise<string> {
  return await render(<InvoiceEmail {...props} />);
}
