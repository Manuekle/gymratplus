"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Download01Icon,
  File01Icon,
  Edit02Icon,
  Delete02Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils/utils";
import type { ChatMessage } from "@/hooks/use-chat-messages";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ChatMessageRendererProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar: boolean;
  showName: boolean;
  formatMessageDate: (dateString: string) => string;
  onEdit?: (messageId: string, newContent: string) => Promise<void>;
  onDelete?: (messageId: string) => Promise<void>;
  onReply?: (messageId: string) => void;
  allMessages?: ChatMessage[];
}

export function ChatMessageRenderer({
  message,
  isOwn,
  showAvatar,
  showName,
  formatMessageDate,
  onEdit,
  onDelete,
  onReply,
  allMessages = [],
}: ChatMessageRendererProps) {
  // Find the message being replied to
  const repliedToMessage = message.replyToId
    ? allMessages.find((m) => m.id === message.replyToId)
    : null;
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || "");
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Reset state when message changes
  useEffect(() => {
    setImageError(false);
    setVideoError(false);
  }, [message.id]);

  const handleImageClick = () => {
    setIsImageOpen(true);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleEdit = async () => {
    if (!onEdit || !editContent.trim()) return;
    try {
      await onEdit(message.id, editContent.trim());
      setIsEditing(false);
      toast.success("Mensaje editado");
    } catch {
      toast.error("Error al editar el mensaje");
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      await onDelete(message.id);
      toast.success("Mensaje eliminado");
    } catch {
      toast.error("Error al eliminar el mensaje");
    }
  };

  // Don't render deleted messages content, but show placeholder
  if (message.deleted) {
    return (
      <div className={cn("flex gap-2.5 group", isOwn && "flex-row-reverse")}>
        {!isOwn && (
          <div className="flex-shrink-0 w-8">
            {showAvatar ? (
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={message.sender.image || undefined}
                  alt={message.sender.name || "Usuario"}
                />
                <AvatarFallback className="text-xs">
                  {message.sender.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-8" />
            )}
          </div>
        )}

        <div
          className={cn(
            "flex flex-col max-w-[75%] sm:max-w-[65%]",
            isOwn && "items-end",
          )}
        >
          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 text-xs shadow-sm transition-all italic opacity-60",
              isOwn
                ? "bg-muted text-muted-foreground rounded-br-md"
                : "bg-muted text-muted-foreground rounded-bl-md",
            )}
          >
            <p className="text-xs">Mensaje eliminado</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1 px-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {formatMessageDate(message.createdAt)}
          </p>
        </div>
      </div>
    );
  }

  const renderMessageContent = () => {
    switch (message.type) {
      case "image":
        return (
          <div className="space-y-2">
            <div
              className="relative rounded-lg overflow-hidden cursor-pointer group"
              onClick={handleImageClick}
            >
              {imageError ? (
                <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Error al cargar la imagen
                  </p>
                </div>
              ) : (
                <Image
                  src={message.fileUrl || ""}
                  alt={message.content || "Imagen"}
                  width={400}
                  height={400}
                  className="max-w-full h-auto object-cover"
                  unoptimized
                  onError={() => setImageError(true)}
                />
              )}
              {!imageError && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              )}
            </div>
            {message.content && (
              <p className="whitespace-pre-wrap break-words text-xs">
                {message.content}
              </p>
            )}
          </div>
        );

      case "video":
        return (
          <div className="space-y-2">
            <div className="relative rounded-lg overflow-hidden">
              {videoError ? (
                <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Error al cargar el video
                  </p>
                </div>
              ) : (
                <video
                  src={message.fileUrl}
                  controls
                  className="max-w-full h-auto"
                  poster={message.thumbnail}
                  onError={() => setVideoError(true)}
                />
              )}
            </div>
            {message.content && (
              <p className="whitespace-pre-wrap break-words text-xs">
                {message.content}
              </p>
            )}
          </div>
        );

      case "file":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <HugeiconsIcon
                icon={File01Icon}
                className="h-8 w-8 text-muted-foreground flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  {message.fileName || "Archivo"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(message.fileSize)}
                </p>
              </div>
              <a
                href={message.fileUrl}
                download={message.fileName}
                className="ml-2"
              >
                <HugeiconsIcon
                  icon={Download01Icon}
                  className="h-5 w-5 text-muted-foreground hover:text-foreground"
                />
              </a>
            </div>
            {message.content && (
              <p className="whitespace-pre-wrap break-words text-xs">
                {message.content}
              </p>
            )}
          </div>
        );

      default:
        if (message.deleted) {
          return (
            <p className="text-xs italic text-muted-foreground">
              Mensaje eliminado
            </p>
          );
        }
        return (
          <p className="whitespace-pre-wrap break-words ">{message.content}</p>
        );
    }
  };

  return (
    <>
      <div className={cn("flex gap-2.5 group", isOwn && "flex-row-reverse")}>
        {!isOwn && (
          <div className="flex-shrink-0 w-8">
            {showAvatar ? (
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={message.sender.image || undefined}
                  alt={message.sender.name || "Usuario"}
                />
                <AvatarFallback className="text-xs">
                  {message.sender.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-8" />
            )}
          </div>
        )}

        <div
          className={cn(
            "flex flex-col max-w-[75%] sm:max-w-[65%]",
            isOwn && "items-end",
          )}
        >
          {!isOwn && showName && (
            <p className="text-xs font-medium text-foreground mb-1 px-1.5">
              {message.sender.name || "Usuario"}
            </p>
          )}
          <div className="relative group/message">
            <div
              className={cn(
                "rounded-2xl px-4 py-2.5 text-xs shadow-sm transition-all relative",
                isOwn
                  ? "bg-muted dark:bg-muted/80 text-foreground rounded-br-md"
                  : "bg-muted/50 dark:bg-muted/30 text-foreground rounded-bl-md border border-border/50",
              )}
            >
              {/* Botón de acciones dentro del mensaje */}
              {!message.deleted && !isEditing && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover/message:opacity-100 transition-opacity z-10"
                    >
                      <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        className="h-4 w-4"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onReply && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onReply(message.id);
                        }}
                        onSelect={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <HugeiconsIcon
                          icon={ArrowDown01Icon}
                          className="h-4 w-4 mr-2 rotate-180"
                        />
                        Responder
                      </DropdownMenuItem>
                    )}
                    {isOwn && message.type === "text" && onEdit && (
                      <DropdownMenuItem
                        onClick={() => {
                          setEditContent(message.content || "");
                          setIsEditing(true);
                        }}
                      >
                        <HugeiconsIcon
                          icon={Edit02Icon}
                          className="h-4 w-4 mr-2"
                        />
                        Editar
                      </DropdownMenuItem>
                    )}
                    {isOwn && onDelete && (
                      <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-destructive"
                      >
                        <HugeiconsIcon
                          icon={Delete02Icon}
                          className="h-4 w-4 mr-2"
                        />
                        Eliminar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Preview del mensaje respondido */}
              {repliedToMessage && (
                <div
                  className={cn(
                    "mb-2 pb-2 border-l-2 pl-2.5 pr-2 py-1.5 rounded-r-md text-xs bg-muted/30 dark:bg-muted/20",
                    isOwn ? "border-primary/50" : "border-primary/50",
                  )}
                >
                  <p className="font-medium mb-0.5 truncate text-foreground">
                    {repliedToMessage.sender.name || "Usuario"}
                  </p>
                  <p className="text-muted-foreground line-clamp-2 text-xs">
                    {repliedToMessage.content ||
                      (repliedToMessage.type === "image" && "📷 Imagen") ||
                      (repliedToMessage.type === "video" && "🎥 Video") ||
                      (repliedToMessage.type === "file" && "📎 Archivo") ||
                      "Mensaje"}
                  </p>
                </div>
              )}

              {isEditing && isOwn && message.type === "text" ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Edita tu mensaje..."
                    className="min-h-[60px] text-xs resize-none border focus-visible:ring-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setIsEditing(false);
                        setEditContent(message.content || "");
                      } else if (
                        e.key === "Enter" &&
                        (e.metaKey || e.ctrlKey)
                      ) {
                        e.preventDefault();
                        handleEdit();
                      }
                    }}
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="default"
                      onClick={() => {
                        setIsEditing(false);
                        setEditContent(message.content || "");
                      }}
                      className="h-7 px-2 text-xs"
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="default"
                      onClick={handleEdit}
                      disabled={!editContent.trim()}
                      className="h-7 px-2 text-xs"
                    >
                      Guardar
                    </Button>
                  </div>
                </div>
              ) : (
                renderMessageContent()
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1 px-1.5">
            <p className="text-xs text-muted-foreground">
              {formatMessageDate(message.createdAt)}
            </p>
            {message.edited && (
              <span className="text-xs text-muted-foreground italic">
                (editado)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isImageOpen && message.fileUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsImageOpen(false)}
        >
          <div className="relative max-w-7xl max-h-full">
            <Image
              src={message.fileUrl}
              alt={message.content || "Imagen"}
              width={1200}
              height={1200}
              className="max-w-full max-h-[90vh] object-contain"
              unoptimized
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={() => setIsImageOpen(false)}
            >
              ×
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
