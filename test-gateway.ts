import { streamText } from "ai";
import "dotenv/config";

async function main() {
  console.log("🧪 Probando AI Gateway con GPT-5-nano...\n");

  const result = streamText({
    model: "openai/gpt-5-nano",
    prompt: "Explica en 2 oraciones qué es el entrenamiento de fuerza.",
  });

  console.log("📝 Respuesta:");
  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
  }

  console.log("\n");
  console.log("📊 Token usage:", await result.usage);
  console.log("✅ Finish reason:", await result.finishReason);
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});
