"use server";

import { sendEmail } from "@/lib/email/resend";

export async function sendErrorEmail(errorMessage: string) {
    try {
        const result = await sendEmail({
            from: "Acme <onboarding@resend.dev>",
            to: "delivered@resend.dev",
            subject: "Error in Chat Application",
            html: `<p>An error occurred in the chat application:</p><pre>${errorMessage}</pre>`,
        });

        if (!result.success) {
            console.error("Failed to send error email:", result.error);
            return { success: false, error: result.error };
        }

        return { success: true };
    } catch (error) {
        console.error("Unexpected error sending error email:", error);
        return { success: false, error: "Unexpected error" };
    }
}
