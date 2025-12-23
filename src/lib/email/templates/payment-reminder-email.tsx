import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
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
  const previewText = `Tu suscripción se renovará pronto`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>GymRat+</Heading>
            <Text style={tagline}>Tu compañero de entrenamiento</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h2}>Recordatorio de Renovación</Heading>
            <Text style={paragraph}>Hola {userName},</Text>
            <Text style={paragraph}>
              Esperamos que estés disfrutando de <strong>GymRat+</strong>.
            </Text>
            <Text style={paragraph}>
              Te escribimos para recordarte que tu suscripción al plan{" "}
              <strong>{planName}</strong> se renovará automáticamente el próximo{" "}
              <strong>{renewalDate}</strong>.
            </Text>

            {/* Plan Details */}
            <Section style={detailsBox}>
              <Heading style={h3}>Detalles de la Renovación</Heading>
              <Hr style={hr} />

              <Row style={invoiceRow}>
                <Column style={invoiceLabel}>Plan:</Column>
                <Column style={invoiceValue}>{planName}</Column>
              </Row>

              <Row style={invoiceRow}>
                <Column style={invoiceLabel}>Fecha:</Column>
                <Column style={invoiceValue}>{renewalDate}</Column>
              </Row>

              <Row style={invoiceRow}>
                <Column style={invoiceLabel}>Monto a cobrar:</Column>
                <Column style={invoiceValue}>
                  ${amount.toFixed(2)} {currency}
                </Column>
              </Row>
            </Section>

            <Text style={paragraph}>
              Si deseas continuar con tu plan, no necesitas hacer nada. El cobro
              se procesará automáticamente.
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button
                style={button}
                href="https://gymratplus.com/dashboard/profile/billing"
              >
                Gestionar Suscripción
              </Button>
            </Section>

            {/* Footer Info */}
            <Section style={footerInfo}>
              <Text style={smallText}>
                Si deseas cancelar o cambiar tu plan antes de la renovación,
                puedes hacerlo desde tu perfil.
              </Text>
              <Text style={smallText}>
                Si tienes alguna pregunta, contáctanos en{" "}
                <a href="mailto:support@gymratplus.com" style={link}>
                  support@gymratplus.com
                </a>
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} GymRat+. Todos los derechos
              reservados.
            </Text>
            <Text style={footerText}>
              <a href="https://gymratplus.com" style={link}>
                gymratplus.com
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
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

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  padding: "32px 20px",
  textAlign: "center" as const,
  backgroundColor: "#18181b",
  color: "#ffffff",
};

const h1 = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0",
  padding: "0",
};

const tagline = {
  color: "#a1a1aa",
  fontSize: "14px",
  margin: "8px 0 0 0",
};

const content = {
  padding: "0 20px",
};

const h2 = {
  color: "#18181b",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "32px 0 16px",
};

const h3 = {
  color: "#18181b",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px",
};

const paragraph = {
  color: "#3f3f46",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const detailsBox = {
  backgroundColor: "#f4f4f5",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const invoiceRow = {
  marginBottom: "12px",
};

const invoiceLabel = {
  color: "#71717a",
  fontSize: "14px",
  width: "40%",
};

const invoiceValue = {
  color: "#18181b",
  fontSize: "14px",
  fontWeight: "500",
  textAlign: "right" as const,
};

const hr = {
  borderColor: "#e4e4e7",
  margin: "16px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#18181b",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const footerInfo = {
  margin: "32px 0",
};

const smallText = {
  color: "#71717a",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "8px 0",
};

const link = {
  color: "#3b82f6",
  textDecoration: "underline",
};

const footer = {
  borderTop: "1px solid #e4e4e7",
  padding: "20px",
  textAlign: "center" as const,
  marginTop: "32px",
};

const footerText = {
  color: "#71717a",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "4px 0",
};
