"use client";

import { useState, useEffect, useCallback } from "react";
import type { Notification } from "@prisma/client";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/notifications");

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data);
      setUnreadCount(
        data.filter((notification: Notification) => !notification.read).length
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Alias for fetchNotifications to match the expected interface
  const refetch = fetchNotifications;

  const markAsRead = useCallback(async (id: string | "all") => {
    try {
      if (id === "all") {
        const response = await fetch("/api/notifications", {
          method: "PATCH",
        });

        if (!response.ok) {
          throw new Error("Failed to mark all notifications as read");
        }

        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      } else {
        const response = await fetch(`/api/notifications/${id}`, {
          method: "PATCH",
        });

        if (!response.ok) {
          throw new Error("Failed to mark notification as read");
        }

        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return false;
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      const deletedNotification = await response.json();
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );

      if (!deletedNotification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return false;
    }
  }, []);

  const deleteAllNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete all notifications");
      }

      setNotifications([]);
      setUnreadCount(0);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return false;
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    markAsRead,
    deleteNotification,
    deleteAllNotifications,
    refetch,
  };
}
