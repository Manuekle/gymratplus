export const customChatFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
) => {
  const headers = new Headers(init?.headers);

  // iOS Safari fix: ensure proper streaming headers
  headers.set("Accept", "text/event-stream");
  headers.set("Cache-Control", "no-cache");

  const response = await fetch(input, {
    ...init,
    headers,
    // CRITICAL: Ensure cookies are sent in PWA/Standalone mode
    credentials: "same-origin",
  });

  // Check if response is HTML (login page redirect) usually indicated by 200 OK but text/html content
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("text/html")) {
    console.error(
      "❌ [Chat Fetch] Received HTML instead of JSON. Session likely expired.",
    );
    throw new Error(
      "Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
    );
  }

  return response;
};
