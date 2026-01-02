export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  imageUrl?: string; // For displaying images in chat
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  createdAt: number;
  updatedAt: number;
}
