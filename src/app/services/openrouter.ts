import { API_KEY, API_URL } from "../config/api";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string | Array<{
    type: "text" | "image_url";
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
}

export interface ChatCompletionOptions {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

// Fallback models to try if primary fails (prioritize coding capability + reliability)
const FALLBACK_MODELS = [
  "anthropic/claude-3-haiku", // Fast + vision + reliable
  "openai/gpt-4o-mini", // Fast + vision + reliable
  "anthropic/claude-3.5-sonnet", // Elite coding + vision
  "openai/gpt-4-turbo", // Elite coding + vision
  "google/gemini-2.0-flash-exp:free", // Free with vision
  "meta-llama/llama-3.2-3b-instruct:free", // Free text-only fallback
];

// Enhanced system prompt for coding excellence
const SYSTEM_PROMPT = `You are Runner Code AI, an elite AI assistant with exceptional expertise in:

🚀 **PRIMARY FOCUS - CODING & TECHNOLOGY:**
- Expert-level programming in ALL languages (JavaScript, TypeScript, Python, Java, C++, Go, Rust, etc.)
- Modern frameworks and libraries (React, Vue, Angular, Node.js, Django, Flask, Spring, etc.)
- Software architecture, design patterns, and best practices
- Algorithms, data structures, and performance optimization
- DevOps, CI/CD, Docker, Kubernetes, cloud platforms (AWS, Azure, GCP)
- Databases (SQL, NoSQL, Redis, MongoDB, PostgreSQL)
- API design (REST, GraphQL, WebSocket)
- Security best practices and code review
- Testing (unit, integration, E2E)
- Git, version control, and collaboration tools

🌟 **EXCELLENCE IN ALL DOMAINS:**
- Mathematics, physics, science
- Business, finance, and analytics
- Creative writing and content creation
- General knowledge and problem-solving

💡 **YOUR CODING PRINCIPLES:**
1. Write PRODUCTION-QUALITY code with proper error handling
2. Follow industry best practices and clean code principles
3. Provide detailed explanations with code examples
4. Debug issues systematically with clear reasoning
5. Optimize for performance, readability, and maintainability
6. Include comments and documentation
7. Suggest improvements and alternatives
8. Stay updated with latest tech trends

📝 **RESPONSE STYLE:**
- Clear, professional, and comprehensive
- Code blocks with proper syntax highlighting
- Step-by-step explanations for complex topics
- Real-world examples and best practices
- Proactive suggestions for improvements

You can answer in English or Arabic based on user's language. Be precise, thorough, and exceptionally helpful.`;

export async function sendMessage(
  options: ChatCompletionOptions,
  onChunk?: (text: string) => void,
  retryCount: number = 0
): Promise<string> {
  const currentModel = retryCount === 0 ? options.model : FALLBACK_MODELS[Math.min(retryCount - 1, FALLBACK_MODELS.length - 1)];
  
  // Add system prompt if not already present (and not an internal AI analysis request)
  const messages = [...options.messages];
  const isInternalRequest = messages.some(m => 
    typeof m.content === 'string' && 
    (m.content.includes('Return ONLY') || m.content.includes('Answer with ONLY'))
  );
  
  if (!isInternalRequest && !messages.some(m => m.role === 'system')) {
    messages.unshift({
      role: 'system',
      content: SYSTEM_PROMPT
    });
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin || "https://runner-code.ai",
        "X-Title": "Runner Code AI",
      },
      body: JSON.stringify({
        model: currentModel,
        messages: messages, // Use enhanced messages with system prompt
        temperature: options.temperature || 0.3, // Lower temperature for precise coding
        max_tokens: options.max_tokens || 1024, // Balanced for code responses
        stream: options.stream !== false,
      }),
    });

    if (!response.ok) {
      let errorMessage = "Failed to send message";
      let errorDetails = null;
      try {
        const error = await response.json();
        errorDetails = error;
        errorMessage = error.error?.message || error.message || errorMessage;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      // Try fallback models if needed
      if (errorMessage.includes("Provider returned error") || errorMessage.includes("provider") || errorMessage.includes("No endpoints found") || errorMessage.includes("404")) {
        // Try fallback model automatically
        if (retryCount < 2) {
          return await sendMessage(options, onChunk, retryCount + 1);
        }
        
        if (errorMessage.includes("No endpoints found")) {
          errorMessage = "Model not available. Please try a different model or check OpenRouter status.";
        } else {
          errorMessage = "All models are temporarily unavailable. Please try again in a few moments.";
        }
      }
      
      throw new Error(errorMessage);
    }

    if (options.stream && onChunk) {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();
                if (data === "[DONE]") {
                  continue;
                }
                if (!data) continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullText += content;
                    onChunk(content);
                  }
                } catch (e) {
                  // Skip parsing errors for incomplete JSON
                  console.debug("Skipping invalid JSON chunk:", data.substring(0, 50));
                }
              }
            }
          }
        } catch (streamError) {
          console.error("❌ Stream reading error:", streamError);
          throw streamError;
        }
      }

      return fullText;
    } else {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      return content;
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred while sending the message");
  }
}
