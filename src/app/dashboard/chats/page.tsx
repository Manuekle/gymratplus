"use client";

import { useChat, type UIMessage } from "@ai-sdk/react";

import { Card } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiChat02Icon, SentIcon } from "@hugeicons/core-free-icons";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils/utils";
import { useSession } from "next-auth/react";
import { useChats } from "@/hooks/use-chats";
import { ChatList } from "@/components/chats/chat-list";
import { ChatWindow } from "@/components/chats/chat-window";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Definir interfaz para el usuario de la sesión
interface CustomUser {
  id?: string;
  name?: string | null;
  subscriptionTier?: string;
}

// Helper function to extract text content from UIMessage
function getMessageText(message: UIMessage): string {
  // Check if message has parts (new API)
  if ("parts" in message && Array.isArray(message.parts)) {
    return message.parts
      .filter((part: any) => part.type === "text")
      .map((part: any) => part.text)
      .join("");
  }
  // Fallback to content property if it exists (legacy)
  if ("content" in message && typeof message.content === "string") {
    return message.content;
  }
  return "";
}

// Helper to get images from message

export default function ChatPage() {
  const { data: session } = useSession();
  const user = session?.user as CustomUser;

  // Using standard useChat configuration. 'api' defaults to '/api/chat'.
  const { messages, sendMessage, status } = useChat();

  // Local input state for Rocco chat
  const [localInput, setLocalInput] = useState("");

  // Instructor chats state
  const { chats, isLoading: chatsLoading } = useChats();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(
    "rocco-ai",
  );

  const [isTyping, setIsTyping] = useState(false);

  const selectedChat = chats.find((chat) => chat.id === selectedChatId) || null;

  // Check PRO access only when selecting Rocco AI
  useEffect(() => {
    if (user && selectedChatId === "rocco-ai") {
      const userTier = user.subscriptionTier || "FREE";
      if (userTier !== "PRO" && userTier !== "INSTRUCTOR") {
        // Redirect to upgrade page
        window.location.href = "/dashboard/profile/billing?upgrade=pro";
      }
    }
  }, [user, selectedChatId]);

  // Memorizar el objeto Rocco para evitar re-renders innecesarios
  const roccoChat = useMemo(() => {
    const lastMessage =
      messages.length > 0 ? messages[messages.length - 1] : null;

    return {
      id: "rocco-ai",
      studentInstructorId: "rocco-ai",
      otherUser: {
        id: "rocco-ai",
        name: "Rocco - Entrenador IA",
        image: null,
        email: null,
      },
      lastMessage: lastMessage
        ? {
          id: lastMessage.id,
          content: getMessageText(lastMessage),
          senderId: lastMessage.role === "user" ? user?.id || "" : "rocco-ai",
          sender: {
            id: lastMessage.role === "user" ? user?.id || "" : "rocco-ai",
            name: lastMessage.role === "user" ? user?.name || "Tú" : "Rocco",
            image: null,
            email: null,
          },
          type: "text",
          read: true,
          createdAt: new Date().toISOString(),
        }
        : null,
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
    };
  }, [messages, user]);

  const allChats = useMemo(() => [roccoChat, ...chats], [roccoChat, chats]);

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <div className="flex-none mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Chats</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Comunícate con tu instructor o consulta con Rocco IA
        </p>
      </div>

      <div className="grid md:grid-cols-[350px_1fr] gap-4 h-full overflow-hidden">
        {/* Chat List */}
        <Card className="flex flex-col overflow-hidden p-0">
          {chatsLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">Cargando chats...</p>
            </div>
          ) : (
            <ChatList
              chats={allChats}
              selectedChatId={selectedChatId}
              onSelectChat={setSelectedChatId}
              isTyping={isTyping}
            />
          )}
        </Card>

        {/* Chat Window */}
        <Card className="flex flex-col overflow-hidden p-0">
          {selectedChatId === "rocco-ai" ? (
            <div className="flex-1 flex flex-col h-full bg-muted/20 dark:bg-muted/10 min-h-0">
              {/* Header */}
              <div className="border-b bg-background dark:bg-background flex items-center px-4 py-3 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <HugeiconsIcon
                      icon={AiChat02Icon}
                      className="h-4 w-4 text-primary"
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xs font-medium">
                      Rocco - Entrenador IA
                    </p>
                    {status === "streaming" && (
                      <p className="text-xs text-muted-foreground italic">
                        escribiendo...
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 space-y-3">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                      <div className="bg-primary/10 p-6 rounded-full mb-4">
                        <HugeiconsIcon
                          icon={AiChat02Icon}
                          className="h-12 w-12 text-primary"
                        />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        ¡Hola! Soy Rocco
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Pregúntame sobre entrenamiento, nutrición o técnicas de
                        ejercicio
                      </p>
                    </div>
                  )}
                  {messages.map((message) => {
                    const isOwn = message.role === "user";
                    const textContent = getMessageText(message);

                    return (
                      <div
                        key={message.id}
                        className={cn("flex gap-2.5", isOwn && "flex-row-reverse")}
                      >
                        {!isOwn && (
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <HugeiconsIcon
                              icon={AiChat02Icon}
                              className="h-4 w-4 text-primary"
                            />
                          </div>
                        )}
                        <div
                          className={cn(
                            "flex flex-col max-w-[75%] sm:max-w-[65%]",
                            isOwn && "items-end"
                          )}
                        >
                          {!isOwn && (
                            <p className="text-xs font-medium text-foreground mb-1 px-1">
                              Rocco
                            </p>
                          )}
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-2.5 text-sm break-words whitespace-pre-wrap",
                              isOwn
                                ? "bg-primary text-primary-foreground"
                                : "bg-background dark:bg-background border border-border/50 dark:border-border/30"
                            )}
                          >
                            {textContent}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {status === "submitted" && (
                    <div className="flex gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <HugeiconsIcon
                          icon={AiChat02Icon}
                          className="h-4 w-4 text-primary"
                        />
                      </div>
                      <div className="flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-background dark:bg-background border border-border/50">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t bg-background dark:bg-background p-3 flex-shrink-0">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative bg-muted/50 dark:bg-muted/30 rounded-2xl border border-border/50 dark:border-border/30 focus-within:bg-background dark:focus-within:bg-background focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                    <Input
                      type="text"
                      value={localInput}
                      onChange={(e) => setLocalInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (localInput.trim()) {
                            sendMessage({
                              parts: [{ type: "text", text: localInput }],
                            } as any);
                            setLocalInput("");
                          }
                        }
                      }}
                      placeholder="Escribe un mensaje..."
                      className="h-11 text-xs px-4 pr-12 border-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/60"
                      disabled={status === "streaming"}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      if (localInput.trim()) {
                        sendMessage({
                          parts: [{ type: "text", text: localInput }],
                        } as any);
                        setLocalInput("");
                      }
                    }}
                    disabled={!localInput.trim() || status === "streaming"}
                    size="icon"
                    className="h-11 w-11 flex-shrink-0 rounded-full bg-primary text-primary-foreground shadow-sm hover:shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <HugeiconsIcon icon={SentIcon} className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          ) : selectedChat ? (
            <ChatWindow
              chatId={selectedChatId!}
              chat={selectedChat}
              onTypingChange={setIsTyping}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">
                Selecciona un chat para comenzar
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
