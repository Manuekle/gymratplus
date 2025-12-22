import { NextResponse } from "next/server";
import webpush from "web-push";
import { prisma } from "@/lib/database/prisma";
import { auth } from "../../../../../auth.ts";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:support@gymratplus.com",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { title, message, url } = await req.json();

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: session.user.id },
  });

  const payload = JSON.stringify({
    title,
    body: message,
    url,
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        payload,
      ),
    ),
  );

  return NextResponse.json({
    success: true,
    sent: results.filter((r) => r.status === "fulfilled").length,
  });
}
