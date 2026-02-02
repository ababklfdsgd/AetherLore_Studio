import { GoogleGenAI } from "@google/genai";
import { AIProvider, AISettings } from "../types";
import { LORE_GENERATOR_SYSTEM_PROMPT } from "../constants";

export class AIService {
  private static getGeminiClient() {
    // Ideally user inputs this, but for this demo per system prompt instructions we use process.env
    // In a real desktop app, we'd ask the user to input this in settings.
    const apiKey = process.env.API_KEY || ''; 
    return new GoogleGenAI({ apiKey });
  }

  static async generateLore(settings: AISettings, prompt: string, existingContent: string = ''): Promise<string> {
    const fullPrompt = existingContent 
      ? `Continue the following lore entry based on this instruction: "${prompt}"\n\n[Existing Entry Start]\n${existingContent}\n[Existing Entry End]`
      : `Write a new lore entry based on: "${prompt}"`;

    if (settings.provider === AIProvider.GEMINI) {
      return this.generateWithGemini(settings, fullPrompt);
    } else if (settings.provider === AIProvider.NOVELAI) {
      return this.generateWithNovelAI(settings, fullPrompt);
    } else {
      return this.generateWithLocal(settings, fullPrompt);
    }
  }

  private static async generateWithGemini(settings: AISettings, prompt: string): Promise<string> {
    try {
      const ai = this.getGeminiClient();
      const response = await ai.models.generateContent({
        model: settings.geminiModelName,
        contents: prompt,
        config: {
          systemInstruction: LORE_GENERATOR_SYSTEM_PROMPT,
          temperature: settings.temperature,
          maxOutputTokens: settings.maxTokens,
        }
      });
      
      return response.text || "No response generated.";
    } catch (error) {
      console.error("Gemini Generation Error:", error);
      throw new Error(`Gemini API Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private static async generateWithNovelAI(settings: AISettings, prompt: string): Promise<string> {
    if (!settings.novelAiApiKey) {
      throw new Error("NovelAI API Key is missing in settings.");
    }

    try {
      // NovelAI uses a text completion endpoint. We prepend the system prompt context manually since it's not a chat model in the same way.
      const combinedInput = `[System: ${LORE_GENERATOR_SYSTEM_PROMPT}]\n\n${prompt}`;

      const response = await fetch("https://api.novelai.net/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${settings.novelAiApiKey}`
        },
        body: JSON.stringify({
          input: combinedInput,
          model: "kayra-v1", // Defaulting to Kayra as it's the most capable
          parameters: {
            use_string: true,
            temperature: settings.temperature,
            max_length: settings.maxTokens,
            // Standard preset values for good coherence
            top_p: 0.9,
            top_k: 40,
            tail_free_sampling: 0.968,
            repetition_penalty: 1.18,
            repetition_penalty_range: 2048,
            repetition_penalty_slope: 0.02
          }
        })
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Invalid NovelAI API Key.");
        throw new Error(`NovelAI API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.output || "No content returned from NovelAI.";
    } catch (error) {
      console.error("NovelAI Generation Error:", error);
      throw new Error(`NovelAI Connection Failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private static async generateWithLocal(settings: AISettings, prompt: string): Promise<string> {
    try {
      // Standard OpenAI-compatible format used by LMStudio, KoboldCPP, Text-Generation-WebUI
      const response = await fetch(`${settings.localBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: settings.localModelName,
          messages: [
            { role: "system", content: LORE_GENERATOR_SYSTEM_PROMPT },
            { role: "user", content: prompt }
          ],
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Local API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "No content returned from local AI.";
    } catch (error) {
       console.error("Local AI Generation Error:", error);
       throw new Error(`Local AI Connection Failed. Ensure KoboldCPP/LMStudio is running. Details: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}