import { MercadoPagoConfig, PreApproval } from "mercadopago";

// Initialize Mercado Pago client
export function getMercadoPagoClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error(
      "Mercado Pago credentials not configured. Please set MERCADOPAGO_ACCESS_TOKEN environment variable.",
    );
  }

  const client = new MercadoPagoConfig({
    accessToken,
    options: {
      timeout: 5000,
    },
  });

  return client;
}

// Get PreApproval controller for subscriptions
export function getPreApprovalController() {
  const client = getMercadoPagoClient();
  return new PreApproval(client);
}

// Get base URL for callbacks
export function getBaseUrl(): string {
  // Check if VERCEL_URL is localhost (development)
  if (process.env.VERCEL_URL) {
    const vercelUrl = process.env.VERCEL_URL;
    // If it's localhost, use http instead of https
    if (vercelUrl.includes("localhost")) {
      return `http://${vercelUrl}`;
    }
    return `https://${vercelUrl}`;
  }
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  // For local development, use http (not https) for localhost
  // Mercado Pago sandbox accepts http://localhost
  return "http://localhost:3000";
}

// Plan IDs mapping
export const MERCADOPAGO_PLAN_IDS = {
  pro: process.env.MERCADOPAGO_PLAN_ID_PRO || "",
  instructor: process.env.MERCADOPAGO_PLAN_ID_INSTRUCTOR || "",
} as const;
