"use client";

import { useChat } from "@ai-sdk/react";

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
import {
  CheckmarkCircle01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

export default function ChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [savedPlans, setSavedPlans] = useState<Record<string, boolean>>({});

  // AI Chat configuration
  const { messages, sendMessage, status, addToolApprovalResponse, error } =
    useChat({
      id: "rocco-chat",
      onError: (error) => {
        console.error("❌ [Chat Error]", error);
        toast.error("Error al comunicarse con Rocco", {
          description: error.message || "Intenta de nuevo",
        });
      },
      onFinish: (message) => {
        console.log("✅ [Chat] Message finished:", message);
      },
    });

  // Debug logs
  console.log("🔍 [Chat Debug] Messages:", messages);
  console.log("🔍 [Chat Debug] Status:", status);
  console.log("🔍 [Chat Debug] Messages count:", messages.length);
  console.log("🔍 [Chat Debug] Error:", error);

  // Mobile detection
  const isMobile =
    typeof window !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  console.log("📱 [Mobile Debug] Is Mobile:", isMobile);

  const [input, setInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || status === "streaming") return;

    console.log("📤 [Chat] Sending message:", input);
    console.log("📤 [Chat] Current status:", status);

    try {
      sendMessage({ text: input });
      setInput("");
    } catch (error) {
      console.error("❌ [Chat] Error sending message:", error);
      toast.error("Error al enviar mensaje");
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
    <div className="h-[calc(100dvh-3.5rem)] md:h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* Chat List - Sidebar */}
      <div
        className={cn(
          "w-full md:w-[320px] flex flex-col transition-all duration-300",
          selectedChatId ? "hidden md:flex" : "flex",
          "md:bg-white/5 md:backdrop-blur-xl md:border-r md:border-white/10"
        )}
      >
        <div className="h-16 flex items-center px-6">
          <h2 className="font-semibold text-2xl tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
            Chats
          </h2>
        </div>
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2 pb-4">
            <button
              type="button"
              className={cn(
                "p-4 rounded-2xl text-left flex items-center gap-4 transition-all w-full group",
                selectedChatId === "rocco-ai"
                  ? "bg-white/10 dark:bg-white/5 backdrop-blur-md shadow-sm border border-black/5 dark:border-white/5"
                  : "hover:bg-black/5 dark:hover:bg-white/5 border border-transparent"
              )}
              onClick={() => setSelectedChatId("rocco-ai")}
            >
              <div className="relative">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                  <HugeiconsIcon
                    icon={Robot01Icon}
                    className="h-6 w-6"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-[3px] border-white dark:border-zinc-950" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-semibold text-sm text-zinc-900 dark:text-white">Rocco AI</p>
                  <span className="text-[10px] text-zinc-400 font-medium">Ahora</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate font-medium">
                  Tu coach personal de GymRat+
                </p>
              </div>
            </button>
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div
        className={cn(
          "flex-1 flex flex-col overflow-hidden relative",
          !selectedChatId ? "hidden md:flex" : "flex"
        )}
      >
        {selectedChatId === "rocco-ai" ? (
          <div className="flex-1 flex flex-col h-full relative">
            {/* Background Gradients */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <div className="h-16 flex items-center px-6 gap-4 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md border-b border-black/5 dark:border-white/5 z-10 sticky top-0">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-10 w-10 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                onClick={() => setSelectedChatId(null)}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                  <HugeiconsIcon icon={Robot01Icon} className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white leading-none mb-1">Rocco AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">En línea</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1">
              <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
                {messages.length === 0 && (
                  <div className="h-[50vh] flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-500">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
                        <HugeiconsIcon icon={Robot01Icon} className="h-12 w-12" />
                      </div>
                      <div className="absolute -inset-4 bg-indigo-500/20 blur-xl rounded-full -z-10" />
                    </div>
                    <div className="max-w-xs space-y-2">
                      <h3 className="text-2xl font-bold bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                        Hola, soy Rocco
                      </h3>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        Tu entrenador personal con IA. ¿En qué puedo ayudarte hoy?
                      </p>
                    </div>
                  </div>
                )}

                {messages.map((message, index) => {
                  const isOwn = message.role === "user";
                  const isLast = index === messages.length - 1;
                  const isAssistant = message.role === "assistant";

                  // Content visibility logic...
                  const hasContent =
                    message.parts &&
                    message.parts.length > 0 &&
                    message.parts.some((part: any) => {
                      if (part.type === "text")
                        return part.text && part.text.trim() !== "";
                      if (part.type === "reasoning") return true;
                      if (part.type.startsWith("tool-")) {
                        const toolName = part.type.replace("tool-", "");
                        const state = (part as any).state;
                        if (
                          [
                            "generateTrainingPlan",
                            "generateNutritionPlan",
                            "getTodayCalories",
                          ].includes(toolName)
                        ) {
                          return (
                            state === "result" || state === "output-available"
                          );
                        }
                        if (toolName === "saveMealEntry") {
                          return [
                            "approval-requested",
                            "output-available",
                            "result",
                            "output-denied",
                          ].includes(state);
                        }
                        return false;
                      }
                      return true;
                    });

                  if (isLast && isAssistant && !hasContent) return null;

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex w-full animate-in slide-in-from-bottom-2 duration-300",
                        isOwn ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm",
                          isOwn
                            ? "bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-white dark:to-zinc-200 text-white dark:text-zinc-900 rounded-tr-none"
                            : "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-black/5 dark:border-white/5 text-zinc-800 dark:text-zinc-200 rounded-tl-none"
                        )}
                      >
                        <div className="space-y-4">
                          {message.parts.map((part, i) => {
                            // Existing rendering logic for text, reasoning, tools
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
                            if (part.type.startsWith("tool-")) {
                              const toolInvocation = part as any;
                              const state = toolInvocation.state;
                              const toolName = part.type.replace("tool-", "");
                              const result = toolInvocation.result ?? toolInvocation.output;

                              if (
                                (toolName === "generateTrainingPlan" ||
                                  toolName === "generateNutritionPlan") &&
                                (state === "result" ||
                                  state === "output-available")
                              ) {
                                return (
                                  <div
                                    key={toolInvocation.toolCallId}
                                    className="mt-4 overflow-hidden -mx-2 md:-mx-4"
                                  >
                                    <div className="scale-[0.98]">
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
                                    className="mt-4 -mx-2 md:-mx-4"
                                  >
                                    <div className="scale-[0.98]">
                                      <CaloriesSummaryCard data={result} />
                                    </div>
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
                                            <span className="text-sm text-muted-foreground">
                                              P: {input.estimatedProtein}g |
                                              C: {input.estimatedCarbs}g
                                              | G: {input.estimatedFat}g
                                            </span>
                                          </ConfirmationRequest>
                                          <ConfirmationAccepted>
                                            <HugeiconsIcon
                                              icon={CheckmarkCircle01Icon}
                                              className="size-4 text-green-600 dark:text-green-400"
                                            />
                                            <span>Comida guardada</span>
                                          </ConfirmationAccepted>
                                          <ConfirmationRejected>
                                            <HugeiconsIcon
                                              icon={Cancel01Icon}
                                              className="size-4 text-destructive"
                                            />
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
                                      ? `${toolInvocation.input.foodName} guardado`
                                      : "Comida guardada";

                                  return (
                                    <div
                                      key={toolInvocation.toolCallId}
                                      className="mt-4"
                                    >
                                      <div className="rounded-xl border border-green-200/50 dark:border-green-800/50 bg-green-50/50 dark:bg-green-900/20 backdrop-blur-sm p-4">
                                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                          <HugeiconsIcon
                                            icon={CheckmarkCircle01Icon}
                                            className="size-5"
                                          />
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
                                      <div className="rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/20 backdrop-blur-sm p-4">
                                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                          <HugeiconsIcon
                                            icon={Cancel01Icon}
                                            className="size-5"
                                          />
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

                  const hasContent = lastMessage?.parts?.some((part: any) => {
                    if (part.type === "text")
                      return part.text && part.text.trim() !== "";
                    if (part.type === "reasoning") return true;
                    if (part.type.startsWith("tool-")) {
                      const toolName = part.type.replace("tool-", "");
                      const state = (part as any).state;
                      // For tools, only consider having content if we are actually rendering the result
                      if (
                        [
                          "generateTrainingPlan",
                          "generateNutritionPlan",
                          "getTodayCalories",
                        ].includes(toolName)
                      ) {
                        return (
                          state === "result" || state === "output-available"
                        );
                      }
                      if (toolName === "saveMealEntry") {
                        return [
                          "approval-requested",
                          "output-available",
                          "result",
                          "output-denied",
                        ].includes(state);
                      }
                      return false;
                    }
                    return true;
                  });


                  // Advanced thinking detection
                  const isWaitingForFirstToken = status === "submitted" && messages.length > 0 && lastMessage?.role === "user";
                  const isStreamingAssistant = status === "streaming" && lastMessage?.role === "assistant" && !hasContent;

                  // Identify specific tool being called
                  const pendingToolCall = lastMessage?.parts?.find((part: any) =>
                    part.type.startsWith("tool-") && (part.state === "call" || part.state === "uploading")
                  ) as any;

                  const toolName = pendingToolCall?.type?.replace("tool-", "");

                  let thinkingText = "Rocco está pensando...";
                  if (toolName === "generateTrainingPlan") thinkingText = "Generando tu plan de entrenamiento...";
                  if (toolName === "generateNutritionPlan") thinkingText = "Generando tu plan de nutrición...";
                  if (toolName === "getTodayCalories") thinkingText = "Consultando tus calorías...";
                  if (isWaitingForFirstToken) thinkingText = "Rocco está procesando tu solicitud...";

                  const isThinking = isWaitingForFirstToken || isStreamingAssistant || !!pendingToolCall;

                  return (
                    <>
                      {isThinking && (
                        <div className="flex justify-start w-full max-w-[85%] md:max-w-[70%] mb-4 animate-in fade-in slide-in-from-bottom-2">
                          <div className="p-1">
                            <Reasoning isStreaming={true}>
                              <ReasoningTrigger />
                              <ReasoningContent>
                                {thinkingText}
                              </ReasoningContent>
                            </Reasoning>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </ScrollArea>

            {/* Floating Input Area */}
            <div className="p-4 md:p-6 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80 sticky bottom-0 z-20">
              <div className="max-w-3xl mx-auto flex flex-col items-center gap-3">
                <Suggestions className="w-full pb-2">
                  <Suggestion
                    className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-black/5 dark:border-white/5 shadow-sm hover:scale-105 transition-transform"
                    onClick={() => sendMessage({ text: "Crear plan de entrenamiento" })}
                    suggestion="Crear plan de entrenamiento"
                  />
                  <Suggestion
                    className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-black/5 dark:border-white/5 shadow-sm hover:scale-105 transition-transform"
                    onClick={() => sendMessage({ text: "Crear plan de nutrición" })}
                    suggestion="Crear plan de nutrición"
                  />
                  <Suggestion
                    className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-black/5 dark:border-white/5 shadow-sm hover:scale-105 transition-transform"
                    onClick={() => sendMessage({ text: "¿Cuántas calorías tengo hoy?" })}
                    suggestion="Calorías hoy"
                  />
                </Suggestions>

                <form
                  onSubmit={handleSubmit}
                  className="w-full relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative flex items-center p-2 bg-white dark:bg-zinc-900/90 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.02)] transition-shadow duration-300 focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                    <Input
                      placeholder="Escribe un mensaje a Rocco..."
                      value={input}
                      onChange={handleInputChange}
                      className="flex-1 border-0 focus-visible:ring-0 bg-transparent h-12 px-4 shadow-none text-base"
                      disabled={status === "streaming"}
                      autoComplete="off"
                    />

                    <Button
                      size="icon"
                      type="submit"
                      disabled={!input.trim() || status === "streaming"}
                      className="h-10 w-10 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-105 active:scale-95 transition-all duration-300 shadow-md disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <HugeiconsIcon icon={ArrowUp01Icon} className="h-5 w-5" />
                    </Button>
                  </div>
                </form>
              </div>
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
                <HugeiconsIcon icon={Robot01Icon} className="h-10 w-10 text-zinc-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">Selecciona un chat</h3>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                  Elige a Rocco para empezar tu entrenamiento personalizado o revisa tu historial de conversaciones.
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
    </div>
  );
}
