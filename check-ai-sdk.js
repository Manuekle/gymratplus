const { useChat } = require("@ai-sdk/react");
console.log("useChat is type:", typeof useChat);
try {
  // We can't really call the hook outside component, but we can check if it exists
  console.log("useChat exists");
} catch (e) {
  console.error(e);
}
