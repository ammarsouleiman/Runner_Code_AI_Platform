import { Conversation } from "../types/chat";

const STORAGE_KEY = "runner-code-conversations";

export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error("Failed to save conversations:", error);
  }
}

export function loadConversations(): Conversation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load conversations:", error);
    return [];
  }
}

export function deleteConversation(conversationId: string): void {
  const conversations = loadConversations();
  const filtered = conversations.filter((c) => c.id !== conversationId);
  saveConversations(filtered);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function hasWelcomeFormBeenSubmitted(): boolean {
  try {
    return localStorage.getItem("runner-code-welcome-submitted") === "true";
  } catch (error) {
    console.error("Failed to check welcome form status:", error);
    return false;
  }
}
