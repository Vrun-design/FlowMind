import type { ChatMessage } from '@/services/aiService';

const STORAGE_KEY_PREFIX = 'ofk_chat_history_';
const MAX_MESSAGES = 40;

function storageKey(diagramId: string): string {
  return `${STORAGE_KEY_PREFIX}${diagramId}`;
}

export function loadChatHistory(diagramId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(storageKey(diagramId));
    if (!raw) return [];
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [];
  }
}

export function saveChatHistory(diagramId: string, messages: ChatMessage[]): void {
  try {
    const trimmed = messages.slice(-MAX_MESSAGES);
    localStorage.setItem(storageKey(diagramId), JSON.stringify(trimmed));
  } catch {
    // localStorage may be full or unavailable — fail silently
  }
}

export function clearChatHistory(diagramId: string): void {
  try {
    localStorage.removeItem(storageKey(diagramId));
  } catch {
    // fail silently
  }
}
