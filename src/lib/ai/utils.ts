import type { UIMessage } from "ai";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function generateUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export function getMostRecentUserMessage(messages: UIMessage[]) {
    const userMessages = messages.filter((message) => message.role === "user");
    return userMessages.at(-1);
}

export function convertToUIMessages(
    messages: Array<{
        id: string;
        role: string;
        content: string | null;
        createdAt: Date;
        toolInvocations?: any;
    }>,
): UIMessage[] {
    return messages.map((message) => {
        const msg = message as any;
        return {
            id: msg.id,
            role: msg.role,
            content: msg.content || "",
            parts: [
                { type: "text", text: msg.content || "" },
                ...(msg.toolInvocations?.map((t: any) => ({
                    type: "tool-invocation",
                    toolInvocation: t,
                })) || []),
            ] as any[],
            createdAt: msg.createdAt,
            toolInvocations: msg.toolInvocations,
        } as any;
    });
}

export function getTextFromMessage(message: UIMessage): string {
    return (message as any).content || "";
}
