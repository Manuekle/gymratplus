import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Button,
  Hr,
  Img,
} from "@react-email/components";
import * as React from "react";
import { render } from "@react-email/render";

interface CancellationEmailProps {
  userName: string;
  planName: string;
  endDate: string; // Formatted date when access ends
}

const baseUrl = process.env.NEXTAUTH_URL || "";

export const CancellationEmail = ({
  userName,
  planName,
  endDate,
}: CancellationEmailProps) => (
  <Html>
    <Head />
    <Preview>Confirmación de cancelación de suscripción</Preview>
    <Body style={main}>
      <Container style={container}>
        <div style={header}>
          <Img
            src="https://gymratplus.com/favicon.ico"
            width="40"
            height="40"
            alt="GymRat+"
            style={logo}
          />
          <Text style={brandName}>GymRat+</Text>
        </div>

        <Heading style={h1}>Suscripción Cancelada</Heading>

        <Text style={text}>Hola {userName},</Text>

        <Text style={text}>
          Hemos recibido tu solicitud para cancelar tu suscripción al plan{" "}
          <strong>{planName}</strong>.
        </Text>

        <Section style={box}>
          <Text style={paragraph}>
            Lamentamos verte partir. Tu suscripción ha sido cancelada
            exitosamente, pero podrás seguir disfrutando de todos los beneficios
            de tu plan hasta el final de tu período de facturación actual:
          </Text>
          <Text style={dateHighlight}>
            Tu acceso finalizará el: <strong>{endDate}</strong>
          </Text>
        </Section>

        <Text style={text}>
          Después de esta fecha, tu cuenta pasará automáticamente al plan
          Gratuito. No se te realizarán más cobros.
        </Text>

        <Text style={text}>
          Si cambias de opinión, puedes reactivar tu suscripción en cualquier
          momento desde tu perfil.
        </Text>

        <Section style={btnContainer}>
          <Button style={button} href={`${baseUrl}/dashboard/profile/billing`}>
            Reactivar Suscripción
          </Button>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          GymRat+ - Tu compañero de entrenamiento definitivo.
          <br />
          Si tienes alguna pregunta, responde a este correo.
        </Text>
      </Container>
    </Body>
  </Html>
);

export const renderCancellationEmail = (props: CancellationEmailProps) =>
  render(<CancellationEmail {...props} />);

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  borderRadius: "10px",
  maxWidth: "600px",
};

const header = {
  display: "flex",
  alignItems: "center",
  marginBottom: "24px",
};

const logo = {
  marginRight: "10px",
};

const brandName = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#000000",
  margin: "0",
};

const h1 = {
  color: "#333",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 20px",
  padding: "0",
};

const text = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
  marginBottom: "20px",
};

const box = {
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "24px",
  border: "1px solid #e6e6e6",
};

const paragraph = {
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 15px",
  color: "#333",
};

const dateHighlight = {
  fontSize: "16px",
  color: "#000",
  margin: "0",
};

const btnContainer = {
  textAlign: "center" as const,
  marginTop: "30px",
  marginBottom: "30px",
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
};
