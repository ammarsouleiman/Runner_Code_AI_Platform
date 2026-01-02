import { useState, useEffect, useRef } from "react";
import { Sidebar } from "./components/Sidebar";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { WelcomeModal } from "./components/WelcomeModal";
import { Conversation, ChatMessage as ChatMessageType } from "./types/chat";
import { sendMessage } from "./services/openrouter";
import { searchPexelsImages } from "./services/pexels";
import { DEFAULT_MODEL } from "./config/api";
import {
  saveConversations,
  loadConversations,
  deleteConversation as deleteStoredConversation,
  generateId,
  hasWelcomeFormBeenSubmitted,
} from "./utils/storage";
import { Loader2, Menu } from "lucide-react";
import { Button } from "./components/ui/button";

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shownImageIds, setShownImageIds] = useState<Set<number>>(new Set());
  const [currentImagePage, setCurrentImagePage] = useState<Map<string, number>>(new Map());

  // Load conversations on mount
  useEffect(() => {
    const loaded = loadConversations();
    setConversations(loaded);
    if (loaded.length > 0) {
      setCurrentConversationId(loaded[0].id);
    }
  }, []);

  // Check if welcome form has been submitted on mount
  useEffect(() => {
    const hasSubmitted = hasWelcomeFormBeenSubmitted();
    if (!hasSubmitted) {
      // Small delay to ensure smooth animation
      setTimeout(() => {
        setShowWelcomeModal(true);
      }, 500);
    }
  }, []);

  // Save conversations when they change
  useEffect(() => {
    if (conversations.length > 0) {
      saveConversations(conversations);
    }
  }, [conversations]);

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  );

  // Auto-scroll to bottom with smooth animation - optimized for mobile
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      // Use requestAnimationFrame to prevent layout thrashing
      requestAnimationFrame(() => {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      });
    }
  }, [currentConversation?.messages.length, streamingMessage]);

  const handleNewChat = () => {
    const newConv: Conversation = {
      id: generateId(),
      title: "New Chat",
      messages: [],
      model: DEFAULT_MODEL,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations([newConv, ...conversations]);
    setCurrentConversationId(newConv.id);
    
    // Reset image memory for new conversation
    setShownImageIds(new Set());
    setCurrentImagePage(new Map());
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const handleDeleteConversation = (id: string) => {
    try {
      // Delete from localStorage
      deleteStoredConversation(id);
      
      // Filter out the deleted conversation
    const filtered = conversations.filter((c) => c.id !== id);
      
      // Update state
    setConversations(filtered);
      
      // If we deleted the current conversation, switch to another one
    if (currentConversationId === id) {
        const newCurrentId = filtered.length > 0 ? filtered[0].id : null;
        setCurrentConversationId(newCurrentId);
      }
      
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const analyzeUserIntent = async (userMessage: string, conversationHistory: ChatMessageType[] = []): Promise<boolean> => {
    try {
      
      // Build context from last 5 messages
      let contextText = "";
      const recentMessages = conversationHistory.slice(-5);
      
      if (recentMessages.length > 0) {
        contextText = "\n\nRecent conversation:\n";
        recentMessages.forEach((msg, idx) => {
          const role = msg.role === "user" ? "User" : "AI";
          const content = msg.content.substring(0, 150);
          contextText += `${idx + 1}. ${role}: ${content}\n`;
        });
      }
      
      const intentPrompt = `You are a highly intelligent AI that understands user intentions deeply. Your task is to determine if the user wants to SEE/VIEW/FIND/GENERATE any visual content (images/photos/pictures).

${contextText}

User's current message: "${userMessage}"

Analyze CAREFULLY and answer YES if ANY of these apply:

✅ Direct image requests:
- "show me cats", "اعرض قطط", "find sunset", "ابحث غروب"
- "create", "generate", "make", "draw", "انشئ", "اصنع"

✅ Indirect/implicit requests (VERY IMPORTANT):
- "I want to see X", "اريد اشوف X"
- "what does X look like", "كيف شكل X"
- "how does X appear", "كيف يبدو X"
- Asking about visual appearance of anything
- ANY question that needs visual answer

✅ Context-based (referring to previous):
- "more", "another", "different", "المزيد", "غيرها", "كمل"
- If previously discussing images, and user continues

✅ Subject alone (if makes sense visually):
- Just naming things that are typically viewed: "cats", "sunset", "قطط", "غروب"
- Single words referring to visual subjects

❌ Answer NO only if:
- Clear text conversation (questions about concepts, coding, math)
- Personal/philosophical questions
- Requests for information that don't need visuals

THINK: Would showing images be the NATURAL response to this message?

Answer with ONLY: YES or NO`;

      const response = await sendMessage(
        {
          model: DEFAULT_MODEL,
          messages: [{ role: "user", content: intentPrompt }],
          stream: false,
          temperature: 0.1, // Very low temperature for quick, deterministic responses
          max_tokens: 10, // Only need "YES" or "NO"
        }
      );

      const answer = response.trim().toUpperCase();
      
      const isImageRequest = answer.includes("YES");
      
      return isImageRequest;
    } catch (error) {
      // Smart fallback with broader detection
      const userLower = userMessage.toLowerCase().trim();
      
      // Check for image-related words (broader)
      const visualWords = /\b(image|photo|picture|pic|صورة|صور|visual|view|see|show|display|look|find|search|create|generate|make|draw|design|اعرض|اجلب|انشئ|اصنع|ارسم|شوف|وريني|اريد|كيف.*شكل|ما.*شكل|more|another|different|المزيد|غيرها|كمل|تاني|ثاني)\b/i;
      
      // Check for "want to see/know about" patterns
      const wantToSeePattern = /(want to see|want.*see|wanna see|اريد.*اشوف|بدي.*شوف|نفسي.*اشوف|اريد.*اعرف.*عن)/i;
      
      // Check for "what/how does X look like"
      const appearancePattern = /(what.*look|how.*look|what.*appear|how.*appear|كيف.*شكل|ما.*شكل|شو.*شكل)/i;
      
      // If previous messages were about images and user continues
      const hasRecentImages = conversationHistory.some((msg: ChatMessageType) => 
        msg.role === "assistant" && (msg.content.includes("![") || msg.content.includes("Image"))
      );
      const continueWords = /\b(more|another|different|else|المزيد|غيرها|كمل|تاني|ثاني|غير)\b/i;
      
      const result = visualWords.test(userLower) || 
                    wantToSeePattern.test(userLower) || 
                    appearancePattern.test(userLower) ||
                    (hasRecentImages && continueWords.test(userLower));
      
      return result;
    }
  };

  const handleImageSearch = async (userMessage: string, query: string) => {
    // Create or get current conversation
    let workingConversation = currentConversation;
    
    if (!workingConversation) {
      const newConv: Conversation = {
        id: generateId(),
        title: userMessage.slice(0, 50) || "AI Image Generation",
        messages: [],
        model: DEFAULT_MODEL,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      workingConversation = newConv;
      setConversations([newConv, ...conversations]);
      setCurrentConversationId(newConv.id);
    }

    // Add user message
    const userMessageObj: ChatMessageType = {
      id: generateId(),
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    };

    // Update conversation with user message first
    setConversations((prevConvs) => {
      const updated = prevConvs.map((c) => {
        if (c.id === workingConversation!.id) {
          return {
            ...c,
            messages: [...c.messages, userMessageObj],
            title: c.messages.length === 0 ? userMessage.slice(0, 50) || "AI Image Generation" : c.title,
            updatedAt: Date.now(),
          };
        }
        return c;
      });
      
      // If new conversation, add it
      if (!prevConvs.find(c => c.id === workingConversation!.id)) {
        return [{ ...workingConversation!, messages: [userMessageObj] }, ...updated];
      }
      return updated;
    });

    
    // Detect user's language for loading message
    const isArabic = /[\u0600-\u06FF]/.test(userMessage);
    
    setIsLoading(true);
    setStreamingMessage(isArabic ? "🧠 أفهم ما تريد رؤيته..." : "🧠 Understanding what you want to see...");

    try {
      // Step 1: Use AI to analyze the request WITH conversation context
      
      // Build conversation context
      let contextMessages = "";
      const recentMessages = workingConversation.messages.slice(-6); // Last 6 messages
      
      if (recentMessages.length > 0) {
        contextMessages = "\n\nConversation history:\n";
        recentMessages.forEach((msg, idx) => {
          const role = msg.role === "user" ? "User" : "AI";
          const content = msg.content.substring(0, 150);
          contextMessages += `${idx + 1}. ${role}: ${content}\n`;
        });
      }
      
      const analysisPrompt = `You are an expert AI image analyzer with deep understanding of natural language, conversation context, and implicit user intentions.

${contextMessages}

Current user message: "${userMessage}"

CONTEXT ANALYSIS:
The user wants to see images. Analyze the ENTIRE conversation history and current message to deeply understand:
1. WHAT do they want to see (subject)
2. HOW MANY images (count)
3. WHAT STYLE (if specified)

CRITICAL THINKING RULES:

1. EXTRACT THE SUBJECT (what to show):
   - Direct: "show me cats" → cats
   - Indirect: "I want to see mountains" → mountains
   - Question: "what do sunsets look like" → sunsets
   - Arabic: "اريد اشوف قطط" → cats, "كيف شكل الغروب" → sunset
   - Just subject: "cats" → cats, "غروب" → sunset
   - From context: If user says "more"/"المزيد" → use PREVIOUS subject

2. EXTRACT THE COUNT (how many):
   - Look for numbers: "3 cats", "5 more", "صورتين"
   - English numbers: one/1, two/2, three/3, four/4, five/5, six/6
   - Arabic numbers: واحد=1, اثنين/صورتين=2, ثلاثة=3, أربعة=4, خمسة=5, ستة=6
   - Default: 1 if not specified
   - Maximum: 6

3. EXTRACT THE STYLE:
   - Look for style words: modern, vintage, artistic, beautiful, etc.
   - Default: "photorealistic"

4. DEEP CONTEXT AWARENESS (VERY IMPORTANT):
   - Look at conversation history to understand user intent
   - If they previously asked for a subject and now asking again → likely want SAME subject
   - If they seem unsatisfied or want alternatives → same subject, different images
   - If asking follow-up questions → related to same subject
   - If completely new topic/subject → new subject
   
5. UNDERSTANDING IMPLICIT REQUESTS:
   - User might not use specific words but context shows what they want
   - Examples:
     * [Previous: showed cats] User: "لا بدي غيرو" → wants different subject (NOT cats)
     * [Previous: showed cats] User: "ممتاز" then asks something → probably wants same/related
     * [Previous: showed sunset] User: "حلو، بس..." → wants variations of sunset
     * User asks without specific keywords → analyze context deeply
   
6. SMART SUBJECT DETECTION:
   - If user doesn't mention subject explicitly, check conversation
   - If previous messages were about a subject, assume continuation
   - Use context clues to determine the subject

Return ONLY a JSON object (no other text):

{
  "subject": "main subject in English (2-4 keywords)",
  "count": 1-6,
  "style": "photorealistic or specified style"
}

REAL EXAMPLES WITH CONTEXT:

Simple requests:
"cats" → {"subject": "cats", "count": 1, "style": "photorealistic"}
"I want to see 3 mountains" → {"subject": "mountains", "count": 3, "style": "photorealistic"}

Questions:
"كيف شكل الغروب" → {"subject": "sunset", "count": 1, "style": "photorealistic"}
"what do oceans look like" → {"subject": "ocean", "count": 1, "style": "photorealistic"}

With context - continuation (SAME subject):
[Previous: User asked for cats, AI showed cats]
User: "حلو، بدي كمان" → {"subject": "cats", "count": 1, "style": "photorealistic"}
User: "ممتاز بس بدي غيرو" → {"subject": "cats", "count": 1, "style": "photorealistic"}
User: "طيب" → {"subject": "cats", "count": 1, "style": "photorealistic"}

With context - NEW subject:
[Previous: User asked for cats, AI showed cats]
User: "لا بدي غروب" → {"subject": "sunset", "count": 1, "style": "photorealistic"}
User: "no, show me mountains instead" → {"subject": "mountains", "count": 1, "style": "photorealistic"}

Implicit/vague requests (use context):
[Previous: discussing cats]
User: "بدي اشوف" → {"subject": "cats", "count": 1, "style": "photorealistic"}
User: "اعطني كمان واحدة" → {"subject": "cats", "count": 1, "style": "photorealistic"}

Return ONLY the JSON object:`;

      let analysisResult = { subject: "image", count: 1, style: "photorealistic" };
      
      try {
        const aiAnalysis = await sendMessage(
          {
            model: DEFAULT_MODEL,
            messages: [{ role: "user", content: analysisPrompt }],
            stream: false,
          }
        );

        // Try to extract JSON from response
        const jsonMatch = aiAnalysis.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        
        // Smart fallback: extract subject from message
        let subject = userMessage.toLowerCase().trim();
        
        // Remove common words
        const wordsToRemove = [
          'show', 'me', 'find', 'search', 'for', 'get', 'display', 'i', 'want', 'to', 'see',
          'give', 'can', 'you', 'fetch', 'look', 'create', 'generate', 'make', 'draw',
          'image', 'images', 'photo', 'photos', 'picture', 'pictures', 'pic', 'pics',
          'of', 'a', 'an', 'the', 'some', 'at', 'what', 'does', 'do', 'how', 'is', 'are',
          'اعرض', 'اجلب', 'ابحث', 'اريد', 'أريد', 'اعطني', 'أعطني', 'احضر', 'وريني',
          'بدي', 'شوف', 'اشوف', 'كيف', 'شكل', 'ما', 'شو',
          'صورة', 'صور', 'صوره', 'لي', 'عن', 'من', 'في', 'ل'
        ];
        
        wordsToRemove.forEach(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          subject = subject.replace(regex, ' ');
        });
        
        // Clean up
        subject = subject.replace(/\s+/g, ' ').trim();
        
        // Extract numbers
        const numberMatch = subject.match(/\d+/);
        const count = numberMatch ? Math.min(parseInt(numberMatch[0]), 6) : 1;
        
        // Remove numbers from subject
        subject = subject.replace(/\d+/g, '').trim();
        
        // If empty, use default
        if (!subject || subject.length < 2) {
          subject = "nature";
        }
        
        analysisResult = { subject, count, style: "photorealistic" };
      }

      // Ensure count is within limits
      const imageCount = Math.min(Math.max(analysisResult.count || 1, 1), 6);
      const searchQuery = analysisResult.subject || query;
      
      // Use AI to intelligently determine if user wants DIFFERENT images
      
      let isDifferentRequest = false;
      
      if (recentMessages.length > 0 && currentImagePage.has(searchQuery)) {
        // We have shown images for this subject before
        try {
          const intentPrompt = `You are an AI that understands user intentions deeply.

Previous conversation context:
${recentMessages.slice(-4).map((m, i) => `${i+1}. ${m.role === "user" ? "User" : "AI"}: ${m.content.substring(0, 100)}`).join('\n')}

Current user message: "${userMessage}"
Subject they want: ${searchQuery}

IMPORTANT: We have ALREADY shown ${searchQuery} images to this user before.

Question: Does the user want to see DIFFERENT/NEW ${searchQuery} images (not the same ones)?

Answer YES if:
- They want different/new/other images of the same subject
- They're not satisfied with previous ones
- They want variety or alternatives
- ANY indication they want to see different versions
- Context suggests they want fresh content

Answer NO if:
- This seems like a completely NEW request (first time asking)
- They're asking about a different subject entirely
- No indication of wanting variation

Answer with ONLY: YES or NO`;

          const aiResponse = await sendMessage(
            {
              model: DEFAULT_MODEL,
              messages: [{ role: "user", content: intentPrompt }],
              stream: false,
            }
          );

          isDifferentRequest = aiResponse.trim().toUpperCase().includes("YES");
        } catch (error) {
          // Fallback: check if this is a continuation request
          isDifferentRequest = recentMessages.length >= 2;
        }
      }
      
      // Get the current page for this subject
      const currentPage = currentImagePage.get(searchQuery) || 1;
      const nextPage = isDifferentRequest ? currentPage + 1 : 1;

      // Use isArabic from line 251 for streaming message
      const imageWord = imageCount > 1 ? (isArabic ? 'صور' : 'images') : (isArabic ? 'صورة' : 'image');
      const differentWord = isDifferentRequest ? (isArabic ? 'مختلفة' : 'different') : (isArabic ? 'رائعة' : 'stunning');
      
      setStreamingMessage(
        isArabic 
          ? `🎨 أنشئ ${imageCount} ${imageWord} ${differentWord} لك...`
          : `🎨 Creating ${imageCount} ${differentWord} ${imageWord} for you...`
      );
      
      // Step 2: Generate images using the analyzed query with page number
      const photos = await searchPexelsImages(searchQuery, imageCount, nextPage);

      // Update the page number for this subject
      setCurrentImagePage(prev => new Map(prev).set(searchQuery, nextPage));
      // Store shown image IDs to avoid repeats
      const newShownIds = new Set(shownImageIds);
      photos.forEach(photo => newShownIds.add(photo.id));
      setShownImageIds(newShownIds);

      if (photos.length === 0) {
        throw new Error("No images generated");
      }

      // Step 3: Create professional AI-generated response (using isArabic from above)
      let responseContent = '';
      
      if (isDifferentRequest) {
        // User asked for different/more images
        if (isArabic) {
          responseContent = photos.length === 1 
            ? `✨ **إليك صورة ${searchQuery} مختلفة:**\n\n`
            : `✨ **وجدت لك ${photos.length} صور ${searchQuery} جديدة:**\n\n`;
        } else {
          responseContent = photos.length === 1
            ? `✨ **Here's a different ${searchQuery} for you:**\n\n`
            : `✨ **I found ${photos.length} NEW ${searchQuery} images for you:**\n\n`;
        }
      } else {
        // First time or new subject
        if (isArabic) {
          responseContent = photos.length === 1
            ? `✨ **إليك ما طلبت:**\n\n`
            : `✨ **وجدت لك ${photos.length} صور مثالية:**\n\n`;
        } else {
          responseContent = photos.length === 1
            ? `✨ **Here's what you asked for:**\n\n`
            : `✨ **I found ${photos.length} perfect images for you:**\n\n`;
        }
      }
      
      // Add images with professional presentation
      photos.forEach((photo, index) => {
        if (photos.length > 1) {
          responseContent += isArabic 
            ? `### صورة ${index + 1}\n\n`
            : `### Image ${index + 1}\n\n`;
        }
        responseContent += `![${searchQuery}](${photo.src.large})\n\n`;
      });
      
      // Add professional AI signature in user's language
      responseContent += `---\n\n`;
      
      if (isArabic) {
        responseContent += `**🤖 مدعوم بـ Runner Code AI Vision**\n\n`;
        responseContent += `📊 *التحليل:*\n`;
        responseContent += `• الموضوع: ${searchQuery}\n`;
        responseContent += `• الصور: ${photos.length}${isDifferentRequest ? ' (جديدة/مختلفة)' : ''}\n`;
        responseContent += `• النمط: ${analysisResult.style === 'photorealistic' ? 'واقعي' : analysisResult.style}\n\n`;
        responseContent += `💡 *تريد صور مختلفة؟ قل فقط: "بدي غيرها" أو "المزيد" أو "اعرض ${searchQuery} أكثر"*`;
      } else {
        responseContent += `**🤖 Powered by Runner Code AI Vision**\n\n`;
        responseContent += `📊 *Analysis:*\n`;
        responseContent += `• Subject: ${searchQuery}\n`;
        responseContent += `• Images: ${photos.length}${isDifferentRequest ? ' (New/Different)' : ''}\n`;
        responseContent += `• Style: ${analysisResult.style || 'Photorealistic'}\n\n`;
        responseContent += `💡 *Want different ones? Just say: "different" or "show me more ${searchQuery}"*`;
      }

      const assistantMessage: ChatMessageType = {
        id: generateId(),
        role: "assistant",
        content: responseContent,
        timestamp: Date.now(),
      };

      // Add AI response to conversation
      setConversations((prev) =>
        prev.map((c) =>
          c.id === workingConversation!.id
            ? {
                ...c,
                messages: [...c.messages, assistantMessage],
                updatedAt: Date.now(),
              }
            : c
        )
      );

    } catch (error) {
      const errorContent = `**Runner Code AI Vision** is currently under maintenance.

Please try again in a few moments.`;
      
      const errorMessage: ChatMessageType = {
        id: generateId(),
        role: "assistant",
        content: errorContent,
        timestamp: Date.now(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === workingConversation!.id
            ? {
                ...c,
                messages: [...c.messages, errorMessage],
                updatedAt: Date.now(),
              }
            : c
        )
      );
    } finally {
      setIsLoading(false);
      setStreamingMessage("");
    }
  };

  const handleSendMessage = async (content: string, image?: File) => {
    // Trim and validate input
    const trimmedContent = content.trim();
    if (!trimmedContent && !image) {
      return;
    }

    // Quick pre-check: Only use AI analysis if there are clear image-related indicators
    if (!image) {
      const userLower = trimmedContent.toLowerCase().trim();
      
      // Fast pattern check for obvious image requests
      const obviousImageWords = /\b(image|photo|picture|pic|صورة|صور|show me|اعرض|generate|create|انشئ|اصنع|draw|ارسم)\b/i;
      const hasRecentImages = currentConversation?.messages.some(msg => 
        msg.role === "assistant" && (msg.content.includes("![") || msg.content.includes("Powered by Runner Code AI Vision"))
      );
      const continueWords = /\b(more|another|different|المزيد|غيرها|كمل)\b/i;
      
      // Only run AI analysis if there's a strong indicator
      const shouldCheckWithAI = obviousImageWords.test(userLower) || 
                                (hasRecentImages && continueWords.test(userLower));
      
      if (shouldCheckWithAI) {
        try {
          const conversationHistory = currentConversation?.messages || [];
          const isImageRequest = await analyzeUserIntent(trimmedContent, conversationHistory);
          
          if (isImageRequest) {
            await handleImageSearch(trimmedContent, trimmedContent);
            return;
          }
        } catch (error) {
          // Continue with normal message flow if AI check fails
        }
      }
    }

    // Create or get current conversation
    let workingConversation = currentConversation;
    
    if (!workingConversation) {
      // Create new conversation directly
      const newConv: Conversation = {
        id: generateId(),
        title: trimmedContent.slice(0, 50) || (image ? "Image Analysis" : "New Chat"),
        messages: [],
        model: DEFAULT_MODEL,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      workingConversation = newConv;
      setConversations([newConv, ...conversations]);
      setCurrentConversationId(newConv.id);
    }

    // Convert image to base64 if provided
    let imageBase64 = "";
    if (image) {
      try {
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(image);
        });
      } catch (error) {
        console.error('Error converting image to base64:', error);
      }
    }

    // Prepare message content
    let messageContent = trimmedContent || "What's in this image?";
    if (image && !imageBase64) {
      const imageName = image?.name || 'uploaded image';
      messageContent += `\n\n[Image: ${imageName}]`;
    }

    const userMessage: ChatMessageType = {
      id: generateId(),
      role: "user",
      content: messageContent,
      timestamp: Date.now(),
      imageUrl: imageBase64 || undefined, // Store image for display
    };

    // Update conversation with user message
    const updatedConversation = {
      ...workingConversation,
      messages: [...workingConversation.messages, userMessage],
      title:
        workingConversation.messages.length === 0
          ? trimmedContent.slice(0, 50) || "New Chat"
          : workingConversation.title,
      updatedAt: Date.now(),
    };

    setConversations((prevConvs) =>
      prevConvs.map((c) =>
        c.id === workingConversation!.id ? updatedConversation : c
      )
    );


    setIsLoading(true);
    setStreamingMessage("");

    try {
      // Prepare messages with image support
      const messages = updatedConversation.messages.map((m) => {
        if (m.role === "user" && m.content.includes("[Image:")) {
          // This is a message with an image, but we don't have the base64 anymore
          return {
            role: m.role,
            content: m.content.replace(/\[Image:.*?\]/g, "").trim(),
          };
        }
        return {
          role: m.role,
          content: m.content,
        };
      });

      // Add image to the last message if present
      if (imageBase64) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === "user") {
          (lastMessage as any).content = [
            {
              type: "text",
              text: lastMessage.content as string,
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64,
              },
            },
          ];
        }
      }

      let fullResponse = "";
      let hasStartedStreaming = false;
      
      const response = await sendMessage(
        {
          model: updatedConversation.model,
          messages,
          stream: true,
        },
        (chunk) => {
          if (!hasStartedStreaming) {
            hasStartedStreaming = true;
            setIsLoading(false); // Stop showing "thinking" once we get first chunk
          }
          fullResponse += chunk;
          setStreamingMessage(fullResponse);
        }
      );


      const assistantMessage: ChatMessageType = {
        id: generateId(),
        role: "assistant",
        content: response || fullResponse,
        timestamp: Date.now(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === workingConversation!.id
            ? {
                ...c,
                messages: [...c.messages, assistantMessage],
                updatedAt: Date.now(),
              }
            : c
        )
      );
    } catch (error) {
      // Simple, professional error message - no technical details exposed to user
      const userFriendlyMessage = `**Runner Code AI Model** is currently under maintenance.

Please try again in a few moments.`;
      
      const errorMessage: ChatMessageType = {
        id: generateId(),
        role: "assistant",
        content: userFriendlyMessage,
        timestamp: Date.now(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === workingConversation!.id
            ? {
                ...c,
                messages: [...c.messages, errorMessage],
                updatedAt: Date.now(),
              }
            : c
        )
      );
    } finally {
      setIsLoading(false);
      setStreamingMessage("");
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Welcome Modal - Shows only on first visit */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />

      {/* Mobile overlay with blur */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-all duration-300 ease-out ${
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
          onNewChat={() => {
            handleNewChat();
            setIsSidebarOpen(false);
          }}
          onSelectConversation={(id) => {
            handleSelectConversation(id);
            setIsSidebarOpen(false);
          }}
        onDeleteConversation={handleDeleteConversation}
      />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full relative">
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 sm:py-4 border-b border-border bg-background shadow-sm sticky top-0 z-30">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex-shrink-0 hover:bg-primary/10 rounded-xl transition-all duration-200"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold truncate">Runner Code AI</h1>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
          </div>
        </div>

        {!currentConversation || currentConversation.messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-6">
            {currentConversation.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
              {(streamingMessage || isLoading) && (
                <div className="flex gap-3 sm:gap-4 p-4 sm:p-6 bg-card/50">
                <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground animate-spin" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                    {streamingMessage ? (
                      <div className="prose prose-sm sm:prose-base prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm sm:text-base text-foreground break-words leading-relaxed">
                      {streamingMessage}
                    </pre>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm">Runner Code AI is thinking...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Spacing at bottom */}
              <div className="h-4"></div>
              </div>
          </div>
        )}

        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
