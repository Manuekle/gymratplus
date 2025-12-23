"use client";

import { useChat, type UIMessage } from "@ai-sdk/react";

import { Card } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiChat02Icon, CopyIcon } from "@hugeicons/core-free-icons";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils/utils";
import { useSession } from "next-auth/react";
import { useChats } from "@/hooks/use-chats";
import { ChatList } from "@/components/chats/chat-list";
import { ChatWindow } from "@/components/chats/chat-window";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputHeader,
  PromptInputBody,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputActionAddAttachments,
} from "@/components/ai-elements/prompt-input";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Loader } from "@/components/ai-elements/loader";

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

  // Instructor chats state
  const { chats, isLoading: chatsLoading } = useChats();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(
    "rocco-ai",
  );

  const [isTyping, setIsTyping] = useState(false);

  const selectedChat = chats.find((chat) => chat.id === selectedChatId) || null;

  // Check subscription access
  useEffect(() => {
    if (user) {
      const userTier = user.subscriptionTier || "FREE";
      if (userTier !== "PRO" && userTier !== "INSTRUCTOR") {
        window.location.href = "/dashboard/profile/billing?upgrade=pro";
      }
    }
  }, [user]);

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
            <>
              {/* AI Elements Chat Implementation */}
              <div className="flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <HugeiconsIcon
                        icon={AiChat02Icon}
                        className="h-5 w-5 text-primary"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">
                        Rocco - Entrenador IA
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Asistente virtual de fitness
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col relative w-full">
                  <Conversation>
                    <ConversationContent>
                      {messages.length === 0 && (
                        <ConversationEmptyState
                          icon={
                            <div className="bg-primary/10 p-6 rounded-full mb-4 mx-auto w-fit">
                              <HugeiconsIcon
                                icon={AiChat02Icon}
                                className="h-12 w-12 text-primary"
                              />
                            </div>
                          }
                          title="¡Hola! Soy Rocco"
                          description="Pregúntame sobre entrenamiento, nutrición o técnicas de ejercicio"
                        />
                      )}
                      {messages.map((message) => (
                        <div key={message.id}>
                          {message.role === "assistant" &&
                            message.parts?.filter(
                              (part) => part.type === "source-url",
                            ).length > 0 && (
                              <Sources>
                                <SourcesTrigger
                                  count={
                                    message.parts.filter(
                                      (part) => part.type === "source-url",
                                    ).length
                                  }
                                />
                                {message.parts
                                  .filter((part) => part.type === "source-url")
                                  .map((part: any, i) => (
                                    <SourcesContent key={`${message.id}-${i}`}>
                                      <Source
                                        key={`${message.id}-${i}`}
                                        href={part.url}
                                        title={part.url}
                                      />
                                    </SourcesContent>
                                  ))}
                              </Sources>
                            )}
                          {message.parts?.map((part, i) => {
                            switch (part.type) {
                              case "text":
                                return (
                                  <Message
                                    key={`${message.id}-${i}`}
                                    from={message.role}
                                    className={cn(
                                      message.role === "user"
                                        ? "ml-auto"
                                        : "mr-auto",
                                    )}
                                  >
                                    <MessageContent>
                                      <MessageResponse>
                                        {part.text}
                                      </MessageResponse>
                                    </MessageContent>
                                    {message.role === "assistant" && (
                                      <MessageActions>
                                        <MessageAction
                                          onClick={() =>
                                            navigator.clipboard.writeText(
                                              part.text,
                                            )
                                          }
                                          label="Copy"
                                        >
                                          <HugeiconsIcon
                                            icon={CopyIcon}
                                            className="size-3"
                                          />
                                        </MessageAction>
                                      </MessageActions>
                                    )}
                                  </Message>
                                );
                              case "reasoning":
                                return (
                                  <Reasoning
                                    key={`${message.id}-${i}`}
                                    className="w-full"
                                    isStreaming={
                                      status === "streaming" &&
                                      i === message.parts.length - 1 &&
                                      message.id === messages.at(-1)?.id
                                    }
                                  >
                                    <ReasoningTrigger />
                                    <ReasoningContent>
                                      {part.text}
                                    </ReasoningContent>
                                  </Reasoning>
                                );
                              default:
                                return null;
                            }
                          })}
                        </div>
                      ))}
                      {status === "submitted" && <Loader />}
                    </ConversationContent>
                    <ConversationScrollButton />
                  </Conversation>
                </div>

                <div className="p-4 border-t shrink-0">
                  <PromptInput
                    onSubmit={async (message) => {
                      const hasText = Boolean(message.text);
                      const hasAttachments = Boolean(message.files?.length);
                      if (!(hasText || hasAttachments)) {
                        return;
                      }

                      await sendMessage({
                        parts: [{ type: "text", text: message.text || "" }],
                      } as any);
                    }}
                    className="mt-0"
                    globalDrop
                    multiple
                  >
                    <PromptInputHeader>
                      <PromptInputAttachments>
                        {(attachment) => (
                          <PromptInputAttachment
                            key={attachment.id}
                            data={attachment}
                          />
                        )}
                      </PromptInputAttachments>
                    </PromptInputHeader>
                    <PromptInputBody>
                      <PromptInputTextarea placeholder="Escribe tu pregunta..." />
                    </PromptInputBody>
                    <PromptInputFooter>
                      <PromptInputTools>
                        <PromptInputActionMenu>
                          <PromptInputActionMenuTrigger />
                          <PromptInputActionMenuContent>
                            <PromptInputActionAddAttachments />
                          </PromptInputActionMenuContent>
                        </PromptInputActionMenu>
                      </PromptInputTools>
                      <PromptInputSubmit />
                    </PromptInputFooter>
                  </PromptInput>
                </div>
              </div>
            </>
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
