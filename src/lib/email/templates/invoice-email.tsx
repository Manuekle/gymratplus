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
  const previewText = `Confirmación de suscripción a ${planName}`;

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
            <Heading style={h2}>¡Gracias por tu suscripción!</Heading>
            <Text style={paragraph}>Hola {userName},</Text>
            <Text style={paragraph}>
              Tu suscripción a <strong>{planName}</strong> ha sido confirmada
              exitosamente.
              {trialEndsAt && (
                <>
                  {" "}
                  Disfruta de 14 días de prueba gratis hasta el {trialEndsAt}.
                </>
              )}
            </Text>

            {/* Invoice Details */}
            <Section style={invoiceBox}>
              <Heading style={h3}>Detalles de la Factura</Heading>
              <Hr style={hr} />

              <Row style={invoiceRow}>
                <Column style={invoiceLabel}>Número de Factura:</Column>
                <Column style={invoiceValue}>{invoiceNumber}</Column>
              </Row>

              <Row style={invoiceRow}>
                <Column style={invoiceLabel}>Fecha:</Column>
                <Column style={invoiceValue}>{invoiceDate}</Column>
              </Row>

              <Row style={invoiceRow}>
                <Column style={invoiceLabel}>Cliente:</Column>
                <Column style={invoiceValue}>{userName}</Column>
              </Row>

              <Row style={invoiceRow}>
                <Column style={invoiceLabel}>Email:</Column>
                <Column style={invoiceValue}>{userEmail}</Column>
              </Row>

              <Hr style={hr} />

              <Row style={invoiceRow}>
                <Column style={invoiceLabel}>Plan:</Column>
                <Column style={invoiceValue}>{planName}</Column>
              </Row>

              <Row style={invoiceRow}>
                <Column style={invoiceLabel}>Tipo:</Column>
                <Column style={invoiceValue}>
                  {planType === "monthly" ? "Mensual" : "Anual"}
                </Column>
              </Row>

              <Row style={invoiceRow}>
                <Column style={invoiceLabel}>ID de Suscripción:</Column>
                <Column style={invoiceValue}>{subscriptionId}</Column>
              </Row>

              <Hr style={hr} />

              <Row style={totalRow}>
                <Column style={totalLabel}>Total:</Column>
                <Column style={totalValue}>
                  ${amount.toFixed(2)} {currency}
                </Column>
              </Row>
            </Section>

            {/* Next Billing */}
            <Section style={billingInfo}>
              <Text style={paragraph}>
                <strong>Próxima facturación:</strong> {nextBillingDate}
              </Text>
              {trialEndsAt && (
                <Text style={smallText}>
                  No se te cobrará hasta que termine tu período de prueba el{" "}
                  {trialEndsAt}.
                </Text>
              )}
            </Section>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button
                style={button}
                href="https://gymratplus.com/dashboard/profile"
              >
                Ver mi perfil
              </Button>
            </Section>

            {/* Footer Info */}
            <Section style={footerInfo}>
              <Text style={smallText}>
                Puedes gestionar tu suscripción en cualquier momento desde tu
                perfil.
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

export default InvoiceEmail;

// Función para renderizar el email a HTML
export async function renderInvoiceEmail(
  props: InvoiceEmailProps,
): Promise<string> {
  return await render(<InvoiceEmail {...props} />);
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

const invoiceBox = {
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

const totalRow = {
  marginTop: "16px",
};

const totalLabel = {
  color: "#18181b",
  fontSize: "16px",
  fontWeight: "bold",
  width: "40%",
};

const totalValue = {
  color: "#18181b",
  fontSize: "20px",
  fontWeight: "bold",
  textAlign: "right" as const,
};

const hr = {
  borderColor: "#e4e4e7",
  margin: "16px 0",
};

const billingInfo = {
  backgroundColor: "#eff6ff",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
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
