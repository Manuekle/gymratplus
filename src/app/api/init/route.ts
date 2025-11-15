import { NextResponse } from "next/server";
import { initNotificationSubscriber } from "@/lib/database/redis-subscriber";

// This route will be called when the app starts
export async function GET() {
  try {
    await initNotificationSubscriber();
    return NextResponse.json({
      success: true,
      message: "Redis subscriber initialized",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to initialize Redis subscriber" },
      { status: 500 },
    );
  }
}
