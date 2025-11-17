"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils/utils";
import type { Chat } from "@/hooks/use-chats";
import { useSession } from "next-auth/react";

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  isTyping?: boolean;
}

export function ChatList({
  chats,
  selectedChatId,
  onSelectChat,
  isTyping = false,
}: ChatListProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const [searchTerm, setSearchTerm] = useState("");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = format(date, "yyyy-MM-dd");
    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");

    if (dateStr === today) {
      return format(date, "HH:mm", { locale: es });
    }
    if (dateStr === yesterday) {
      return "Ayer";
    }
    return format(date, "d MMM", { locale: es });
  };

  const getMessagePreview = (message: Chat["lastMessage"]) => {
    if (!message) return "Sin mensajes";

    const isOwnMessage = message.senderId === currentUserId;
    const isRead = isOwnMessage ? true : message.read;

    let preview = "";

    switch (message.type) {
      case "image":
        preview = "📷 Foto";
        break;
      case "audio":
        preview = "🎤 Audio";
        break;
      case "video":
        preview = "🎥 Video";
        break;
      case "file":
        preview = "📎 Archivo";
        break;
      default:
        preview = message.content || "Mensaje";
    }

    return { preview, isRead };
  };

  // Filtrar chats según el término de búsqueda
  const filteredChats = chats.filter((chat) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    const userName = chat.otherUser.name?.toLowerCase() || "";
    const lastMessage = chat.lastMessage?.content?.toLowerCase() || "";
    return userName.includes(searchLower) || lastMessage.includes(searchLower);
  });

  const renderChatItem = (chat: Chat) => {
    const previewData = getMessagePreview(chat.lastMessage);
    const preview =
      typeof previewData === "string" ? previewData : previewData.preview;
    const isRead = typeof previewData === "string" ? true : previewData.isRead;
    return (
      <Button
        key={chat.id}
        onClick={() => onSelectChat(chat.id)}
        variant="ghost"
        className={cn(
          "w-full p-3 rounded-none transition-all text-left justify-start h-auto",
          "hover:bg-muted/50 focus:bg-muted/50",
          selectedChatId === chat.id && "bg-muted dark:bg-muted/50",
        )}
      >
        <div className="flex items-center gap-3 w-full">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage
              src={chat.otherUser.image || undefined}
              alt={chat.otherUser.name || "Usuario"}
            />
            <AvatarFallback className="text-xs font-semibold bg-muted">
              {chat.otherUser.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-xs font-medium truncate">
                {chat.otherUser.name || "Usuario"}
              </p>
              {chat.lastMessage && (
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {formatDate(chat.lastMessage.createdAt)}
                </span>
              )}
            </div>

            {selectedChatId === chat.id && isTyping ? (
              <p className="text-xs text-muted-foreground italic">
                escribiendo...
              </p>
            ) : chat.lastMessage ? (
              <div className="flex items-center gap-2">
                <p
                  className={cn(
                    "text-xs truncate flex-1",
                    isRead
                      ? "text-muted-foreground"
                      : "text-foreground font-medium",
                  )}
                >
                  {preview}
                </p>
                {chat.unreadCount > 0 && (
                  <Badge
                    variant="default"
                    className="h-5 min-w-5 px-1.5 text-[10px] font-semibold flex-shrink-0 rounded-full bg-primary text-primary-foreground"
                  >
                    {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                  </Badge>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Sin mensajes
              </p>
            )}
          </div>
        </div>
      </Button>
    );
  };

  const renderChatsList = () => {
    if (filteredChats.length === 0) {
      return (
        <div className="flex items-center justify-center p-6">
          <p className="text-xs text-muted-foreground text-center">
            No tienes chats activos
          </p>
        </div>
      );
    }
    return filteredChats.map(renderChatItem);
  };

  if (chats.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Barra de búsqueda */}
        <div className="p-3 border-b flex-shrink-0">
          <div className="relative">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input
              placeholder="Buscar chats y personas"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-xs text-muted-foreground text-center">
            No tienes chats activos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Barra de búsqueda */}
      <div className="p-3 border-b flex-shrink-0">
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            placeholder="Buscar chats y personas"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Lista de chats */}
      <div className="md:hidden">
        <div>{renderChatsList()}</div>
      </div>
      <ScrollArea className="hidden md:block md:flex-1">
        <div>{renderChatsList()}</div>
      </ScrollArea>
    </div>
  );
}
