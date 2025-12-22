import { NextResponse, NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "../../../../../../../../../../auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const chatId = formData.get("chatId") as string;
    const messageType = formData.get("type") as string; // image, audio, video, file

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID required" }, { status: 400 });
    }

    // Validate file type based on message type
    const allowedTypes: Record<string, string[]> = {
      image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      audio: [
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/webm",
        "audio/mp3",
      ],
      video: ["video/mp4", "video/webm", "video/ogg"],
      file: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    };

    if (
      messageType &&
      allowedTypes[messageType] &&
      !allowedTypes[messageType].includes(file.type)
    ) {
      return NextResponse.json(
        {
          error: `Invalid file type for ${messageType}. Allowed: ${allowedTypes[messageType].join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Check file size (max 10MB for images, 50MB for audio/video, 5MB for files)
    const maxSizes: Record<string, number> = {
      image: 10 * 1024 * 1024, // 10MB
      audio: 50 * 1024 * 1024, // 50MB
      video: 50 * 1024 * 1024, // 50MB
      file: 5 * 1024 * 1024, // 5MB
    };

    const maxSize = maxSizes[messageType] || 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File size exceeds maximum allowed size (${Math.round(maxSize / 1024 / 1024)}MB)`,
        },
        { status: 400 },
      );
    }

    // Generate a unique filename with organized folder structure
    const userId = session.user.id;
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();

    // Organize files by type: audio/[chatId]/ or photos/[chatId]/
    let folderPath: string;
    if (messageType === "audio") {
      folderPath = `audio/${chatId}/${userId}-${timestamp}.${fileExtension}`;
    } else if (messageType === "image") {
      folderPath = `photos/${chatId}/${userId}-${timestamp}.${fileExtension}`;
    } else {
      // For video and file types, use a generic folder
      folderPath = `chat/${chatId}/${userId}-${timestamp}.${fileExtension}`;
    }

    const filename = folderPath;

    // Verify that the token is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "Blob storage token not configured" },
        { status: 500 },
      );
    }

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("[UPLOAD_CHAT_FILE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
