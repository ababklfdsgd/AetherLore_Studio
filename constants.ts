import { AIProvider, AppSettings, LoreBook, EntryType } from "./types";

export const DEFAULT_LOREBOOK: LoreBook = {
  name: "New World",
  categories: ["Characters", "Locations", "History", "Items", "Factions"],
  entries: [
    {
      id: "entry-1",
      title: "The Crystal Spire",
      keys: ["spire", "crystal", "tower"],
      content: "The Crystal Spire stands in the center of the Eternal City. It is said to focus the ley lines of the world, providing endless magical energy to the citizens below.",
      category: "Locations",
      type: EntryType.LOCATION,
      lastUpdated: Date.now()
    }
  ]
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'midnight',
  ai: {
    provider: AIProvider.GEMINI,
    localBaseUrl: "http://localhost:5001/v1", // Common default for KoboldCPP
    localModelName: "model", // Often ignored by local backends, but required by API
    geminiModelName: "gemini-3-flash-preview",
    novelAiApiKey: "",
    temperature: 0.7,
    maxTokens: 500,
  }
};

// System instruction for lore generation
export const LORE_GENERATOR_SYSTEM_PROMPT = `You are a creative writing assistant specializing in world-building and lore creation. 
Your task is to generate detailed, evocative, and consistent lore entries for a fictional world. 
Focus on sensory details, historical context, and interesting hooks. 
Format your output as clean text suitable for a wiki entry or RPG sourcebook. 
Do not surround the output with quotes.`;