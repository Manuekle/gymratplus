"use client";

import { useChat } from "@ai-sdk/react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Robot01Icon,
  RecordIcon,
  ArrowUp01Icon,
  Add01Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatWindow } from "@/components/chats/chat-window";
import { cn } from "@/lib/utils/utils";
import { useState } from "react";
import { toast } from "sonner";
import { WorkoutPlanCard } from "@/components/chats/workout-plan-card";
import { NutritionPlanCard } from "@/components/chats/nutrition-plan-card";
import { Card, CardAction } from "@/components/ui/card";

export default function ChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [savedPlans, setSavedPlans] = useState<Record<string, boolean>>({});

  // AI Chat configuration
  const { messages, sendMessage, status } = useChat({
    id: "rocco-chat",
  });

  const [input, setInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || status === "streaming") return;

    sendMessage({ text: input });
    setInput("");
  };

  // Mock chats data
  const chats: any[] = [];

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

      if (!response.ok) throw new Error("Error saving plan");

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
    <div className="h-[calc(100dvh-3.5rem)] md:h-[calc(100vh-4rem)] flex flex-col">
      <Card className="flex-1 flex flex-col md:flex-row overflow-hidden p-0 gap-0 border-zinc-200/50 dark:border-zinc-800/50 bg-background shadow-none">
        {/* Chat List - Sidebar */}
        <div
          className={cn(
            "w-full md:w-[280px] border-r border-zinc-200/50 dark:border-zinc-800/50 flex flex-col bg-zinc-50/10 dark:bg-zinc-950/10",
            selectedChatId ? "hidden md:flex" : "flex",
          )}
        >
          <div className="h-14 border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center px-4">
            <h2 className="font-medium text-xl tracking-[-0.04em]">Chats</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              <button
                type="button"
                className={cn(
                  "w-full p-2.5 rounded-lg text-left flex items-center gap-3 transition-all",
                  selectedChatId === "rocco-ai"
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white"
                    : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
                )}
                onClick={() => setSelectedChatId("rocco-ai")}
              >
                <div className="h-8 w-8 rounded-full border border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                  <HugeiconsIcon
                    icon={Robot01Icon}
                    className="h-4 w-4 text-zinc-600 dark:text-zinc-400"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs">Rocco (AI)</p>
                  <p className="text-xs text-zinc-500 truncate">
                    Coach de GymRat+
                  </p>
                </div>
              </button>
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div
          className={cn(
            "flex-1 flex flex-col overflow-hidden bg-background",
            !selectedChatId ? "hidden md:flex" : "flex",
          )}
        >
          {selectedChatId === "rocco-ai" ? (
            <div className="flex-1 flex flex-col h-full relative">
              {/* Header aligned with Sidebar */}
              <div className="h-14 border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center px-4 gap-3 bg-background/80 backdrop-blur-sm z-10 sticky top-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-8 w-8"
                  onClick={() => setSelectedChatId(null)}
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold">Rocco</p>
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                </div>
              </div>

              {/* Minimal Message List */}
              <ScrollArea className="flex-1">
                <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
                  {messages.length === 0 && (
                    <div className="h-[40vh] flex flex-col items-center justify-center text-center text-zinc-400">
                      <HugeiconsIcon icon={Robot01Icon} className="h-8 w-8 mb-4" />
                      <p className="text-3xl tracking-[-0.04em] font-medium">Inicia una charla con Rocco</p>
                    </div>
                  )}

                  {messages.map((message) => {
                    const isOwn = message.role === "user";
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex w-full",
                          isOwn ? "justify-end" : "justify-start",
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-xs leading-relaxed",
                            isOwn
                              ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                              : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200",
                          )}
                        >
                          <div className="space-y-4">
                            {message.parts.map((part, i) => {
                              if (part.type === "text") {
                                return (
                                  <p key={i} className="whitespace-pre-wrap">
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
                                  (toolName === "generateTrainingPlan" || toolName === "generateNutritionPlan") &&
                                  (state === "result" || state === "output-available")
                                ) {
                                  return (
                                    <div key={toolInvocation.toolCallId} className="mt-4 border rounded-lg bg-background overflow-hidden">
                                      {toolName === "generateTrainingPlan" ? (
                                        <WorkoutPlanCard
                                          plan={result}
                                          onSave={() => handleSavePlan("workout", result, toolInvocation.toolCallId)}
                                          isSaved={savedPlans[toolInvocation.toolCallId]}
                                        />
                                      ) : (
                                        <NutritionPlanCard
                                          plan={result}
                                          onSave={() => handleSavePlan("nutrition", result, toolInvocation.toolCallId)}
                                          isSaved={savedPlans[toolInvocation.toolCallId]}
                                        />
                                      )}
                                    </div>
                                  );
                                }
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {status === "streaming" && (
                    <div className="flex gap-4 animate-pulse">
                      <div className="h-8 w-8 rounded-sm bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" />
                      <div className="h-4 w-12 bg-zinc-100 dark:bg-zinc-900 rounded mt-2" />
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Pill-Shaped Minimalist Input */}
              <div className="p-4 md:p-6 bg-background sticky bottom-0 border-t md:border-t-0">
                <form
                  onSubmit={handleSubmit}
                  className="max-w-3xl mx-auto flex items-center gap-2"
                >
                  <div className="flex-1 flex items-center gap-2 border rounded-full px-4 py-1.5 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 transition-colors focus-within:border-zinc-400 dark:focus-within:border-zinc-600">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      <HugeiconsIcon icon={Add01Icon} className="h-5 w-5" />
                    </Button>

                    <Input
                      placeholder="Escribe un mensaje..."
                      value={input}
                      onChange={handleInputChange}
                      className="flex-1 border-0 focus-visible:ring-0 bg-zinc-50 dark:bg-zinc-900 h-10 text-xs placeholder:text-zinc-400 px-0"
                      disabled={status === "streaming"}
                      autoComplete="off"
                    />

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        type="submit"
                        disabled={!input.trim() || status === "streaming"}
                        className="h-8 w-8 rounded-full bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 shrink-0 transition-transform active:scale-95 shadow-sm"
                      >
                        <HugeiconsIcon icon={ArrowUp01Icon} className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </form>

              </div>
            </div>
          ) : selectedChat ? (
            <ChatWindow
              chatId={selectedChatId!}
              chat={selectedChat as any}
              onBack={() => setSelectedChatId(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 space-y-4">
              <HugeiconsIcon icon={Robot01Icon} className="h-10 w-10" />
              <p className="text-3xl tracking-[-0.04em] font-medium">Selecciona un chat</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
