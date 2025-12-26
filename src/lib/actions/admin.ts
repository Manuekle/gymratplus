"use server";

import { auth } from "@auth";

export async function isStreakAdmin() {
    const session = await auth();

    if (!session?.user?.email) return false;

    const adminEmail = process.env.AUTH_EMAIL_STREAK;

    if (!adminEmail) return false;

    return session.user.email === adminEmail;
}
