interface ChatMessage {
  role: 'User' | 'Assistant';
  content: string;
  timestamp: number;
}

interface Conversation {
  id: string;
  messages: ChatMessage[];
  lastUpdated: number;
}

interface ChatHistory {
  conversations: Record<string, Conversation>;
  lastUpdated: number;
}

export class ChatStorageManager {
  private storageKey = 'chat_history';

  async saveMessage(conversationId: string, message: ChatMessage) {
    const history = await this.getHistory();
    let updatedHistory: ChatHistory;

    if (history) {
      updatedHistory = history;
      if (!updatedHistory.conversations[conversationId]) {
        updatedHistory.conversations[conversationId] = {
          id: conversationId,
          messages: [],
          lastUpdated: Date.now()
        };
      }
    } else {
      updatedHistory = {
        conversations: {
          [conversationId]: {
            id: conversationId,
            messages: [],
            lastUpdated: Date.now()
          }
        },
        lastUpdated: Date.now()
      };
    }

    updatedHistory.conversations[conversationId].messages.push(message);
    updatedHistory.conversations[conversationId].lastUpdated = Date.now();
    updatedHistory.lastUpdated = Date.now();

    await chrome.storage.local.set({ [this.storageKey]: updatedHistory });
  }

  async getHistory(): Promise<ChatHistory | null> {
    const result = await chrome.storage.local.get(this.storageKey);
    return result[this.storageKey] || null;
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    const history = await this.getHistory();
    return history?.conversations[conversationId] || null;
  }

  async clearConversation(conversationId: string) {
    const history = await this.getHistory();
    if (history && history.conversations[conversationId]) {
      delete history.conversations[conversationId];
      await chrome.storage.local.set({ [this.storageKey]: history });
    }
  }

  async clearAllHistory() {
    await chrome.storage.local.remove(this.storageKey);
  }
}

export const chatStorage = new ChatStorageManager(); 