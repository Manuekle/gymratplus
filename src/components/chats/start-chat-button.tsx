"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Message01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

interface StartChatButtonProps {
  studentInstructorId: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function StartChatButton({
  studentInstructorId,
  className,
  variant = "outline",
  size = "sm",
}: StartChatButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartChat = async () => {
    try {
      setIsLoading(true);

      // Create or get chat
      const response = await fetch("/api/chats/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentInstructorId }),
      });

      if (!response.ok) {
        throw new Error("Error al crear el chat");
      }

      const chat = await response.json();

      // Navigate to chats page with the chat selected
      router.push(`/dashboard/chats?chat=${chat.id}`);
    } catch {
      toast.error("Error al iniciar el chat");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleStartChat}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      <HugeiconsIcon icon={Message01Icon} className="h-4 w-4" />
      {size !== "icon" && <span className="ml-2">Mensaje</span>}
    </Button>
  );
}
