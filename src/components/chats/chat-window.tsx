"use client";

import { useState, useRef, useEffect } from "react";
import { useChatMessages } from "@/hooks/use-chat-messages";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SentIcon,
  Cancel01Icon,
  MoreHorizontalIcon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/utils";
import { useSession } from "next-auth/react";
import { ChatMessageRenderer } from "./chat-message-renderer";
import { ImageUploadButton } from "./image-upload-button";
import type { Chat } from "@/hooks/use-chats";

interface ChatWindowProps {
  chatId: string;
  chat: Chat | null;
  onTypingChange?: (isTyping: boolean) => void;
}

export function ChatWindow({ chatId, chat, onTypingChange }: ChatWindowProps) {
  const { data: session } = useSession();
  const {
    messages,
    isLoading,
    isSending,
    sendMessage,
    editMessage,
    deleteMessage,
    clearChat,
    messagesEndRef,
  } = useChatMessages(chatId);
  const [inputValue, setInputValue] = useState("");
  const [replyingTo, setReplyingTo] = useState<(typeof messages)[0] | null>(
    null,
  );
  const [isTyping, setIsTyping] = useState(false); // Estado del OTRO usuario escribiendo
  const [isUserTyping, setIsUserTyping] = useState(false); // Estado del usuario actual escribiendo
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingPollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingNotificationRef = useRef<number>(0);

  // Enviar estado de typing al servidor cuando el usuario está escribiendo
  useEffect(() => {
    if (!chatId) return;

    const hasContent = inputValue.trim().length > 0 || isSending;

    // Limpiar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Si está escribiendo, notificar al servidor inmediatamente
    if (hasContent && !isUserTyping) {
      setIsUserTyping(true);
      const now = Date.now();
      // Solo enviar si pasaron al menos 1 segundo desde la última notificación
      if (now - lastTypingNotificationRef.current > 1000) {
        fetch(`/api/chats/${chatId}/typing`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isTyping: true }),
        });
        lastTypingNotificationRef.current = now;
      }
    } else if (!hasContent && isUserTyping) {
      // Si dejó de escribir, esperar un poco antes de notificar
      typingTimeoutRef.current = setTimeout(() => {
        setIsUserTyping(false);
        fetch(`/api/chats/${chatId}/typing`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isTyping: false }),
        });
        lastTypingNotificationRef.current = Date.now();
      }, 1000);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [inputValue, isSending, chatId, isUserTyping]);

  // Limpiar estado de typing cuando cambia el chat
  useEffect(() => {
    // Limpiar estado cuando cambia el chat
    setIsTyping(false);
    setIsUserTyping(false);
    if (onTypingChange) {
      onTypingChange(false);
    }
  }, [chatId, onTypingChange]);

  // Limpiar estado de typing cuando se envía el mensaje
  useEffect(() => {
    if (!isSending && inputValue.trim() === "" && isUserTyping) {
      setIsUserTyping(false);
      if (chatId) {
        fetch(`/api/chats/${chatId}/typing`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isTyping: false }),
        });
      }
    }
  }, [isSending, inputValue, chatId, isUserTyping]);

  // Polling para recibir el estado de typing del otro usuario
  useEffect(() => {
    if (!chatId) {
      setIsTyping(false);
      if (typingPollingRef.current) {
        clearInterval(typingPollingRef.current);
        typingPollingRef.current = null;
      }
      return;
    }

    // Función para verificar el estado de typing del otro usuario
    const checkTypingStatus = async () => {
      try {
        const response = await fetch(`/api/chats/${chatId}/typing`);
        if (response.ok) {
          const data = await response.json();
          setIsTyping(data.isTyping || false);
          if (onTypingChange) {
            onTypingChange(data.isTyping || false);
          }
        }
      } catch {}
    };

    // Verificar inmediatamente
    checkTypingStatus();

    // Polling cada 2 segundos
    typingPollingRef.current = setInterval(checkTypingStatus, 2000);

    return () => {
      if (typingPollingRef.current) {
        clearInterval(typingPollingRef.current);
        typingPollingRef.current = null;
      }
    };
  }, [chatId, onTypingChange]);

  const handleSend = () => {
    if (inputValue.trim() && !isSending) {
      sendMessage(
        inputValue.trim(),
        replyingTo
          ? {
              type: "text",
              replyToId: replyingTo.id,
            }
          : undefined,
      );
      setInputValue("");
      setReplyingTo(null);
      // Notificar que dejó de escribir
      if (chatId && isUserTyping) {
        setIsUserTyping(false);
        fetch(`/api/chats/${chatId}/typing`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isTyping: false }),
        });
      }
    }
  };

  const handleReply = (messageId: string) => {
    const messageToReply = messages.find((m) => m.id === messageId);
    if (messageToReply) {
      setReplyingTo(messageToReply);
      inputRef.current?.focus();
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleClearChat = async () => {
    setIsClearing(true);
    try {
      await clearChat();
      setIsClearDialogOpen(false);
    } catch {
    } finally {
      setIsClearing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const groupMessagesByDate = () => {
    const groups: { date: string; messages: typeof messages }[] = [];
    let currentDate = "";

    messages.forEach((msg) => {
      const msgDate = format(new Date(msg.createdAt), "yyyy-MM-dd");
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: currentDate, messages: [] });
      }
      const lastGroup = groups[groups.length - 1];
      if (lastGroup) {
        lastGroup.messages.push(msg);
      }
    });

    return groups;
  };

  const formatGroupDate = (dateString: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");

    if (dateString === today) {
      return "Hoy";
    }
    if (dateString === yesterday) {
      return "Ayer";
    }

    const date = new Date(dateString);
    return format(date, "EEEE, d 'de' MMMM", { locale: es });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col h-full bg-muted/20 dark:bg-muted/10 min-h-0">
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-6">
            {/* Date separator skeleton */}
            <div className="flex items-center justify-center my-6">
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            {/* Message skeletons */}
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => {
                const isOwn = i % 2 === 0;
                return (
                  <div
                    key={i}
                    className={cn("flex gap-2.5", isOwn && "flex-row-reverse")}
                  >
                    {!isOwn && (
                      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    )}
                    <div
                      className={cn(
                        "flex flex-col max-w-[75%] sm:max-w-[65%]",
                        isOwn && "items-end",
                      )}
                    >
                      {!isOwn && <Skeleton className="h-3 w-20 mb-1" />}
                      <Skeleton
                        className={cn(
                          "rounded-2xl px-4 py-2.5",
                          isOwn ? "h-12 w-48" : "h-12 w-56",
                        )}
                      />
                      <Skeleton className="h-2 w-16 mt-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        {/* Input skeleton */}
        <div className="border-t bg-background dark:bg-background p-3">
          <div className="flex items-end gap-2">
            <Skeleton className="h-11 w-11 rounded-full" />
            <Skeleton className="flex-1 h-11 rounded-2xl" />
            <Skeleton className="h-11 w-11 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate();

  return (
    <div className="flex-1 flex flex-col h-full bg-muted/20 dark:bg-muted/10 min-h-0">
      {/* Header */}
      {chat && (
        <div className="border-b bg-background dark:bg-background flex items-center justify-between px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={chat.otherUser.image || undefined}
                alt={chat.otherUser.name || "Usuario"}
              />
              <AvatarFallback className="text-xs">
                {chat.otherUser.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-xs font-medium">
                {chat.otherUser.name || "Usuario"}
              </p>
              {isTyping && (
                <p className="text-xs text-muted-foreground italic">
                  escribiendo...
                </p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Ver perfil</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsClearDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4 mr-2" />
                Vaciar chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-6">
          {messageGroups.map((group) => (
            <div key={group.date}>
              <div className="flex items-center justify-center my-6">
                <div className="px-4 py-1.5 bg-background dark:bg-background border border-border/50 dark:border-border/30 rounded-full">
                  <p className="text-xs font-medium text-muted-foreground">
                    {formatGroupDate(group.date)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {group.messages.map((message, idx) => {
                  const isOwn = message.senderId === session?.user?.id;
                  const prevMessage = idx > 0 ? group.messages[idx - 1] : null;
                  const showAvatar =
                    !prevMessage ||
                    prevMessage.senderId !== message.senderId ||
                    new Date(message.createdAt).getTime() -
                      new Date(prevMessage.createdAt).getTime() >
                      300000; // 5 minutes

                  return (
                    <ChatMessageRenderer
                      key={message.id}
                      message={message}
                      isOwn={isOwn}
                      showAvatar={showAvatar}
                      showName={showAvatar && !isOwn}
                      formatMessageDate={formatMessageDate}
                      onEdit={editMessage}
                      onDelete={deleteMessage}
                      onReply={handleReply}
                      allMessages={messages}
                    />
                  );
                })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-background dark:bg-background flex flex-col">
        {/* Preview del mensaje respondido */}
        {replyingTo && (
          <div className="px-4 py-2.5 border-b bg-muted/40 dark:bg-muted/20 flex-shrink-0">
            <div className="flex items-start gap-3">
              <div className="w-0.5 h-full min-h-[40px] bg-primary rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground mb-1">
                  Respondiendo a {replyingTo.sender.name || "Usuario"}
                </p>
                <div className="px-2.5 py-1.5 rounded-md bg-background dark:bg-background border border-border/50">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {replyingTo.content ||
                      (replyingTo.type === "image" && "📷 Imagen") ||
                      (replyingTo.type === "video" && "🎥 Video") ||
                      (replyingTo.type === "file" && "📎 Archivo") ||
                      "Mensaje"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 flex-shrink-0 hover:bg-destructive/10 rounded-full"
                onClick={handleCancelReply}
              >
                <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Input y botones */}
        <div className="p-3 flex-shrink-0 bg-background dark:bg-background">
          <div className="flex items-end gap-2">
            {/* Botones de acción */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <ImageUploadButton
                chatId={chatId}
                onUploadComplete={(fileUrl, fileName, fileSize, mimeType) => {
                  sendMessage(undefined, {
                    type: "image",
                    fileUrl,
                    fileName,
                    fileSize,
                    mimeType,
                  });
                  setReplyingTo(null);
                }}
                disabled={isSending}
              />
            </div>

            {/* Input de texto */}
            <div className="flex-1 relative bg-muted/50 dark:bg-muted/30 rounded-2xl border border-border/50 dark:border-border/30 focus-within:bg-background dark:focus-within:bg-background focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <Input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  replyingTo
                    ? "Escribe tu respuesta..."
                    : "Escribe un mensaje..."
                }
                className="h-11 text-xs px-4 pr-12 border-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/60"
                disabled={isSending}
              />
            </div>

            {/* Botón de enviar */}
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isSending}
              size="icon"
              className="h-11 w-11 flex-shrink-0 rounded-full bg-primary text-primary-foreground shadow-sm hover:shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <HugeiconsIcon icon={SentIcon} className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Diálogo de confirmación para vaciar chat */}
      <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Vaciar el chat?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará todos los mensajes de este chat.{" "}
              <span className="text-destructive font-semibold">
                Esta acción no se puede deshacer.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearChat}
              disabled={isClearing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isClearing ? "Vaciando..." : "Vaciar chat"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
