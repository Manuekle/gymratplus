import { Client, Environment } from "@paypal/paypal-server-sdk";

// Configurar el cliente de PayPal
export function getPayPalClient(): Client {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const environment = process.env.PAYPAL_ENVIRONMENT || "sandbox"; // 'sandbox' o 'live'

  if (!clientId || !clientSecret) {
    throw new Error(
      "PayPal credentials not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables."
    );
  }

  return new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: clientId,
      oAuthClientSecret: clientSecret,
    },
    environment: environment === "live" ? Environment.Production : Environment.Sandbox,
  });
}

// URL base de la aplicación para callbacks y webhooks
export function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

