import { redis } from "./redis";

// Redis keys for chat
export const CHAT_CHANNEL = "chat:messages";
export const CHAT_KEY = (chatId: string) => `chat:${chatId}`;
export const CHAT_MESSAGES_KEY = (chatId: string) => `chat:messages:${chatId}`;
export const CHAT_UNREAD_KEY = (userId: string) => `chat:unread:${userId}`;

// Store message in Redis for real-time delivery
export async function publishChatMessage(
  chatId: string,
  message: {
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
  },
): Promise<void> {
  // Add to chat messages list
  await redis.lpush(CHAT_MESSAGES_KEY(chatId), JSON.stringify(message));

  // Keep only last 100 messages in Redis cache
  await redis.ltrim(CHAT_MESSAGES_KEY(chatId), 0, 99);

  // Publish to channel for real-time updates
  await redis.lpush(
    CHAT_CHANNEL,
    JSON.stringify({
      chatId,
      message,
    }),
  );

  // Keep channel list manageable
  await redis.ltrim(CHAT_CHANNEL, 0, 49);
}

// Get cached messages from Redis
export async function getCachedMessages(
  chatId: string,
  limit: number = 50,
): Promise<
  Array<{
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
  }>
> {
  try {
    const messages = await redis.lrange(
      CHAT_MESSAGES_KEY(chatId),
      0,
      limit - 1,
    );
    return messages
      .map((msg) => {
        try {
          return typeof msg === "string" ? JSON.parse(msg) : msg;
        } catch {
          return null;
        }
      })
      .filter((msg) => msg !== null)
      .reverse(); // Reverse to get chronological order
  } catch (error) {
    console.error("Error getting cached messages:", error);
    return [];
  }
}

// Mark messages as read in Redis
export async function markChatAsRead(
  chatId: string,
  userId: string,
): Promise<void> {
  try {
    await redis.del(`${CHAT_UNREAD_KEY(userId)}:${chatId}`);
  } catch (error) {
    console.error("Error marking chat as read:", error);
  }
}

// Get unread count for a user
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const keys = await redis.keys(`${CHAT_UNREAD_KEY(userId)}:*`);
    return keys.length;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
}

// Redis keys for typing indicators
export const TYPING_CHANNEL = "chat:typing";
export const TYPING_KEY = (chatId: string) => `chat:typing:${chatId}`;

// Publish typing status to Redis
export async function publishTypingStatus(
  chatId: string,
  userId: string,
  isTyping: boolean,
): Promise<void> {
  try {
    if (isTyping) {
      // Set typing status with expiration (5 seconds)
      await redis.setex(
        `${TYPING_KEY(chatId)}:${userId}`,
        5,
        JSON.stringify({ userId, isTyping, timestamp: Date.now() }),
      );
    } else {
      // Remove typing status
      await redis.del(`${TYPING_KEY(chatId)}:${userId}`);
    }

    // Publish to channel for real-time updates
    await redis.lpush(
      TYPING_CHANNEL,
      JSON.stringify({
        chatId,
        userId,
        isTyping,
        timestamp: Date.now(),
      }),
    );

    // Keep channel list manageable
    await redis.ltrim(TYPING_CHANNEL, 0, 49);
  } catch (error) {
    console.error("Error publishing typing status:", error);
  }
}

// Get typing status for a chat
export async function getTypingStatus(
  chatId: string,
  excludeUserId?: string,
): Promise<{ userId: string; isTyping: boolean } | null> {
  try {
    const keys = await redis.keys(`${TYPING_KEY(chatId)}:*`);

    for (const key of keys) {
      const userId = key.split(":").pop();
      if (userId && userId !== excludeUserId) {
        const data = await redis.get(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.isTyping) {
            return { userId, isTyping: true };
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting typing status:", error);
    return null;
  }
}
