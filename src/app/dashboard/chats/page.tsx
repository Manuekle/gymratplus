"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Robot01Icon,
  ArrowUp01Icon,
  ArrowLeft01Icon,
  ArrowDown01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatWindow } from "@/components/chats/chat-window";
import { cn } from "@/lib/utils/utils";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { WorkoutPlanCard } from "@/components/chats/workout-plan-card";
import { NutritionPlanCard } from "@/components/chats/nutrition-plan-card";
import { CaloriesSummaryCard } from "@/components/chats/calories-summary-card";
import { Card } from "@/components/ui/card";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Icons } from "@/components/icons";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Streamdown } from "streamdown";
import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationTitle,
} from "@/components/ai-elements/confirmation";
import { CheckmarkCircle02Icon, Cancel01Icon, UserSearchIcon } from "@hugeicons/core-free-icons";
import { sendErrorEmail } from "@/app/actions/email";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [savedPlans, setSavedPlans] = useState<Record<string, boolean>>({});

  // Check if user is FREE tier
  const user = session?.user as any;
  const isFreeUser = !user?.subscriptionTier || user.subscriptionTier === "FREE";

  // Auto-scroll functionality
  const { containerRef, endRef, isAtBottom, scrollToBottom } = useScrollToBottom<HTMLDivElement>();

  // Ensure we have a persistent ID for the current session if not selecting a history chat
  const [currentSessionId] = useState(() =>
    Math.random().toString(36).substring(7),
  );
  const activeChatId =
    selectedChatId === "rocco-ai" || !selectedChatId
      ? currentSessionId
      : selectedChatId;

  // AI Chat configuration
  const { messages, sendMessage, status, addToolApprovalResponse } =
    useChat({
      id: activeChatId,
      transport: new DefaultChatTransport({
        api: "/api/chat",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          id: activeChatId,
        },
      }),
      onError: async (error) => {
        console.error("❌ [Chat Error]", error);
        toast.error("Error al comunicarse con Rocco", {
          description: error.message || "Intenta de nuevo",
        });
        await sendErrorEmail(error instanceof Error ? error.message : "Unknown error");
      },
    });

  const [input, setInput] = useState("");

  // Auto-scroll when messages change or status changes
  useEffect(() => {
    if (status === "streaming" || status === "submitted") {
      scrollToBottom("smooth");
    }
  }, [messages, status, scrollToBottom]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || status === "streaming") return;

    try {
      sendMessage({ text: input });
      setInput("");
      // Scroll to bottom when user sends message
      setTimeout(() => scrollToBottom("smooth"), 100);
    } catch (error) {
      console.error("❌ [Chat] Error sending message:", error);
      toast.error("Error al enviar mensaje");
      await sendErrorEmail(error instanceof Error ? error.message : "Unknown error");
    }
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
        {/* Chat Listedge - Sidebar */}
        <div
          className={cn(
            "w-full md:w-[280px] border-r border-zinc-200/50 dark:border-zinc-800/50 flex flex-col bg-zinc-50/10 dark:bg-zinc-950/10",
            "hidden md:flex",
          )}
        >
          <div className="h-14 border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center px-4">
            <h2 className="font-medium text-xl tracking-[-0.04em]">Chats</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 space-y-1">
              {!isFreeUser && (
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
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={cn(
            "flex-1 flex flex-col overflow-hidden bg-background",
            "flex",
          )}
        >
          {!isFreeUser && selectedChatId === "rocco-ai" ? (
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
                <div className="flex items-center gap-2 h-14">
                  <p className="text-xs font-semibold">Rocco</p>
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                </div>
              </div>

              {/* Minimal Message List */}
              <div className="relative flex-1 min-h-0">
                <div
                  ref={containerRef}
                  className="absolute inset-0 overflow-y-auto touch-pan-y"
                >
                  <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
                    {messages.length === 0 && (
                      <div className="h-[40vh] flex flex-col items-center justify-center text-center text-zinc-400 animate-in fade-in zoom-in duration-500">
                        <HugeiconsIcon
                          icon={Robot01Icon}
                          className="h-8 w-8 mb-4"
                        />
                        <p className="text-3xl tracking-[-0.04em] font-medium">
                          Hola, ¿en qué puedo ayudarte hoy?
                        </p>
                      </div>
                    )}

                    {messages.map((message) => {
                      const isOwn = message.role === "user";
                      const hasTextContent = message.parts.some(
                        (p) => p.type === "text" && p.text && p.text.length > 0,
                      );
                      // Hide empty assistant messages during streaming
                      if (
                        !isOwn &&
                        status === "streaming" &&
                        !hasTextContent &&
                        !message.parts.some((p) => p.type.startsWith("tool"))
                      ) {
                        return null;
                      }

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
                              "rounded-2xl px-4 py-3 text-xs leading-relaxed w-full",
                              isOwn
                                ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                                : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200",
                            )}
                          >
                            <div className="space-y-4">
                              {message.parts.map((part, i) => {
                                if (part.type === "text") {
                                  if (!part.text || part.text.trim() === "") return null;
                                  return (
                                    <Streamdown
                                      key={i}
                                      className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                                    >
                                      {part.text}
                                    </Streamdown>
                                  );
                                }
                                if (part.type === "reasoning") {
                                  const reasoningPart = part as any;
                                  return (
                                    <Reasoning
                                      key={i}
                                      className="mb-4"
                                      isStreaming={status === "streaming"}
                                    >
                                      <ReasoningTrigger />
                                      <ReasoningContent>
                                        {reasoningPart.text || "Pensando..."}
                                      </ReasoningContent>
                                    </Reasoning>
                                  );
                                }

                                // Handle tool invocations
                                if (part.type.startsWith("tool-")) {
                                  const toolInvocation = part as any;
                                  const state = toolInvocation.state;
                                  const toolName = part.type.replace("tool-", "");
                                  const result =
                                    toolInvocation.result ??
                                    toolInvocation.output;

                                  if (
                                    (toolName === "generateTrainingPlan" ||
                                      toolName === "generateNutritionPlan") &&
                                    (state === "result" ||
                                      state === "output-available")
                                  ) {
                                    return (
                                      <div
                                        key={toolInvocation.toolCallId}
                                        className="mt-4 overflow-hidden mb-1"
                                      >
                                        {toolName === "generateTrainingPlan" ? (
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
                                              savedPlans[
                                              toolInvocation.toolCallId
                                              ]
                                            }
                                          />
                                        ) : (
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
                                              savedPlans[
                                              toolInvocation.toolCallId
                                              ]
                                            }
                                          />
                                        )}
                                      </div>
                                    );
                                  }

                                  if (
                                    toolName === "getTodayCalories" &&
                                    (state === "result" ||
                                      state === "output-available")
                                  ) {
                                    return (
                                      <div
                                        key={toolInvocation.toolCallId}
                                        className="mt-4"
                                      >
                                        <CaloriesSummaryCard data={result} />
                                      </div>
                                    );
                                  }

                                  if (toolName === "saveMealEntry") {
                                    if (state === "approval-requested") {
                                      const input = toolInvocation.input;
                                      return (
                                        <div
                                          key={toolInvocation.toolCallId}
                                          className="mt-2"
                                        >
                                          <Confirmation
                                            approval={toolInvocation.approval}
                                            state={state}
                                          >
                                            <ConfirmationTitle>
                                              <ConfirmationRequest>
                                                ¿Quieres guardar esta comida?
                                                <br />
                                                <strong>
                                                  {input.foodName}
                                                </strong>{" "}
                                                - {input.estimatedCalories} kcal
                                                <br />
                                                <span className="text-xs text-muted-foreground">
                                                  Proteínas:{" "}
                                                  {input.estimatedProtein}g |
                                                  Carbos: {input.estimatedCarbs}g
                                                  | Grasas: {input.estimatedFat}g
                                                </span>
                                              </ConfirmationRequest>
                                              <ConfirmationAccepted>
                                                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-green-600 dark:text-green-400" />
                                                <span>Comida guardada</span>
                                              </ConfirmationAccepted>
                                              <ConfirmationRejected>
                                                <HugeiconsIcon icon={Cancel01Icon} className="size-4 text-red-600 dark:text-red-400" />
                                                <span>Guardado cancelado</span>
                                              </ConfirmationRejected>
                                            </ConfirmationTitle>
                                            <ConfirmationActions>
                                              <ConfirmationAction
                                                onClick={() =>
                                                  addToolApprovalResponse({
                                                    id: toolInvocation.approval
                                                      .id,
                                                    approved: false,
                                                  })
                                                }
                                                variant="outline"
                                              >
                                                Rechazar
                                              </ConfirmationAction>
                                              <ConfirmationAction
                                                onClick={() =>
                                                  addToolApprovalResponse({
                                                    id: toolInvocation.approval
                                                      .id,
                                                    approved: true,
                                                  })
                                                }
                                                variant="default"
                                              >
                                                Guardar
                                              </ConfirmationAction>
                                            </ConfirmationActions>
                                          </Confirmation>
                                        </div>
                                      );
                                    }

                                    if (
                                      state === "output-available" ||
                                      state === "result"
                                    ) {
                                      const mealLog = result?.mealLog;

                                      if (!mealLog) return null;

                                      return (
                                        <div
                                          key={toolInvocation.toolCallId}
                                          className="mt-2"
                                        >
                                          <div className="space-y-3 pl-1">
                                            {/* Title & Header Combined */}
                                            <div className="flex items-start justify-between gap-4">
                                              <div>
                                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 leading-tight tracking-[-0.04em]">
                                                  {mealLog.customName || "Comida"}
                                                </h3>
                                                <p className="text-xs text-zinc-500 uppercase tracking-[-0.04em] font-medium mt-1.5 flex items-center gap-2">
                                                  <span>{mealLog.quantity} {mealLog.foodId ? "g" : "porción"}</span>
                                                  <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                                  <span>{mealLog.mealType}</span>
                                                </p>
                                              </div>
                                              <div className="flex items-center gap-1.5 text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-500/10 px-2.5 py-1 rounded-full border border-green-100 dark:border-green-500/20">
                                                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5" />
                                                <span className="text-xs font-semibold uppercase tracking-[-0.04em]">Guardado</span>
                                              </div>
                                            </div>

                                            {/* Macros Grid - Responsive */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                                              <div className="space-y-0.5 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                                <span className="block text-xs uppercase text-zinc-500 font-semibold tracking-[-0.04em]">Calorías</span>
                                                <span className="block text-xs font-semibold text-zinc-900 dark:text-white tabular-nums tracking-[-0.04em]">{mealLog.calories}</span>
                                              </div>
                                              <div className="space-y-0.5 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                                <span className="block text-xs uppercase text-zinc-500 font-semibold tracking-[-0.04em]">Proteína</span>
                                                <span className="block text-xs font-semibold text-zinc-900 dark:text-white tabular-nums tracking-[-0.04em]">{mealLog.protein}g</span>
                                              </div>
                                              <div className="space-y-0.5 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                                <span className="block text-xs uppercase text-zinc-500 font-semibold tracking-[-0.04em]">Carbos</span>
                                                <span className="block text-xs font-semibold text-zinc-900 dark:text-white tabular-nums tracking-[-0.04em]">{mealLog.carbs}g</span>
                                              </div>
                                              <div className="space-y-0.5 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                                <span className="block text-xs uppercase text-zinc-500 font-semibold tracking-[-0.04em]">Grasas</span>
                                                <span className="block text-xs font-semibold text-zinc-900 dark:text-white tabular-nums tracking-[-0.04em]">{mealLog.fat}g</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }

                                    if (state === "output-denied") {
                                      return (
                                        <div
                                          key={toolInvocation.toolCallId}
                                          className="mt-2"
                                        >
                                          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/20 p-4">
                                            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                              <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
                                              <p className="font-medium">
                                                Guardado cancelado
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                  }
                                }
                                return null;
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Context-Aware Thinking State */}
                    {(status === "streaming" || status === "submitted") && (
                      <div className="flex justify-start animate-in fade-in duration-300 w-full">
                        <div className="flex items-start gap-3 w-full">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border border-zinc-200 dark:border-zinc-800">
                            <HugeiconsIcon icon={SparklesIcon} className="h-4 w-4 animate-pulse text-zinc-500 dark:text-zinc-400" />
                          </div>
                          <div className="flex flex-col gap-1 py-1.5">
                            <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                              <span className="font-medium animate-pulse">
                                {(() => {
                                  // Determine thinking text based on active tool
                                  const lastMessage = messages[messages.length - 1];
                                  if (lastMessage?.role === "assistant") {
                                    const toolPart = lastMessage.parts.find(
                                      (p: any) =>
                                        p.type.startsWith("tool-") &&
                                        (p.state === "call" || p.state === "partial-call"),
                                    ) as any;

                                    if (toolPart) {
                                      const toolName = toolPart.toolName || toolPart.type.replace("tool-", "");
                                      switch (toolName) {
                                        case "generateTrainingPlan":
                                          return "Diseñando tu plan de entrenamiento...";
                                        case "generateNutritionPlan":
                                          return "Creando tu plan nutricional...";
                                        case "getTodayCalories":
                                          return "Consultando tus calorías...";
                                        case "saveMealEntry":
                                          return "Registrando comida...";
                                        case "requestSuggestions":
                                          return "Buscando sugerencias...";
                                      }
                                    }
                                  }
                                  return "Thinking";
                                })()}
                              </span>
                              <span className="flex">
                                <span className="animate-bounce [animation-delay:0ms]">.</span>
                                <span className="animate-bounce [animation-delay:150ms]">.</span>
                                <span className="animate-bounce [animation-delay:300ms]">.</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={endRef} className="min-h-[24px] min-w-[24px] shrink-0" />
                  </div>
                </div>

                {/* Scroll to bottom button */}
                <button
                  aria-label="Scroll to bottom"
                  className={cn(
                    "absolute bottom-24 left-1/2 -translate-x-1/2 z-10 rounded-full border bg-background p-2 shadow-lg transition-all hover:bg-muted",
                    isAtBottom
                      ? "pointer-events-none scale-0 opacity-0"
                      : "pointer-events-auto scale-100 opacity-100"
                  )}
                  onClick={() => scrollToBottom("smooth")}
                  type="button"
                >
                  <HugeiconsIcon icon={ArrowDown01Icon} className="h-4 w-4" />
                </button>
              </div>

              {/* Pill-Shaped Minimalist Input */}
              <div className="p-2 bg-background/80 backdrop-blur-sm sticky bottom-0 border-t md:border-t-0">
                <form
                  onSubmit={handleSubmit}
                  className="max-w-3xl mx-auto flex flex-col items-center gap-2"
                >
                  <Suggestions className="p-2 scroll-hidden y-scroll animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                    <Suggestion
                      onClick={() =>
                        sendMessage({ text: "Crear plan de entrenamiento" })
                      }
                      suggestion="Crear plan de entrenamiento"
                    />
                    <Suggestion
                      onClick={() =>
                        sendMessage({ text: "Crear plan de nutrición" })
                      }
                      suggestion="Crear plan de nutrición"
                    />
                    <Suggestion
                      onClick={() =>
                        sendMessage({ text: "¿Cuántas calorías tengo hoy?" })
                      }
                      suggestion="¿Cuántas calorías tengo hoy?"
                    />
                    <Suggestion
                      onClick={() =>
                        sendMessage({ text: "Me comí una hamburguesa" })
                      }
                      suggestion="Me comí una hamburguesa"
                    />
                  </Suggestions>
                  <div className="w-full flex-1 flex items-center gap-2 border rounded-full px-4 py-1.5 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 transition-colors focus-within:border-zinc-400 dark:focus-within:border-zinc-600">
                    <Input
                      placeholder="Escribe un mensaje..."
                      value={input}
                      onChange={handleInputChange}
                      className="flex-1 border-0 focus-visible:ring-0 bg-zinc-50 dark:bg-zinc-900 h-10 text-xs placeholder:text-zinc-400 px-0 shadow-none"
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
                        <HugeiconsIcon
                          icon={ArrowUp01Icon}
                          className="h-4 w-4"
                        />
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
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 p-8 relative overflow-hidden">
              {/* Background decorative elements */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.02] pointer-events-none">
                <HugeiconsIcon icon={Robot01Icon} className="h-96 w-96" />
              </div>

              <div className="relative z-10 flex flex-col items-center text-center space-y-4 max-w-md mx-auto">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 border border-black/5 dark:border-white/5 flex items-center justify-center transform rotate-3 shadow-xl">
                  <HugeiconsIcon
                    icon={isFreeUser ? UserSearchIcon : Robot01Icon}
                    className="h-10 w-10 text-zinc-400"
                  />
                </div>
                <div>
                  <h3 className="text-2xl tracking-[-0.04em] font-semibold text-zinc-900 dark:text-white">
                    {isFreeUser ? "Busca un instructor" : "Selecciona un chat"}
                  </h3>
                  <p className="text-zinc-500 text-xs tracking-[-0.02em] dark:text-zinc-400 mt-2">
                    {isFreeUser
                      ? "Conecta con instructores profesionales para recibir entrenamiento personalizado y alcanzar tus objetivos."
                      : "Elige a Rocco para empezar tu entrenamiento personalizado o revisa tu historial de conversaciones."}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="mt-4 rounded-full"
                  onClick={() =>
                    isFreeUser
                      ? router.push("/dashboard/instructors")
                      : setSelectedChatId("rocco-ai")
                  }
                >
                  {isFreeUser
                    ? "Buscar instructores"
                    : "Iniciar chat con Rocco"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
