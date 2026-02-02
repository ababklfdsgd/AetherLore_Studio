export enum EntryType {
  CHARACTER = 'CHARACTER',
  LOCATION = 'LOCATION',
  ITEM = 'ITEM',
  JOURNAL = 'JOURNAL'
}

export interface LoreEntry {
  id: string;
  title: string;
  keys: string[]; // Activation keys
  content: string;
  category: string;
  type: EntryType;
  image?: string; // Base64 string for portability
  lastUpdated: number;
}

export interface LoreBook {
  name: string;
  entries: LoreEntry[];
  categories: string[];
}

export enum AIProvider {
  GEMINI = 'GEMINI',
  LOCAL = 'LOCAL', // KoboldCPP, LM Studio, Ooba (OpenAI compatible)
  NOVELAI = 'NOVELAI'
}

export interface AISettings {
  provider: AIProvider;
  localBaseUrl: string; // e.g. http://localhost:5001/v1
  localModelName: string;
  geminiModelName: string;
  novelAiApiKey?: string;
  temperature: number;
  maxTokens: number;
}

export type AppTheme = 'midnight' | 'nebula' | 'parchment';

export interface AppSettings {
  theme: AppTheme;
  ai: AISettings;
}

export interface GenerationRequest {
  prompt: string;
  context?: string; // Existing content to append to
  type: 'continuation' | 'new_entry';
}