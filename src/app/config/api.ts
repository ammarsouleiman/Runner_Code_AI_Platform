// OpenRouter API Configuration
export const API_KEY = "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";
export const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Default model to use - Best balance of speed, cost, and quality
export const DEFAULT_MODEL = "openai/gpt-4o-mini";

// Available models - Premium coding-focused models at the top
export const AVAILABLE_MODELS = [
  // 🏆 PREMIUM CODING POWERHOUSES (Best for complex coding tasks)
  { id: "openai/gpt-4-turbo", name: "🏆 GPT-4 Turbo - Elite Coding (Vision)" },
  { id: "anthropic/claude-3.5-sonnet", name: "🏆 Claude 3.5 Sonnet - Elite Coding (Vision)" },
  { id: "openai/o1-mini", name: "🏆 OpenAI o1-mini - Advanced Reasoning" },
  
  // ⚡ FAST & AFFORDABLE (Great for most tasks) ⭐ RECOMMENDED
  { id: "openai/gpt-4o-mini", name: "⚡ GPT-4o Mini (Vision) ⭐ BEST VALUE" },
  { id: "anthropic/claude-3-haiku", name: "⚡ Claude 3 Haiku (Vision) Fast" },
  { id: "google/gemini-flash-1.5-8b", name: "⚡ Gemini Flash 1.5 8B Fast" },
  
  // 🆓 FREE OPTIONS (Limited features)
  { id: "meta-llama/llama-3.2-3b-instruct:free", name: "🆓 Llama 3.2 3B (Free, Text Only)" },
  { id: "google/gemini-2.0-flash-exp:free", name: "🆓 Gemini 2.0 Flash (Free Trial)" },
];

// Pexels API Configuration (for image generation)
export const PEXELS_API_KEY = "OMfpYQBueRaHVMMu7QKoqF4uPbO5iuJvTUHpfitMhFNDmHZ2pbSffE7Y";
export const PEXELS_API_URL = "https://api.pexels.com/v1/search";