import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not defined in environment variables");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Company information for emails
export const COMPANY_INFO = {
  name: "GymRat Plus",
  email: "noreply@gymratplus.com",
  supportEmail: "support@gymratplus.com",
  website: "https://gymratplus.com",
  address: {
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  },
};
