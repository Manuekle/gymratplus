"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Image01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { cn } from "@/lib/utils/utils";

interface ImageUploadButtonProps {
  chatId: string;
  onUploadComplete: (
    fileUrl: string,
    fileName: string,
    fileSize: number,
    mimeType: string,
  ) => void;
  disabled?: boolean;
}

export function ImageUploadButton({
  chatId,
  onUploadComplete,
  disabled,
}: ImageUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image type
    if (!file.type.startsWith("image/")) {
      toast.error("Error", {
        description: "Por favor selecciona una imagen válida",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Error", {
        description: "La imagen es demasiado grande (máximo 10MB)",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("chatId", chatId);
      formData.append("type", "image");

      const response = await fetch("/api/chats/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al subir la imagen");
      }

      const data = await response.json();
      onUploadComplete(data.url, data.fileName, data.fileSize, data.mimeType);
      toast.success("Imagen enviada");
    } catch {
      toast.error("Error", {
        description: "No se pudo subir la imagen. Inténtalo de nuevo.",
      });
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
      />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-12 w-12 flex-shrink-0 rounded-full"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isUploading}
      >
        <HugeiconsIcon
          icon={Image01Icon}
          className={cn("h-5 w-5", isUploading && "animate-pulse")}
        />
      </Button>
    </>
  );
}
