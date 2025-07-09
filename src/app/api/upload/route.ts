import { NextResponse, NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 },
      );
    }

    // Generate a unique filename with user ID
    const userId = session.user.id;
    const filename = `${userId}-${Date.now()}-${file.name}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Actualizar la imagen en la base de datos
    await prisma.user.update({
      where: { id: userId },
      data: { image: blob.url },
    });

    // Limpiar todas las cachés relacionadas con el usuario
    const cacheKeys = [
      `user:${userId}:data`,
      `profile:${userId}`,
      `session:${userId}`,
    ];

    // Eliminar todas las cachés
    await Promise.all(cacheKeys.map((key) => redis.del(key)));

    // Obtener el usuario actualizado
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        experienceLevel: true,
        image: true,
        profile: true,
      },
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      user: updatedUser,
      message: "Imagen actualizada correctamente",
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
