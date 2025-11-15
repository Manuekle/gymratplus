"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface ChatUser {
  id: string;
  name: string | null;
  image: string | null;
  email: string | null;
}

export interface ChatMessage {
  id: string;
  content: string | null;
  senderId: string;
  sender: ChatUser;
  type?: string;
  read: boolean;
  createdAt: string;
}

export interface Chat {
  id: string;
  studentInstructorId: string;
  otherUser: ChatUser;
  lastMessage: ChatMessage | null;
  unreadCount: number;
  updatedAt: string;
}

export function useChats() {
  const { data: session } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = useCallback(async (isInitial = false) => {
    try {
      // Only show loading on initial load
      if (isInitial) {
        setIsLoading(true);
      }
      setError(null);
      const response = await fetch("/api/chats");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Error ${response.status}: Error al cargar los chats`,
        );
      }
      const data = await response.json();
      setChats(data || []);
    } catch (err) {
      console.error("Error fetching chats:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      if (isInitial) {
        setChats([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session) return;

    // Initial load
    fetchChats(true);

    // Only poll when tab is visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchChats(false);
      }
    };

    // Poll for new chats every 60 seconds (only when visible)
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchChats(false);
      }
    }, 60000);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [session, fetchChats]);

  return {
    chats,
    isLoading,
    error,
    refetch: fetchChats,
  };
}
