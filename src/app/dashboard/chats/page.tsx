"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useChats } from "@/hooks/use-chats";
import { ChatList } from "@/components/chats/chat-list";
import { ChatWindow } from "@/components/chats/chat-window";
import { Skeleton } from "@/components/ui/skeleton";

import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { BubbleChatIcon } from "@hugeicons/core-free-icons";

function ChatsContent() {
  const searchParams = useSearchParams();
  const { chats, isLoading, error } = useChats();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Check for chat ID in URL params
  useEffect(() => {
    const chatParam = searchParams.get("chat");
    if (chatParam) {
      setSelectedChatId(chatParam);
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="w-full">
        <div className="border rounded-xl bg-card p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-destructive/10 dark:bg-destructive/20 flex items-center justify-center">
              <HugeiconsIcon
                icon={BubbleChatIcon}
                className="h-6 w-6 text-destructive"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">
                No se pudieron cargar los chats
              </p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-12rem)] min-h-[600px]">
        {/* Chat List */}
        <div className="lg:col-span-1 border rounded-xl bg-card overflow-hidden flex flex-col shadow-sm min-h-0">
          {isLoading ? (
            <div className="flex flex-col h-full">
              <div className="p-3 border-b flex-shrink-0">
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
              <div className="p-4 space-y-3 flex-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            </div>
          ) : (
            <ChatList
              chats={chats}
              selectedChatId={selectedChatId}
              onSelectChat={setSelectedChatId}
              isTyping={isTyping}
            />
          )}
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 border rounded-xl bg-card overflow-hidden flex flex-col shadow-sm min-h-0">
          {selectedChatId ? (
            <ChatWindow
              chatId={selectedChatId}
              chat={chats.find((c) => c.id === selectedChatId) || null}
              onTypingChange={setIsTyping}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <HugeiconsIcon
                    icon={BubbleChatIcon}
                    className="h-8 w-8 text-muted-foreground"
                  />
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  Selecciona un chat para comenzar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-12rem)] min-h-[600px]">
            <div className="lg:col-span-1 border rounded-xl bg-card overflow-hidden flex flex-col shadow-sm min-h-0">
              <div className="flex flex-col h-full">
                <div className="p-3 border-b flex-shrink-0">
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
                <div className="p-4 space-y-3 flex-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 border rounded-xl bg-card overflow-hidden flex flex-col shadow-sm min-h-0">
              <div className="flex-1 flex items-center justify-center p-6">
                <Skeleton className="h-16 w-16 rounded-full mx-auto" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ChatsContent />
    </Suspense>
  );
}
