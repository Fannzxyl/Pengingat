import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// FIX: Initialize GoogleGenAI with a named apiKey parameter as required.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * A basic text generation function.
 * @param prompt The user's prompt.
 * @returns The generated text response.
 */
export async function generateText(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            // FIX: Use the recommended 'gemini-2.5-flash' model for general text tasks.
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        // FIX: Directly access the .text property for the response string.
        return response.text;
    } catch (error) {
        console.error("Error generating text:", error);
        return "Sorry, I encountered an error while processing your request.";
    }
}

/**
 * Analyzes an image and returns a text description.
 * @param base64ImageData The base64 encoded image data.
 * @param mimeType The MIME type of the image.
 * @param prompt The text prompt to accompany the image.
 * @returns The generated text response.
 */
export async function analyzeImage(base64ImageData: string, mimeType: string, prompt: string): Promise<string> {
    try {
        const imagePart = {
            inlineData: {
                data: base64ImageData,
                mimeType: mimeType,
            },
        };
        const textPart = { text: prompt };

        const response: GenerateContentResponse = await ai.models.generateContent({
            // FIX: Use the recommended 'gemini-2.5-flash' model for multimodal tasks.
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });
        
        // FIX: Directly access the .text property for the response string.
        return response.text;
    } catch (error) {
        console.error("Error analyzing image:", error);
        return "Sorry, I couldn't analyze the image.";
    }
}


/**
 * Manages a chat session with the Gemini model.
 */
class ChatSession {
    private chat: Chat;

    constructor(systemInstruction?: string) {
        this.chat = ai.chats.create({
            // FIX: Use the recommended 'gemini-2.5-flash' model for chat.
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction || 'You are a helpful assistant integrated into a personal memory vault app called Aura.',
            },
        });
    }

    /**
     * Sends a message to the chat and gets a streaming response.
     * @param message The user's message.
     * @param onChunk Callback for each streamed chunk of the response.
     */
    async sendMessageStream(
        message: string,
        onChunk: (chunk: string) => void,
    ): Promise<void> {
        try {
            const responseStream = await this.chat.sendMessageStream({ message });
            for await (const chunk of responseStream) {
                // FIX: Directly access the .text property for the response string.
                onChunk(chunk.text);
            }
        } catch (error) {
            console.error("Error in streaming chat:", error);
            onChunk("Sorry, an error occurred.");
        }
    }
}

// Export a singleton instance of the chat session
export const aiChat = new ChatSession();
