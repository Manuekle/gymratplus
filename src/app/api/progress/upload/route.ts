import { NextResponse, NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/database/prisma";
import { auth } from "@auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const viewType = formData.get("type") as string; // front, side, back
    const weight = formData.get("weight")
      ? parseFloat(formData.get("weight") as string)
      : undefined;
    const notes = (formData.get("notes") as string) || undefined;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!["front", "side", "back"].includes(viewType)) {
      return NextResponse.json({ error: "Invalid view type" }, { status: 400 });
    }

    // Generate filename
    const userId = session.user.id;
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop() || "jpg";
    const filename = `progress/${userId}/${timestamp}-${viewType}.${fileExtension}`;

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "Blob token missing" },
        { status: 500 },
      );
    }

    // Upload to Blob
    const blob = await put(filename, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Find or Create Progress Entry for TODAY
    // We normalize "today" to start of day or similar? Or just check date range.
    // For simplicity, let's look for an entry created within the last 24h or same calendar day?
    // Let's use Prisma to find one created > start of today.

    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const existingEntry = await prisma.progressPhoto.findFirst({
      where: {
        userId,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    let entry;
    const updateData: any = {
      weight: weight,
      notes: notes ? notes : undefined, // Only update notes if provided? Or merge?
    };

    if (viewType === "front") updateData.frontUrl = blob.url;
    if (viewType === "side") updateData.sideUrl = blob.url;
    if (viewType === "back") updateData.backUrl = blob.url;

    if (existingEntry) {
      // Update existing for today
      entry = await prisma.progressPhoto.update({
        where: { id: existingEntry.id },
        data: updateData,
      });
    } else {
      // Create new
      entry = await prisma.progressPhoto.create({
        data: {
          userId,
          weight,
          notes,
          frontUrl: viewType === "front" ? blob.url : undefined,
          sideUrl: viewType === "side" ? blob.url : undefined,
          backUrl: viewType === "back" ? blob.url : undefined,
        },
      });
    }

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
