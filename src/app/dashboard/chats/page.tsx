"use client";

import { useChat } from "@ai-sdk/react";

import { Card } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiChat02Icon, SentIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatWindow } from "@/components/chats/chat-window";
import { cn } from "@/lib/utils/utils";
import { useState } from "react";
import { toast } from "sonner";
import { WorkoutPlanCard } from "@/components/chats/workout-plan-card";
import { NutritionPlanCard } from "@/components/chats/nutrition-plan-card";

export default function ChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [savedPlans, setSavedPlans] = useState<Record<string, boolean>>({});

  // Configuración del chat AI
  const { messages, sendMessage, status } = useChat({
    id: "rocco-chat",
    initialMessages: [],
  });

  const [input, setInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    sendMessage({ text: input });
    setInput("");
  };

  // Mock chats data for list
  const chats: any[] = []; // Chat list would come from server

  const roccoChat = {
    id: "rocco-ai",
    studentInstructor: {
      instructor: {
        user: {
          name: "Rocco",
          image: null,
        },
      },
    },
    messages: [],
    updatedAt: new Date().toISOString(),
  };

  const selectedChat =
    selectedChatId === "rocco-ai"
      ? roccoChat
      : chats.find((c) => c.id === selectedChatId) || null;

  const handleSavePlan = async (
    type: "workout" | "nutrition",
    plan: any,
    toolCallId: string,
  ) => {
    try {
      const response = await fetch("/api/ai/save-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, plan }),
      });

      if (!response.ok) throw new Error("Error guardando el plan");

      setSavedPlans((prev) => ({ ...prev, [toolCallId]: true }));
      toast.success(
        type === "workout"
          ? "Plan de entrenamiento guardado"
          : "Plan nutricional guardado",
      );
    } catch (error) {
      toast.error("Hubo un error al guardar el plan");
      console.error(error);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)] flex flex-col -m-4 md:m-0">
      <div className="grid md:grid-cols-[350px_1fr] gap-4 h-full overflow-hidden">
        {/* Chat List - Hidden on mobile if chat selected */}
        <Card
          className={cn(
            "flex flex-col overflow-hidden p-0 border-0 md:border",
            selectedChatId ? "hidden md:flex" : "flex h-full",
          )}
        >
          <div className="p-4 border-b">
            <h2 className="font-semibold">Mensajes</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              <div
                className={cn(
                  "p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-colors",
                  selectedChatId === "rocco-ai"
                    ? "bg-accent"
                    : "hover:bg-muted",
                )}
                onClick={() => setSelectedChatId("rocco-ai")}
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <HugeiconsIcon
                    icon={AiChat02Icon}
                    className="h-5 w-5 text-primary"
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">Rocco</p>
                    <span className="text-[10px] text-muted-foreground">
                      Ahora
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    Entrenador IA
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Window - Full screen on mobile */}
        <Card
          className={cn(
            "flex-col overflow-hidden p-0 border-0 md:border h-full",
            !selectedChatId ? "hidden md:flex" : "flex",
          )}
        >
          {selectedChatId === "rocco-ai" ? (
            <div className="flex-1 flex flex-col h-full bg-background min-h-0">
              {/* Header */}
              <div className="border-b flex items-center justify-between px-4 py-3 flex-shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden -ml-2"
                    onClick={() => setSelectedChatId(null)}
                  >
                    <HugeiconsIcon
                      icon={AiChat02Icon}
                      className="h-5 w-5 rotate-180"
                    />
                  </Button>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <HugeiconsIcon
                        icon={AiChat02Icon}
                        className="h-4 w-4 text-primary"
                      />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">Rocco</p>
                      <p className="text-[10px] text-muted-foreground">
                        {status === "streaming"
                          ? "escribiendo..."
                          : "Entrenador IA"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 space-y-4">
                  {messages.map((message) => {
                    const isOwn = message.role === "user";
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3",
                          isOwn && "flex-row-reverse",
                        )}
                      >
                        <div
                          className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                            isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-primary/10",
                          )}
                        >
                          {isOwn ? (
                            <span className="text-xs font-bold">Yo</span>
                          ) : (
                            <HugeiconsIcon
                              icon={AiChat02Icon}
                              className="h-4 w-4 text-primary"
                            />
                          )}
                        </div>
                        <div
                          className={cn(
                            "rounded-lg p-3 max-w-[85%] text-sm",
                            isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted",
                          )}
                        >
                          {message.parts.map((part, i) => {
                            if (part.type === "text") {
                              return (
                                <p
                                  key={i}
                                  className="text-sm leading-relaxed whitespace-pre-wrap"
                                >
                                  {part.text}
                                </p>
                              );
                            }
                            if (part.type === "tool-invocation") {
                              const toolInvocation = part as any;
                              const state = toolInvocation.state;
                              const toolName = toolInvocation.toolName;
                              const result =
                                toolInvocation.result ?? toolInvocation.output;

                              if (
                                toolName === "generateTrainingPlan" &&
                                (state === "result" ||
                                  state === "output-available")
                              ) {
                                return (
                                  <div
                                    key={toolInvocation.toolCallId}
                                    className="mt-4"
                                  >
                                    <WorkoutPlanCard
                                      plan={result}
                                      onSave={() =>
                                        handleSavePlan(
                                          "workout",
                                          result,
                                          toolInvocation.toolCallId,
                                        )
                                      }
                                      isSaved={
                                        savedPlans[toolInvocation.toolCallId]
                                      }
                                    />
                                  </div>
                                );
                              }
                              if (
                                toolName === "generateNutritionPlan" &&
                                (state === "result" ||
                                  state === "output-available")
                              ) {
                                return (
                                  <div
                                    key={toolInvocation.toolCallId}
                                    className="mt-4"
                                  >
                                    <NutritionPlanCard
                                      plan={result}
                                      onSave={() =>
                                        handleSavePlan(
                                          "nutrition",
                                          result,
                                          toolInvocation.toolCallId,
                                        )
                                      }
                                      isSaved={
                                        savedPlans[toolInvocation.toolCallId]
                                      }
                                    />
                                  </div>
                                );
                              }
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {(status === "submitted" || status === "streaming") &&
                    messages[messages.length - 1]?.role === "user" && (
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <HugeiconsIcon
                            icon={AiChat02Icon}
                            className="h-4 w-4 text-primary"
                          />
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce delay-75"></div>
                            <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce delay-150"></div>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <form
                onSubmit={handleSubmit}
                className="p-4 border-t bg-card/50 backdrop-blur-sm flex items-center gap-2"
              >
                <Input
                  placeholder="Pregúntale a Rocco..."
                  value={input}
                  onChange={handleInputChange}
                  className="flex-1 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary min-h-[44px]"
                  disabled={status === "submitted" || status === "streaming"}
                  autoComplete="off"
                />
                <Button
                  size="icon"
                  type="submit"
                  disabled={
                    !input.trim() ||
                    status === "submitted" ||
                    status === "streaming"
                  }
                  className="h-10 w-10 shrink-0 rounded-full shadow-sm"
                >
                  <HugeiconsIcon icon={SentIcon} className="h-5 w-5" />
                </Button>
              </form>
            </div>
          ) : selectedChat ? (
            <ChatWindow
              chatId={selectedChatId!}
              chat={selectedChat as any} // Cast to any because mock chat might not match exact type
              onBack={() => setSelectedChatId(null)}
            />
          ) : (
            <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground">
              <div className="bg-muted/50 p-4 rounded-full mb-4">
                <HugeiconsIcon icon={AiChat02Icon} className="h-8 w-8" />
              </div>
              <p>Selecciona un chat para comenzar</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
