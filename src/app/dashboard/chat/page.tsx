"use client";

import { useChat } from "@ai-sdk/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/utils";

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState("");
  const isLoading = status === "submitted" || status === "streaming";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ role: "user", parts: [{ type: "text", text: input }] });
    setInput("");
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="container mx-auto p-4 md:p-8 h-[calc(100vh-4rem)] flex flex-col gap-4 animate-in fade-in duration-500">
      <div className="flex-none">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent w-fit">
          GymRat AI
        </h1>
        <p className="text-muted-foreground mt-1">
          Tu asistente personal 24/7 para dudas de entrenamiento y nutrición.
        </p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-2 border-indigo-50 dark:border-indigo-900/20">
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground opacity-50 space-y-4">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 p-6 rounded-full">
                <Bot className="h-12 w-12 text-indigo-500" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  ¡Hola! Soy tu entrenador IA.
                </p>
                <p className="text-sm">
                  Pregúntame sobre rutinas, ejercicios o nutrición.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex w-full items-start gap-3",
                  m.role === "user" ? "flex-row-reverse" : "flex-row",
                )}
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                    m.role === "user"
                      ? "bg-zinc-200 dark:bg-zinc-800"
                      : "bg-indigo-600 text-white",
                  )}
                >
                  {m.role === "user" ? (
                    <User className="h-5 w-5" />
                  ) : (
                    <Bot className="h-5 w-5" />
                  )}
                </div>

                <div
                  className={cn(
                    "rounded-2xl px-4 py-2 max-w-[85%] text-sm shadow-sm",
                    m.role === "user"
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tr-sm"
                      : "bg-indigo-600 text-white rounded-tl-sm",
                  )}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {m.parts.map((part, index) =>
                      part.type === "text" ? (
                        <span key={index}>{part.text}</span>
                      ) : null,
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex w-full items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-4 py-3 rounded-tl-sm">
                  <div className="flex gap-1.5">
                    <span className="animate-bounce delay-0 w-1.5 h-1.5 bg-zinc-400 rounded-full" />
                    <span className="animate-bounce delay-150 w-1.5 h-1.5 bg-zinc-400 rounded-full" />
                    <span className="animate-bounce delay-300 w-1.5 h-1.5 bg-zinc-400 rounded-full" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Escribe tu pregunta sobre fitness..."
              className="flex-1 bg-white dark:bg-zinc-950"
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
