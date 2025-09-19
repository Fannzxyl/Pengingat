import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY tidak ditemukan di .env");
}

const genAI = new GoogleGenerativeAI(apiKey);

// ------- TEXT -------
export async function generateText(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("generateText error:", err);
    return "Error saat generate teks.";
  }
}

// ------- IMAGE + TEXT -------
export async function analyzeImage(
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      { inlineData: { data: base64ImageData, mimeType } },
      { text: prompt },
    ]);
    return result.response.text();
  } catch (err) {
    console.error("analyzeImage error:", err);
    return "Error saat analisa gambar.";
  }
}

// ------- CHAT -------
export function createChat() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const chat = model.startChat({
    history: [],
    generationConfig: { maxOutputTokens: 512 },
  });

  const sendMessage = async (message: string): Promise<string> => {
    try {
      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (err) {
      console.error("chat sendMessage error:", err);
      return "Error saat kirim pesan.";
    }
  };

  const sendMessageStream = async (
    message: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> => {
    if (typeof (chat as any).sendMessageStream === "function") {
      try {
        const streamResult = await (chat as any).sendMessageStream(message);
        let fullText = "";

        for await (const chunk of streamResult.stream) {
          const text = typeof chunk?.text === "function" ? chunk.text() : "";
          if (!text) {
            continue;
          }

          fullText += text;
          onChunk?.(text);
        }

        const response = await streamResult.response;
        const responseText = typeof response?.text === "function" ? response.text() : "";
        if (!fullText && responseText) {
          fullText = responseText;
          onChunk?.(responseText);
        }

        return fullText;
      } catch (err) {
        console.error("chat sendMessageStream error:", err);
        const fallbackMessage = "Error saat kirim pesan.";
        onChunk?.(fallbackMessage);
        return fallbackMessage;
      }
    }

    const fallback = await sendMessage(message);
    onChunk?.(fallback);
    return fallback;
  };

  return {
    sendMessage,
    sendMessageStream,
  };
}

// Export instance bernama aiChat supaya import lama tetap berjalan
export const aiChat = createChat();
