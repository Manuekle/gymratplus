"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

export interface ChatMessage {
  id: string;
  content?: string;
  type?: "text" | "image" | "audio" | "video" | "file";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  duration?: number;
  thumbnail?: string;
  senderId: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
  read: boolean;
  deleted?: boolean;
  deletedAt?: string;
  edited?: boolean;
  editedAt?: string;
  replyToId?: string;
  createdAt: string;
}

export function useChatMessages(chatId: string | null) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const isInitialLoadRef = useRef(true);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      // Find the ScrollArea viewport
      const scrollArea = messagesEndRef.current.closest(
        '[data-slot="scroll-area-viewport"]',
      );
      if (scrollArea) {
        scrollArea.scrollTo({
          top: scrollArea.scrollHeight,
          behavior: "smooth",
        });
      } else {
        // Fallback to scrollIntoView
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  const fetchMessages = useCallback(
    async (isInitial = false) => {
      if (!chatId) return;

      try {
        // Only show loading on initial load
        if (isInitial) {
          setIsLoading(true);
        }
        setError(null);

        const lastMessageTime =
          messagesRef.current.length > 0
            ? new Date(
                messagesRef.current[messagesRef.current.length - 1].createdAt,
              ).toISOString()
            : undefined;

        const url = new URL(`/api/chats/${chatId}`, window.location.origin);
        if (lastMessageTime && !isInitial) {
          url.searchParams.set("since", lastMessageTime);
        }

        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error("Error al cargar los mensajes");
        }
        const data = await response.json();

        if (isInitial || !lastMessageTime) {
          // Initial load - replace all messages
          const newMessages = data.messages || [];
          messagesRef.current = newMessages;
          setMessages(newMessages);
          setTimeout(scrollToBottom, 100);
        } else {
          // Incremental update - only add new messages
          const newMessages = data.messages || [];
          if (newMessages.length > 0) {
            setMessages((prev) => {
              const existingIds = new Set(prev.map((m) => m.id));
              const toAdd = newMessages.filter((m) => !existingIds.has(m.id));
              if (toAdd.length === 0) return prev;
              const updated = [...prev, ...toAdd];
              messagesRef.current = updated;
              return updated;
            });
            // Only scroll if user is near bottom
            const scrollArea = messagesEndRef.current?.closest(
              '[data-slot="scroll-area-viewport"]',
            );
            if (scrollArea) {
              const { scrollTop, scrollHeight, clientHeight } = scrollArea;
              const isNearBottom =
                scrollHeight - scrollTop - clientHeight < 100;
              if (isNearBottom) {
                setTimeout(scrollToBottom, 100);
              }
            }
          }
        }

        lastFetchTimeRef.current = Date.now();
        isInitialLoadRef.current = false;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setIsLoading(false);
      }
    },
    [chatId, scrollToBottom],
  );

  const sendMessage = useCallback(
    async (
      content?: string,
      messageData?: {
        type?: "text" | "image" | "audio" | "video" | "file";
        fileUrl?: string;
        fileName?: string;
        fileSize?: number;
        mimeType?: string;
        duration?: number;
        thumbnail?: string;
        replyToId?: string;
      },
    ) => {
      if (!chatId || isSending) return;
      // Allow sending if there's content OR fileUrl (for audio, images, etc.)
      if (!content?.trim() && !messageData?.fileUrl) return;

      const tempId = `temp-${Date.now()}`;
      // Determine type: use messageData.type if provided, otherwise infer from fileUrl
      let messageType: "text" | "image" | "audio" | "video" | "file" =
        messageData?.type || "text";
      if (!messageType && messageData?.fileUrl) {
        // Infer type from mimeType if type is not provided
        const mimeType = messageData.mimeType?.toLowerCase() || "";
        if (mimeType.startsWith("audio/")) messageType = "audio";
        else if (mimeType.startsWith("image/")) messageType = "image";
        else if (mimeType.startsWith("video/")) messageType = "video";
        else messageType = "file";
      }

      const tempMessage: ChatMessage = {
        id: tempId,
        content: content || undefined,
        type: messageType,
        fileUrl: messageData?.fileUrl,
        fileName: messageData?.fileName,
        fileSize: messageData?.fileSize,
        mimeType: messageData?.mimeType,
        duration: messageData?.duration,
        thumbnail: messageData?.thumbnail,
        senderId: session?.user?.id || "",
        sender: {
          id: session?.user?.id || "",
          name: session?.user?.name || null,
          image: session?.user?.image || null,
        },
        read: false,
        deleted: false,
        edited: false,
        createdAt: new Date().toISOString(),
      };

      // Optimistic update
      setMessages((prev) => {
        const updated = [...prev, tempMessage];
        messagesRef.current = updated;
        return updated;
      });
      setIsSending(true);
      // Wait for DOM update before scrolling
      setTimeout(() => {
        scrollToBottom();
      }, 50);

      try {
        const response = await fetch(`/api/chats/${chatId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: content || undefined,
            type: messageData?.type || "text",
            ...messageData,
          }),
        });

        if (!response.ok) {
          throw new Error("Error al enviar el mensaje");
        }

        const newMessage = await response.json();
        // Ensure createdAt is a string
        const formattedMessage = {
          ...newMessage,
          createdAt:
            typeof newMessage.createdAt === "string"
              ? newMessage.createdAt
              : new Date(newMessage.createdAt).toISOString(),
        };
        setMessages((prev) => {
          const updated = prev.map((msg) =>
            msg.id === tempId ? formattedMessage : msg,
          );
          messagesRef.current = updated;
          return updated;
        });
        // Wait for DOM update before scrolling
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } catch (err) {
        // Remove temp message on error
        setMessages((prev) => {
          const updated = prev.filter((msg) => msg.id !== tempId);
          messagesRef.current = updated;
          return updated;
        });
        setError(err instanceof Error ? err.message : "Error al enviar");
      } finally {
        setIsSending(false);
      }
    },
    [chatId, session, isSending, scrollToBottom],
  );

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      messagesRef.current = [];
      isInitialLoadRef.current = true;
      lastFetchTimeRef.current = 0;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Initial load
    fetchMessages(true);

    // Only poll when tab is visible and user is not typing
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isSending) {
        const timeSinceLastFetch = Date.now() - lastFetchTimeRef.current;
        // Only fetch if it's been at least 20 seconds
        if (timeSinceLastFetch > 20000) {
          fetchMessages(false);
        }
      }
    };

    // Poll for new messages every 30 seconds (only when visible)
    pollingIntervalRef.current = setInterval(() => {
      if (document.visibilityState === "visible" && !isSending) {
        fetchMessages(false);
      }
    }, 30000);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [chatId, fetchMessages, isSending]);

  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    });
  }, [messages.length, scrollToBottom]);

  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (!chatId) return;

      try {
        const response = await fetch(
          `/api/chats/${chatId}/messages/${messageId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: newContent }),
          },
        );

        if (!response.ok) {
          throw new Error("Error al editar el mensaje");
        }

        const updatedMessage = await response.json();
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? updatedMessage : msg)),
        );
        messagesRef.current = messagesRef.current.map((msg) =>
          msg.id === messageId ? updatedMessage : msg,
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al editar");
        throw err;
      }
    },
    [chatId],
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!chatId) return;

      try {
        const response = await fetch(
          `/api/chats/${chatId}/messages/${messageId}`,
          {
            method: "DELETE",
          },
        );

        if (!response.ok) {
          throw new Error("Error al borrar el mensaje");
        }

        const deletedMessage = await response.json();
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? deletedMessage : msg)),
        );
        messagesRef.current = messagesRef.current.map((msg) =>
          msg.id === messageId ? deletedMessage : msg,
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al borrar");
        throw err;
      }
    },
    [chatId],
  );

  const clearChat = useCallback(async () => {
    if (!chatId) return;

    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al vaciar el chat");
      }

      // Clear all messages from state
      setMessages([]);
      messagesRef.current = [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al vaciar el chat");
      throw err;
    }
  }, [chatId]);

  return {
    messages,
    isLoading,
    error,
    isSending,
    sendMessage,
    editMessage,
    deleteMessage,
    clearChat,
    refetch: fetchMessages,
    messagesEndRef,
  };
}
