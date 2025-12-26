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
} from "@react-email/components";
import { render } from "@react-email/render";

interface CancellationEmailProps {
  userName: string;
  planName: string;
  endDate: string; // Formatted date when access ends
}

export const CancellationEmail = ({
  userName,
  planName,
  endDate,
}: CancellationEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Confirmación de cancelación de suscripción - GymRat+</Preview>
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
              Confirmación de cancelación
            </Text>
          </Section>

          {/* Greeting */}
          <Section className="mb-[20px]">
            <Text className="text-xs text-zinc-900 mb-[12px] leading-[22px] m-0">
              Hola {userName},
            </Text>
            <Text className="text-xs text-zinc-700 mb-0 leading-[22px] m-0">
              Hemos recibido tu solicitud para cancelar tu suscripción al plan{" "}
              <strong>{planName}</strong>.
            </Text>
          </Section>

          {/* Cancellation Info */}
          <Section className="bg-zinc-50 rounded-[8px] p-[16px] mb-[20px]">
            <Text className="text-xs text-zinc-700 mb-[12px] leading-[20px] m-0">
              Lamentamos verte partir. Tu suscripción ha sido cancelada
              exitosamente, pero podrás seguir disfrutando de todos los
              beneficios de tu plan hasta el final de tu período de facturación
              actual:
            </Text>
            <Text className="text-xs font-semibold text-zinc-900 mb-0 m-0">
              Tu acceso finalizará el: {endDate}
            </Text>
          </Section>

          {/* Additional Info */}
          <Section className="mb-[20px]">
            <Text className="text-xs text-zinc-700 mb-[12px] leading-[22px] m-0">
              Después de esta fecha, tu cuenta pasará automáticamente al plan
              Gratuito. No se te realizarán más cobros.
            </Text>
            <Text className="text-xs text-zinc-700 mb-0 leading-[22px] m-0">
              Si cambias de opinión, puedes reactivar tu suscripción en
              cualquier momento desde tu perfil.
            </Text>
          </Section>

          {/* CTA Button */}
          <Section className="text-center mb-[24px]">
            <Button
              href={`${process.env.NEXTAUTH_URL || "https://gymratplus.com"}/dashboard/profile/billing`}
              className="bg-black text-white rounded-[8px] px-[24px] py-[12px] text-xs font-medium no-underline inline-block"
            >
              Reactivar Suscripción
            </Button>
          </Section>

          {/* Support Info */}
          <Section className="bg-zinc-50 rounded-[8px] p-[16px] mb-[20px]">
            <Text className="text-xs text-zinc-600 mb-0 leading-[18px] m-0">
              Si tienes alguna pregunta, responde a este correo o contáctanos en
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

export const renderCancellationEmail = (props: CancellationEmailProps) =>
  render(<CancellationEmail {...props} />);
