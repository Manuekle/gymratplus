"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Robot01Icon,
  ArrowUp01Icon,
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
import { CaloriesSummaryCard } from "@/components/chats/calories-summary-card";
import { Card } from "@/components/ui/card";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationTitle,
} from "@/components/ai-elements/confirmation";
import { CheckIcon, XIcon } from "lucide-react";
import { sendErrorEmail } from "@/app/actions/email";

export default function ChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [savedPlans, setSavedPlans] = useState<Record<string, boolean>>({});

  // Ensure we have a persistent ID for the current session if not selecting a history chat
  const [currentSessionId] = useState(() =>
    Math.random().toString(36).substring(7),
  );
  const activeChatId =
    selectedChatId === "rocco-ai" || !selectedChatId
      ? currentSessionId
      : selectedChatId;

  // AI Chat configuration
  const { messages, sendMessage, status, addToolApprovalResponse, error } =
    useChat({
      id: activeChatId,
      transport: new DefaultChatTransport({
        api: `/api/chat?id=${activeChatId}`,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || status === "streaming") return;

    try {
      sendMessage({ text: input });
      setInput("");
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
        {/* Chat List - Sidebar */}
        <div
          className={cn(
            "w-full md:w-[280px] border-r border-zinc-200/50 dark:border-zinc-800/50 flex flex-col bg-zinc-50/10 dark:bg-zinc-950/10",
            "hidden md:flex",
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
            "flex",
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
                <div className="flex items-center gap-2 h-14">
                  <p className="text-xs font-semibold">Rocco</p>
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                </div>
              </div>

              {/* Minimal Message List */}
              <ScrollArea className="flex-1 h-[calc(100vh-16rem)]">
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
                                return (
                                  <p key={i} className="whitespace-pre-wrap">
                                    {part.text}
                                  </p>
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
                                        className="mt-4"
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
                                              <CheckIcon className="size-4 text-green-600 dark:text-green-400" />
                                              <span>Comida guardada</span>
                                            </ConfirmationAccepted>
                                            <ConfirmationRejected>
                                              <XIcon className="size-4 text-destructive" />
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
                                    const successMessage =
                                      result?.message || result?.success
                                        ? `${toolInvocation.input.foodName} guardado correctamente`
                                        : "Comida guardada correctamente";

                                    return (
                                      <div
                                        key={toolInvocation.toolCallId}
                                        className="mt-4"
                                      >
                                        <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-4">
                                          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                            <CheckIcon className="size-5" />
                                            <p className="font-medium">
                                              {successMessage}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }

                                  if (state === "output-denied") {
                                    return (
                                      <div
                                        key={toolInvocation.toolCallId}
                                        className="mt-4"
                                      >
                                        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/20 p-4">
                                          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                            <XIcon className="size-5" />
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

                  {(() => {
                    const lastMessage = messages[messages.length - 1];
                    return (
                      status === "streaming" &&
                      messages.length > 0 &&
                      lastMessage?.role === "user" && (
                        <div className="flex justify-start">
                          <div className="max-w-[85%] md:max-w-[70%]">
                            <Reasoning isStreaming={true}>
                              <ReasoningTrigger />
                              <ReasoningContent>
                                Rocco está pensando en tu pregunta...
                              </ReasoningContent>
                            </Reasoning>
                          </div>
                        </div>
                      )
                    );
                  })()}
                </div>
              </ScrollArea>

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
                    icon={Robot01Icon}
                    className="h-10 w-10 text-zinc-400"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                    Selecciona un chat
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                    Elige a Rocco para empezar tu entrenamiento personalizado o
                    revisa tu historial de conversaciones.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="mt-4 rounded-full"
                  onClick={() => setSelectedChatId("rocco-ai")}
                >
                  Iniciar chat con Rocco
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
