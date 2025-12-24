export const customChatFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
) => {
  const headers = new Headers(init?.headers);

  // iOS Safari fix: ensure proper streaming headers
  headers.set("Accept", "text/event-stream");
  headers.set("Cache-Control", "no-cache");

  return fetch(input, {
    ...init,
    headers,
    // CRITICAL: Ensure cookies are sent in PWA/Standalone mode
    credentials: "same-origin",
  });
};
